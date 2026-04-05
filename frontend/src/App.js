import { useEffect, useState } from "react";

function App() {
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/top-songs")
      .then(res => res.json())
      .then(data => setTopSongs(data));

    fetch("http://127.0.0.1:5000/api/top-artists")
      .then(res => res.json())
      .then(data => setTopArtists(data));
  }, []);

 return (
  <div style={{ padding: "40px", fontFamily: "Arial" }}>
    <h1>Spotify Insights</h1>

    <div style={{ display: "flex", gap: "50px" }}>
      
      <div>
        <h2>Top Songs</h2>
        {topSongs.map((song, index) => (
          <p key={index}>
            #{index + 1} {song.name} — {song.artist}
          </p>
        ))}
      </div>

      <div>
        <h2>Top Artists</h2>
        {topArtists.map((artist, index) => (
          <p key={index}>
            #{index + 1} {artist.name}
          </p>
        ))}
      </div>

    </div>
  </div>
);
}

export default App;