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

  const [token, setToken] = useState(localStorage.getItem("spotify_token"));

  useEffect(() => {
  const onStorage = () => {
    setToken(localStorage.getItem("spotify_token"));
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);

useEffect(() => {
  async function fetchData() {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [songsRes, artistsRes] = await Promise.all([
        fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", { headers }),
        fetch("https://api.spotify.com/v1/me/top/artists?limit=20", { headers }),
      ]);

      const songsData = await songsRes.json();
      const artistsData = await artistsRes.json();

      const songs = (songsData.items || []).map(track => ({
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
      }));

      const artists = (artistsData.items || []).map(artist => ({
        name: artist.name,
      }));

      const albums = (songsData.items || []).map(track => ({
        name: track.album.name,
        artist: track.album.artists.map(a => a.name).join(", "),
      }));

      setTopSongs(songs);
      setTopArtists(artists);
      setTopAlbums(albums);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, [token]);

  if (loading) {
    return <h1 style={{ color: "white" }}>Loading...</h1>;
  }

  return (
    <div className="app">
      <NavigationBar />

      <Routes>
        <Route path="/" element={<Hero />} />

        <Route
          path="/profile"
          element={
            <Home
              topSongs={topSongs}
              topArtists={topArtists}
              topAlbums={topAlbums}
            />
          }
        />

        <Route path="/userpage" element={<Profile />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  );
}

export default App;