import sqlite3

conn = sqlite3.connect("spotify.db")
cursor = conn.cursor()

for row in cursor.execute("SELECT * FROM top_artists"):
    print(row)
    
    
'''
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
'''