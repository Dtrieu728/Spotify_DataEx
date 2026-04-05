from flask import Flask, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import sqlite3
import spotipy
from flask_cors import CORS
from spotipy.oauth2 import SpotifyOAuth






app = Flask(__name__)
CORS(app)
DB_PATH = "Database/spotify.db"


def update_spotify_data():
    print("Updating Spotify data...")

    from spotify_service import (
        get_spotify_client,
        get_top_songs_for_user,
        get_top_artists_for_user,
        get_top_albums_for_user,
        get_song_data,
        create_tables
    )
    sp = get_spotify_client()
    # Ensure DB tables exist
    create_tables()

    # Update basic top songs, artists, albums
    get_top_songs_for_user(sp)
    get_top_artists_for_user(sp)
    get_top_albums_for_user(sp)

    # Update audio features safely
    try:
        get_song_data(sp)
    except Exception as e:
        print("Audio features update failed:", e)
        

scheduler = BackgroundScheduler()
scheduler.add_job(update_spotify_data, 'interval', minutes=30)

@app.route("/api/top-songs")
def top_songs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT song_name, artist_name FROM top_songs ORDER BY fetched_at DESC LIMIT 20")
    songs = [{"name": row[0], "artist": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(songs)

@app.route("/api/top-artists")
def top_artists():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT artist_name FROM top_artists ORDER BY fetched_at DESC LIMIT 20")
    artists = [{"name": row[0]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(artists)

@app.route("/api/top-albums")
def top_albums():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT album_name, artist_name FROM top_albums ORDER BY fetched_at DESC LIMIT 20")
    albums = [{"name": row[0], "artist": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(albums)

@app.route("/api/song-data")
def song_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT song_name, artist_name,
               danceability, energy, valence, tempo
        FROM top_songs
        ORDER BY fetched_at DESC
        LIMIT 20
    """)

    songs = [
        {
            "name": row[0],
            "artist": row[1],
            "danceability": row[2],
            "energy": row[3],
            "valence": row[4],
            "tempo": row[5]
        }
        for row in cursor.fetchall()
    ]

    conn.close()
    return jsonify(songs)

if __name__ == "__main__":
    scheduler.start()
    update_spotify_data()
    app.run(debug=True)