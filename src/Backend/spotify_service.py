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
        client_id=os.getenv("SPOTIPY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIPY_CLIENT_SECRET"),
        redirect_uri="http://127.0.0.1:8888/callback",
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
            danceability REAL,
            energy REAL,
            valence REAL,
            tempo REAL,
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
    track_ids = [t['id'] for t in top_tracks if t['id']]

    # Fetch audio features safely
    features = []
    try:
        for i in range(0, len(track_ids), 50):
            batch = track_ids[i:i+50]
            batch_features = sp.audio_features(batch)
            features.extend(batch_features)
    except Exception as e:
        print("Error fetching audio features:", e)
        features = [None]*len(track_ids)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for track, feat in zip(top_tracks, features):
        artist_names = ", ".join([a['name'] for a in track['artists']])
        dance, energy, valence, tempo = (None, None, None, None)
        if feat:
            dance = feat['danceability']
            energy = feat['energy']
            valence = feat['valence']
            tempo = feat['tempo']

        cursor.execute("""
            INSERT OR REPLACE INTO top_songs
            (user_id, song_name, artist_name, danceability, energy, valence, tempo, fetched_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (user['id'], track['name'], artist_names, dance, energy, valence, tempo))

    conn.commit()
    conn.close()
    return [
        {
            "name": track['name'],
            "artist": ", ".join([a['name'] for a in track['artists']]),
            "danceability": feat['danceability'] if feat else None,
            "energy": feat['energy'] if feat else None,
            "valence": feat['valence'] if feat else None,
            "tempo": feat['tempo'] if feat else None
        }
        for track, feat in zip(top_tracks, features)
    ]