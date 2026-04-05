import { useEffect, useState } from "react";
import "./App.css";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import { Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";


function App() {
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState(true);


 useEffect(() => {
    async function fetchData() {
      try {
        const [songsRes, artistsRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/top-songs"),
          fetch("http://127.0.0.1:5000/api/top-artists")
        ]);

        if (!songsRes.ok || !artistsRes.ok) {
          throw new Error("Network response was not ok");
        }

        const songs = await songsRes.json();
        const artists = await artistsRes.json();

        setTopSongs(songs);
        setTopArtists(artists);
      } catch (error) {
        console.error("Failed to fetch Spotify data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

if (loading) {
  return <h1 style={{ color: "white" }}>Loading...</h1>;
}

 return (
    <div className="app">
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home topSongs={topSongs} topArtists={topArtists} />} />
      </Routes>
    </div>
  );
}

export default App;