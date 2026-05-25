import os
import logging
from http import HTTPStatus
from flask import Flask, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from spotify_service import (
    get_db, get_spotify_client, create_tables,
    get_song_data, get_top_artists, get_top_albums,
)

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://spotify-data-ex.vercel.app",
])

logging.basicConfig(level=logging.INFO)


def update_spotify_data():
    try:
        sp, user_id = get_spotify_client()
        get_song_data(sp, user_id)  
        get_top_artists(sp, user_id)
    except Exception as e:
        app.logger.error("Spotify update failed: %s", e)


@app.route("/api/top-songs")
def top_songs():
    try:
        with get_db() as conn:
            rows = conn.execute("""
                SELECT song_name, artist_name, album_name, release_date, duration_ms
                FROM top_songs ORDER BY fetched_at DESC LIMIT 20
            """).fetchall()
        return jsonify([
            {"name": r[0], "artist": r[1], "album": r[2],
             "release_date": r[3], "duration_ms": r[4]}
            for r in rows
        ])
    except Exception as e:
        app.logger.error("top_songs failed: %s", e)
        return make_error("Failed to fetch songs")


@app.route("/api/top-artists")
def top_artists():
    try:
        with get_db() as conn:
            rows = conn.execute("""
                SELECT artist_name FROM top_artists
                ORDER BY fetched_at DESC LIMIT 20
            """).fetchall()
        return jsonify([{"name": r[0]} for r in rows])
    except Exception as e:
        app.logger.error("top_artists failed: %s", e)
        return make_error("Failed to fetch artists")


@app.route("/api/top-albums")
def top_albums():
    try:
        with get_db() as conn:
            rows = conn.execute("""
                SELECT album_name, artist_name FROM top_albums
                ORDER BY fetched_at DESC LIMIT 20
            """).fetchall()
        return jsonify([{"name": r[0], "artist": r[1]} for r in rows])
    except Exception as e:
        app.logger.error("top_albums failed: %s", e)
        return make_error("Failed to fetch albums")


create_tables()
scheduler = BackgroundScheduler()
scheduler.add_job(update_spotify_data, 'interval', minutes=30)

if os.environ.get("WERKZEUG_RUN_MAIN") != "false":
    scheduler.start()

if __name__ == "__main__":
    update_spotify_data()
    app.run(debug=os.getenv("FLASK_DEBUG", "false") == "true")