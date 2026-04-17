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
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [songsRes, artistsRes] = await Promise.all([
          fetch("https://api.spotify.com/v1/me/top/tracks?limit=20", {
            headers,
          }),
          fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
            headers,
          }),
        ]);

        // Token expired / invalid
        if (songsRes.status === 401 || artistsRes.status === 401) {
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }

        const songsData = await songsRes.json();
        const artistsData = await artistsRes.json();

        const songs = (songsData.items || []).map((track) => ({
          name: track.name,
          artist: track.artists.map((a) => a.name).join(", "),
        }));

        const artists = (artistsData.items || []).map((artist) => ({
          name: artist.name,
        }));

        const albums = (songsData.items || []).map((track) => ({
          name: track.album.name,
          artist: track.album.artists.map((a) => a.name).join(", "),
        }));

        setTopSongs(songs);
        setTopArtists(artists);
        setTopAlbums(albums);

        localStorage.setItem("topSongs", JSON.stringify(songs));
        localStorage.setItem("topArtists", JSON.stringify(artists));
        localStorage.setItem("topAlbums", JSON.stringify(albums));
        localStorage.setItem("lastUpdated", new Date().toISOString());
      } catch (error) {
        console.error("Spotify fetch failed, loading cache...", error);

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