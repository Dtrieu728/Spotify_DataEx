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

const Profile = ({ songs = [], artists = [] }, albums = []) => {
  const lastUpdated = localStorage.getItem("lastUpdated");


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
    datasets: [
      {
        label: "Songs by Release Year",
        data: years.map((y) => yearCounts[y]),
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };
}, [songs]);


const albumFrequencyData = useMemo(() => {
  const sorted = [...albums]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    labels: sorted.map((a) => a.name),
    datasets: [
      {
        label: "Album frequency (from top tracks)",
        data: sorted.map((a) => a.count),
        backgroundColor: "rgba(255, 159, 64, 0.7)",
      },
    ],
  };
}, [albums]);


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
          <h2>Album Frequency</h2>
          <Bar
            data={albumFrequencyData}
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