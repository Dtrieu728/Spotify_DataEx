from flask import Flask, jsonify
from flask_cors import CORS
from spotify_service import get_top_artists_for_user, get_top_songs_for_user

app = Flask(__name__)
CORS(app)


@app.route("/api/top-artists")
def top_artists():
    data = get_top_artists_for_user()
    return jsonify(data)

@app.route("/api/top-songs")
def top_songs():
    data = get_top_songs_for_user()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)