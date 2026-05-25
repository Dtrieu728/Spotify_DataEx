import os
import sqlite3
from contextlib import contextmanager
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv(override=True)

DB_PATH = "Database/spotify.db"
_sp = None


def get_spotify_client():
    global _sp
    if _sp is None:
        _sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIPY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
            redirect_uri="http://127.0.0.1:5000/callback",
            # redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
            scope="user-library-read user-top-read playlist-read-private",
            cache_path=".spotifycache",
        ))
    return _sp


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def create_tables():
    with get_db() as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS top_songs (
                user_id TEXT, song_name TEXT, artist_name TEXT,
                album_name TEXT, release_date TEXT, duration_ms INTEGER,
                fetched_at TEXT,
                UNIQUE(user_id, song_name, artist_name)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS top_artists (
                user_id TEXT, artist_name TEXT, fetched_at TEXT,
                UNIQUE(user_id, artist_name)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS top_albums (
                user_id TEXT, album_name TEXT, artist_name TEXT, fetched_at TEXT,
                UNIQUE(user_id, album_name, artist_name)
            )
        """)


def get_song_data(sp, limit=20):
    user_id = sp.current_user()['id']
    tracks = sp.current_user_top_tracks(limit=limit)['items']

    results = []
    with get_db() as conn:
        c = conn.cursor()
        for t in tracks:
            artists = ", ".join(a['name'] for a in t['artists'])
            album = t['album']['name']
            release_date = t['album']['release_date']
            duration_ms = t['duration_ms']
            c.execute("""
                INSERT OR REPLACE INTO top_songs
                (user_id, song_name, artist_name, album_name, release_date, duration_ms, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (user_id, t['name'], artists, album, release_date, duration_ms))
            results.append({
                "name": t['name'], "artist": artists,
                "album": album, "release_date": release_date, "duration_ms": duration_ms,
            })
    return results


def get_top_artists(sp, limit=20):
    user_id = sp.current_user()['id']
    artists = sp.current_user_top_artists(limit=limit)['items']

    with get_db() as conn:
        c = conn.cursor()
        for a in artists:
            c.execute("""
                INSERT OR IGNORE INTO top_artists (user_id, artist_name, fetched_at)
                VALUES (?, ?, datetime('now'))
            """, (user_id, a['name']))
    return [{"name": a['name']} for a in artists]


def get_top_albums(sp, limit=20):
    user_id = sp.current_user()['id']
    tracks = sp.current_user_top_tracks(limit=limit)['items']

    with get_db() as conn:
        c = conn.cursor()
        for t in tracks:
            album = t['album']
            artists = ", ".join(a['name'] for a in album['artists'])
            c.execute("""
                INSERT OR IGNORE INTO top_albums (user_id, album_name, artist_name, fetched_at)
                VALUES (?, ?, ?, datetime('now'))
            """, (user_id, album['name'], artists))
    return [{"name": t['album']['name'], "artist": ", ".join(a['name'] for a in t['album']['artists'])} for t in tracks]