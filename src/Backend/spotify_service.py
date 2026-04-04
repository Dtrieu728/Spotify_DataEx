import os
from dotenv import load_dotenv
import spotipy
import sqlite3
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

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
        # Optional: fetch full artist for popularity
        cursor.execute("""
            INSERT INTO top_artists VALUES (?, ?, datetime('now'))
        """, (user['id'], artist['name']))

        result.append({
            "name": artist['name'],
        })

    conn.commit()
    conn.close()

    return result