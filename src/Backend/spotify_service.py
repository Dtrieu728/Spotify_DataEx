import os
from dotenv import load_dotenv
import spotipy
import sqlite3
from spotipy.oauth2 import SpotifyOAuth

load_dotenv(override=True)

print("CLIENT_ID:", os.getenv("SPOTIPY_CLIENT_ID"))
print("CLIENT_SECRET:", os.getenv("SPOTIPY_CLIENT_SECRET"))

sp = spotipy.Spotify(
    auth_manager=SpotifyOAuth(
        client_id=os.getenv("SPOTIPY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
        redirect_uri="http://127.0.0.1:8888/callback",
        scope="user-library-read user-top-read playlist-read-private"
    )
)

DB_PATH = "Database/spotify.db"

def get_top_artists_for_user():
    user = sp.current_user()
    top_artists = sp.current_user_top_artists(limit=10)

    # Connect to DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS top_artists (
        user_id TEXT,
        artist_name TEXT,
        fetched_at TEXT
    )
    """)

    result = []
    for artist in top_artists['items']:
        cursor.execute("""
            INSERT INTO top_artists VALUES (?, ?, datetime('now'))
        """, (user['id'], artist['name']))

        result.append({
            "name": artist['name'],
        })

    conn.commit()
    conn.close()

    return result

def get_top_songs_for_user():
    user = sp.current_user()
    top_songs = sp.current_user_top_tracks(limit=10)
    
    # Connect to DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor() 
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS top_songs (
        user_id TEXT,
        song_name TEXT,
        artist_name TEXT,
        fetched_at TEXT,
        UNIQUE(user_id, song_name, artist_name)
    )
    """)

    result = []
    for track in top_songs['items']:
        artist_names = ", ".join([a['name'] for a in track['artists']])
        
        cursor.execute("""
            INSERT OR IGNORE INTO top_songs (user_id, song_name, artist_name, fetched_at)
            VALUES (?, ?, ?, datetime('now'))
        """, (user['id'], track['name'], artist_names))

        result.append({
            "name": track['name'],
            "artist": artist_names
        })
        
    conn.commit()
    conn.close() 

    return result


def get_top_albums_for_user():
    user = sp.current_user()
    top_tracks = sp.current_user_top_tracks(limit=10)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS top_albums (
            user_id TEXT,
            album_name TEXT,
            artist_name TEXT,
            fetched_at TEXT,
            UNIQUE(user_id, album_name, artist_name)
        )
        """)

        result = []
        for track in top_tracks['items']:
            album = track['album']
            artist_names = ", ".join([a['name'] for a in album['artists']])

            cursor.execute("""
                INSERT OR IGNORE INTO top_albums (user_id, album_name, artist_name, fetched_at)
                VALUES (?, ?, ?, datetime('now'))
            """, (user['id'], album['name'], artist_names))

            result.append({
                "name": album['name'],
                "artist": artist_names
            })
            
    conn.commit()
    conn.close()

    return result