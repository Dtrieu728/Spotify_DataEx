import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const [songs, setSongs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(
    localStorage.getItem("lastUpdated")
  );

  useEffect(() => {
    const cached = localStorage.getItem("songData");

    if (cached) {
      try {
        setSongs(JSON.parse(cached));
      } catch {
        localStorage.removeItem("songData");
      }
    }

    async function fetchSongs() {
      try {
        const token = localStorage.getItem("spotify_token");
        if (!token) return;

        const res = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=20",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("spotify_token");
          window.location.href = "/";
          return;
        }

        const data = await res.json();
        const tracks = data.items || [];

        setSongs(tracks);
        localStorage.setItem("songData", JSON.stringify(tracks));

        const now = new Date().toISOString();
        localStorage.setItem("lastUpdated", now);
        setLastUpdated(now);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }

    fetchSongs();
  }, []);

// Analyze release years

  const yearCounts = {};

  songs.forEach((song) => {
    const year = song?.album?.release_date?.slice(0, 4);
    if (!year) return;

    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  const sortedYears = Object.keys(yearCounts).sort();

  const releaseYearData = {
    labels: sortedYears,
    datasets: [
      {
        label: "Number of Songs",
        data: sortedYears.map((y) => yearCounts[y]),
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };


// Analyze artist frequency
  const artistCounts = {};

  songs.forEach((song) => {
    const artists =
      song?.artists?.map((a) => a.name).join(", ") || "Unknown";

    artistCounts[artists] = (artistCounts[artists] || 0) + 1;
  });

  const sortedArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const artistFrequencyData = {
    labels: sortedArtists.map((a) => a[0]),
    datasets: [
      {
        label: "Tracks in Top Songs",
        data: sortedArtists.map((a) => a[1]),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };


// Analyze song durations
  const songsChartData = {
    labels: songs.map((s) =>
      (s?.name || "Unknown").length > 18
        ? s.name.slice(0, 18) + "..."
        : s?.name || "Unknown"
    ),
    datasets: [
      {
        label: "Duration (minutes)",
        data: songs.map((s) => (s?.duration_ms || 0) / 60000),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };


  return (
    <div className="profile-page">
      <h1 className="title" align="center">
        Profile
      </h1>

      <p style={{ color: "white" }}>
        Last updated:{" "}
        {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
      </p>

      <div className="chart-container">
        <div className="card">
        <h2 style={{ color: "white" }}>Top Songs by Duration</h2>
        <Bar data={songsChartData} />
        </div>

        <div className="card">
          <h2>Release Year Trends</h2>
          <Line data={releaseYearData} />
        </div>

        <div className="card">
          <h2>Artist Frequency</h2>
          <Bar data={artistFrequencyData} />
        </div>

      </div>
    </div>
  );
};

export default Profile;