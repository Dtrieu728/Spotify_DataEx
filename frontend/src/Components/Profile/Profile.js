import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Profile = () => {
  const lastUpdated = localStorage.getItem("lastUpdated");
  const [songs, setSongs] = useState([]);

  // On mount: load from localStorage first
  useEffect(() => {
    const cached = localStorage.getItem("songData");
    if (cached) {
      setSongs(JSON.parse(cached));
    }

    async function fetchSongs() {
      const res = await fetch("http://127.0.0.1:5000/api/song-data");
      const data = await res.json();
      setSongs(data);
      localStorage.setItem("songData", JSON.stringify(data)); // cache it
      localStorage.setItem("lastUpdated", new Date().toISOString()); // update last updated time
    }

    fetchSongs();
  }, []);

  const songsChartData = {
    labels: songs.map((s) => s.name),
    datasets: [
      {
        label: "Duration (minutes)",
        data: songs.map((s) => (s.duration_ms / 60000).toFixed(2)),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h1 className="title" align="center">Profile</h1>
      <p style={{ color: "white" }}>
        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
      </p>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ color: "white" }}>Top Songs by Duration</h2>
        <Bar
          data={songsChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.raw} min`,
                },
              },
            },
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "Minutes" } },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Profile;