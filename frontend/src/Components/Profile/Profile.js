import React, { useState, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";
import "./Profile.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const truncate = (str, max = 18) =>
  str && str.length > max ? str.slice(0, max) + "…" : str ?? "Unknown";

const barOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "x",
  plugins: {
    title: { display: true, text: title, font: { size: 16 } },
    legend: { display: false },
  },
});

const Profile = ({ songs = [] }) => {
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setLastUpdated(localStorage.getItem("lastUpdated"));
  }, []);

  const topSongsData = useMemo(() => {
    const top = [...songs]
      .filter((s) => s?.duration_ms)
      .sort((a, b) => b.duration_ms - a.duration_ms)
      .slice(0, 20);
    return {
      labels: top.map((s) => truncate(s.name)),
      datasets: [{
        label: "Duration (min)",
        data: top.map((s) => +(s.duration_ms / 60000).toFixed(2)),
        backgroundColor: "rgba(75,192,192,0.7)",
      }],
    };
  }, [songs]);

  const releaseYearData = useMemo(() => {
    const yearCounts = {};
    songs.forEach((song) => {
      const year = song?.release_year;
      if (!year || year === "undefined") return;
      yearCounts[String(year)] = (yearCounts[String(year)] || 0) + 1;
    });
    const years = Object.keys(yearCounts).sort();
    return {
      labels: years,
      datasets: [{
        label: "Songs by Release Year",
        data: years.map((y) => yearCounts[y]),
        backgroundColor: "rgba(255,99,132,0.7)",
      }],
    };
  }, [songs]);

  const artistFrequencyData = useMemo(() => {
    const counts = {};
    songs.forEach((song) => {
      const artist = song?.artist || "Unknown";
      counts[artist] = (counts[artist] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: "Tracks per Artist",
        data: sorted.map(([, count]) => count),
        backgroundColor: "rgba(153,102,255,0.7)",
      }],
    };
  }, [songs]);

  if (!songs.length) {
    return <div className="profile-page"><p>No song data available.</p></div>;
  }

  return (
    <div className="profile-page">
      <h1 className="title">Profile Analytics</h1>
      <p className="updated-text">
        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
      </p>
      <div className="chart-container">
        {[
          { data: topSongsData,        title: "Top 20 Songs by Duration",  height: Math.max(400, topSongsData.labels.length * 30) },
          { data: releaseYearData,     title: "Release Year Trends",        height: Math.max(400, releaseYearData.labels.length * 30) },
          { data: artistFrequencyData, title: "Top Artists by Track Count", height: Math.max(400, artistFrequencyData.labels.length * 30) },
        ].map(({ data, title, height }) => (
          <div key={title} style={{ maxWidth: 900, margin: "0 auto", height }}>
            <Bar data={data} options={barOptions(title)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Profile);