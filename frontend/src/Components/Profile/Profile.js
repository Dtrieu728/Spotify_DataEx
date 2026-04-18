import React, { useMemo } from "react";
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
import "./Profile.css";

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

const Profile = ({ songs = [], artists = [] }) => {
  const lastUpdated = localStorage.getItem("lastUpdated");


  const releaseYearData = useMemo(() => {
    const counts = {};

    songs.forEach((song) => {
      const year = song.release_year;
      if (!year) return;

      counts[year] = (counts[year] || 0) + 1;
    });

    const years = Object.keys(counts).sort();

    return {
      labels: years,
      datasets: [
        {
          label: "Songs by Release Year",
          data: years.map((y) => counts[y]),
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    };
  }, [songs]);


  const artistFrequencyData = useMemo(() => {
    const counts = {};

    songs.forEach((song) => {
      const artist = song.artist || "Unknown";
      counts[artist] = (counts[artist] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sorted.map((a) => a[0]),
      datasets: [
        {
          label: "Tracks per Artist",
          data: sorted.map((a) => a[1]),
          backgroundColor: "rgba(153,102,255,0.7)",
        },
      ],
    };
  }, [songs]);


  const songsChartData = useMemo(() => {
    return {
      labels: songs.map((s) =>
        (s.name || "Unknown").length > 18
          ? s.name.slice(0, 18) + "..."
          : s.name
      ),
      datasets: [
        {
          label: "Duration (min)",
          data: songs.map((s) => (s.duration_ms || 0) / 60000),
          backgroundColor: "rgba(75,192,192,0.7)",
        },
      ],
    };
  }, [songs]);

  return (
    <div className="profile-page">
      <h1 className="title">Profile Analytics</h1>

      <p className="updated-text">
        Last updated:{" "}
        {lastUpdated
          ? new Date(lastUpdated).toLocaleString()
          : "Never"}
      </p>

      <div className="chart-container">

        <div style={{ maxWidth: 900, margin: "0 auto", height: 400 }}>
          <h2>Top Songs by Duration</h2>
          <Bar
            data={songsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", height: 400 }}>
          <h2>Release Year Trends</h2>
          <Line
            data={releaseYearData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", height: 400 }}>
          <h2>Artist Frequency</h2>
          <Bar
            data={artistFrequencyData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: "y",
            }}
          />
        </div>

      </div>
    </div>
  );
};

export default Profile;