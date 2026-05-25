import os
import sqlite3
from contextlib import contextmanager
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv(override=True)

DB_PATH = "Database/spotify.db"
_sp = None
_user_id = None


def get_spotify_client():
    global _sp, _user_id
    if _sp is None:
        _sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
            client_id=os.getenv("SPOTIPY_CLIENT_ID"),
            client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
            redirect_uri=os.getenv("SPOTIPY_REDIRECT_URI"),
            scope="user-library-read user-top-read playlist-read-private",
            cache_path=".spotifycache",
        ))
        _user_id = _sp.current_user()['id']
    return _sp, _user_id


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
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
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


def get_song_data(sp, user_id, limit=20):
    response = sp.current_user_top_tracks(limit=limit)
    tracks = response.get('items')
    if not tracks:
        return [], []

    song_results = []
    album_results = []

    with get_db() as conn:
        c = conn.cursor()
        for t in tracks:
            artists = ", ".join(a['name'] for a in t['artists'])
            album = t['album']['name']
            release_date = t['album']['release_date']
            duration_ms = t['duration_ms']

            c.execute("""
                INSERT INTO top_songs
                (user_id, song_name, artist_name, album_name, release_date, duration_ms, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                ON CONFLICT(user_id, song_name, artist_name)
                DO UPDATE SET album_name=excluded.album_name,
                              release_date=excluded.release_date,
                              duration_ms=excluded.duration_ms,
                              fetched_at=datetime('now')
            """, (user_id, t['name'], artists, album, release_date, duration_ms))
            song_results.append({
                "name": t['name'], "artist": artists,
                "album": album, "release_date": release_date, "duration_ms": duration_ms,
            })

            # Derive albums from the same track list — no extra API call
            album_artists = ", ".join(a['name'] for a in t['album']['artists'])
            c.execute("""
                INSERT INTO top_albums (user_id, album_name, artist_name, fetched_at)
                VALUES (?, ?, ?, datetime('now'))
                ON CONFLICT(user_id, album_name, artist_name)
                DO UPDATE SET fetched_at=datetime('now')
            """, (user_id, album, album_artists))
            album_results.append({"name": album, "artist": album_artists})

    return song_results, album_results


def get_top_artists(sp, user_id, limit=20):
    response = sp.current_user_top_artists(limit=limit)
    artists = response.get('items')
    if not artists:
        return []

    with get_db() as conn:
        c = conn.cursor()
        for a in artists:
            c.execute("""
                INSERT INTO top_artists (user_id, artist_name, fetched_at)
                VALUES (?, ?, datetime('now'))
                ON CONFLICT(user_id, artist_name)
                DO UPDATE SET fetched_at=datetime('now')
            """, (user_id, a['name']))

    return [{"name": a['name']} for a in artists]