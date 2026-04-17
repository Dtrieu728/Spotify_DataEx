import { useEffect, useState } from "react";
import "./App.css";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import { Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";
import Hero from "./Components/Hero/Hero";
import Profile from "./Components/Profile/Profile";
import Callback from "./Components/Login/Callback";




function App() {
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [loading, setLoading] = useState(true);


useEffect(() => {
  async function fetchData() {
    try {
      const [songsRes, artistsRes, albumsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/top-songs"),
        fetch("http://127.0.0.1:5000/api/top-artists"),
        fetch("http://127.0.0.1:5000/api/top-albums"),
      ]);

      if (!songsRes.ok || !artistsRes.ok || !albumsRes.ok) {
        throw new Error("Network response was not ok");
      }

      const songs = await songsRes.json();
      const artists = await artistsRes.json();
      const albums = await albumsRes.json();

      setTopSongs(songs);
      setTopArtists(artists);
      setTopAlbums(albums);

      localStorage.setItem("topSongs", JSON.stringify(songs));
      localStorage.setItem("topArtists", JSON.stringify(artists));
      localStorage.setItem("topAlbums", JSON.stringify(albums));

      localStorage.setItem("lastUpdated", new Date().toISOString());

    } catch (error) {
      console.error("Backend failed, loading cached data...", error);

      const cachedSongs = localStorage.getItem("topSongs");
      const cachedArtists = localStorage.getItem("topArtists");
      const cachedAlbums = localStorage.getItem("topAlbums");

      if (cachedSongs) setTopSongs(JSON.parse(cachedSongs));
      if (cachedArtists) setTopArtists(JSON.parse(cachedArtists));
      if (cachedAlbums) setTopAlbums(JSON.parse(cachedAlbums));
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
        <Route path="/" element={<Hero />} />
        <Route path="/profile" element={<Home topSongs={topSongs} topArtists={topArtists} topAlbums={topAlbums} />} />
        <Route path="/userpage" element={<Profile />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  );
}

export default App;