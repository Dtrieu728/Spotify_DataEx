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

# Get the current user's profile information
user = sp.current_user()
print(user['display_name'])

# Get the current user's top artists and playlists
top_artists = sp.current_user_top_artists(limit = 10)
playlists = sp.current_user_playlists(limit = 10)
top_songs = sp.current_user_top_tracks(limit = 10)

# Store the top artists in a SQLite database
conn = sqlite3.connect("Database/spotify.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS top_artists (
    user_id TEXT,
    artist_name TEXT,
    popularity INTEGER,
    fetched_at TEXT
)
""")

for artist in top_artists['items']:
    cursor.execute("""
    INSERT INTO top_artists VALUES (?, ?, ?, datetime('now'))
    """, (
        user['id'],
        artist['name'],
        artist.get('popularity', 0)
    ))

conn.commit()
conn.close()
