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

    from spotify_service import get_top_songs_for_user, get_top_artists_for_user, get_top_albums_for_user

    get_top_songs_for_user()
    get_top_artists_for_user()
    get_top_albums_for_user()

scheduler = BackgroundScheduler()
scheduler.add_job(update_spotify_data, 'interval', minutes=30)
scheduler.start()

@app.route("/api/top-songs")
def top_songs():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT song_name, artist_name FROM top_songs ORDER BY fetched_at DESC LIMIT 10")
    songs = [{"name": row[0], "artist": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(songs)

@app.route("/api/top-artists")
def top_artists():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT artist_name FROM top_artists ORDER BY fetched_at DESC LIMIT 10")
    artists = [{"name": row[0]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(artists)

@app.route("/api/top-albums")
def top_albums():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT album_name, artist_name FROM top_albums ORDER BY fetched_at DESC LIMIT 10")
    albums = [{"name": row[0], "artist": row[1]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(albums)

if __name__ == "__main__":
    update_spotify_data()
    app.run(debug=True)