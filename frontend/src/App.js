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
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(
    localStorage.getItem("spotify_token")
  );

  // Detect login token updates
  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem("spotify_token"));
    };

    window.addEventListener("storage", onStorage);
    return () =>
      window.removeEventListener("storage", onStorage);
  }, []);

  // Fetch Spotify data
  useEffect(() => {
    async function fetchData() {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [songsRes, artistsRes] = await Promise.all([
          fetch(
            "https://api.spotify.com/v1/me/top/tracks?limit=20",
            { headers }
          ),
          fetch(
            "https://api.spotify.com/v1/me/top/artists?limit=20",
            { headers }
          ),
        ]);

        if (
          songsRes.status === 401 ||
          artistsRes.status === 401
        ) {
          localStorage.removeItem("spotify_token");
          setToken(null);
          return;
        }

        const songsData = await songsRes.json();
        const artistsData = await artistsRes.json();

        const songs = (songsData.items || []).map(
          (track) => ({
            name: track.name,
            artist: track.artists
              .map((a) => a.name)
              .join(", "),
            duration_ms: track.duration_ms,
            album: track.album.name,
            release_year:
              track.album.release_date?.slice(0, 4),
          })
        );

        const artists = (artistsData.items || []).map(
          (artist) => ({
            name: artist.name,
          })
        );

        setTopSongs(songs);
        setTopArtists(artists);

      } catch (err) {
        console.error("Spotify fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <h1 style={{ color: "white" }}>
        Loading...
      </h1>
    );
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

        <Route
          path="/userpage"
          element={
            <Profile
              songs={topSongs}
              artists={topArtists}
            />
          }
        />

        <Route
          path="/callback"
          element={<Callback />}
        />
      </Routes>
    </div>
  );
}

export default App;