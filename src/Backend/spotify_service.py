# spotify_service.py
import os
import sqlite3
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load env
load_dotenv(override=True)

def get_spotify_client():
    return spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=os.getenv("REACT_APP_CLIENT_ID"),
        client_secret=os.getenv("REACT_APP_CLIENT_SECRET"),
        redirect_uri=os.getenv("REACT_APP_REDIRECT_URI"),
        scope="user-library-read user-top-read playlist-read-private",
        cache_path=".spotifycache"
    ))


# sp_oauth = SpotifyOAuth(cache_path=".spotifycache")
# token_info = sp_oauth.get_cached_token()
# print("Token info:", token_info)

sp = get_spotify_client()
DB_PATH = "Database/spotify.db"


def create_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS top_songs (
            user_id TEXT,
            song_name TEXT,
            artist_name TEXT,
            album_name TEXT,
            release_date TEXT, 
            duration_ms INTEGER,
            fetched_at TEXT,
            UNIQUE(user_id, song_name, artist_name)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS top_artists (
            user_id TEXT,
            artist_name TEXT,
            fetched_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS top_albums (
            user_id TEXT,
            album_name TEXT,
            artist_name TEXT,
            fetched_at TEXT,
            UNIQUE(user_id, album_name, artist_name)
        )
    """)
    
    conn.commit()
    conn.close()



def get_top_songs_for_user(sp, limit=20):
    user = sp.current_user()
    top_songs = sp.current_user_top_tracks(limit=limit)['items']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for track in top_songs:
        artist_names = ", ".join([a['name'] for a in track['artists']])
        cursor.execute("""
            INSERT OR IGNORE INTO top_songs (user_id, song_name, artist_name, fetched_at)
            VALUES (?, ?, ?, datetime('now'))
        """, (user['id'], track['name'], artist_names))
    
    conn.commit()
    conn.close()
    return [{"name": t['name'], "artist": ", ".join([a['name'] for a in t['artists']])} for t in top_songs]


def get_top_artists_for_user(sp, limit=20):
    user = sp.current_user()
    top_artists = sp.current_user_top_artists(limit=limit)['items']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for artist in top_artists:
        cursor.execute("""
            INSERT INTO top_artists (user_id, artist_name, fetched_at)
            VALUES (?, ?, datetime('now'))
        """, (user['id'], artist['name']))
    
    conn.commit()
    conn.close()
    return [{"name": a['name']} for a in top_artists]


def get_top_albums_for_user(sp, limit=20):
    user = sp.current_user()
    top_tracks = sp.current_user_top_tracks(limit=limit)['items']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for track in top_tracks:
        album = track['album']
        artist_names = ", ".join([a['name'] for a in album['artists']])
        cursor.execute("""
            INSERT OR IGNORE INTO top_albums (user_id, album_name, artist_name, fetched_at)
            VALUES (?, ?, ?, datetime('now'))
        """, (user['id'], album['name'], artist_names))
    
    conn.commit()
    conn.close()
    return [{"name": t['album']['name'], "artist": ", ".join([a['name'] for a in t['album']['artists']])} for t in top_tracks]


def get_song_data(sp, limit=20):
    user = sp.current_user()
    top_tracks = sp.current_user_top_tracks(limit=limit)['items']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Make sure table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS top_songs (
            user_id TEXT,
            song_name TEXT,
            artist_name TEXT,
            album_name TEXT,
            release_date TEXT,
            duration_ms INTEGER,
            fetched_at TEXT,
            UNIQUE(user_id, song_name, artist_name)
        )
    """)

    results = []
    for track in top_tracks:
        artist_names = ", ".join([a['name'] for a in track['artists']])
        album_name = track['album']['name']
        release_date = track['album']['release_date']
        duration_ms = track['duration_ms']

        cursor.execute("""
            INSERT OR REPLACE INTO top_songs
            (user_id, song_name, artist_name, album_name, release_date, duration_ms, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        """, (
            user['id'],
            track['name'],
            artist_names,
            album_name,
            release_date,
            duration_ms
        ))

        results.append({
            "name": track['name'],
            "artist": artist_names,
            "album": album_name,
            "release_date": release_date,
            "duration_ms": duration_ms
        })

    conn.commit()
    conn.close()
    return results