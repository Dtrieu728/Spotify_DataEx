import sqlite3

conn = sqlite3.connect("spotify.db")
cursor = conn.cursor()

for row in cursor.execute("SELECT * FROM top_artists"):
    print(row)