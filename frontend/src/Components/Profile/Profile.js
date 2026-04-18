import React, { useState } from "react";
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

const Profile = ({
  songs = [],
  artists = [],
  albums = [],
}) => {
  const [lastUpdated] = useState(
    localStorage.getItem("lastUpdated")
  );

  /* ----------------------------------
     RELEASE YEAR CHART
  ---------------------------------- */
  const yearCounts = {};

  albums.forEach((album) => {
    const year = album?.release_year;

    if (!year) return;

    yearCounts[year] =
      (yearCounts[year] || 0) + 1;
  });

  const sortedYears = Object.keys(
    yearCounts
  ).sort();

  const releaseYearData = {
    labels: sortedYears,
    datasets: [
      {
        label: "Albums by Release Year",
        data: sortedYears.map(
          (year) => yearCounts[year]
        ),
        borderWidth: 3,
        tension: 0.3,
      },
    ],
  };

  /* ----------------------------------
     ARTIST FREQUENCY CHART
  ---------------------------------- */
  const artistCounts = {};

  songs.forEach((song) => {
    const artist =
      song?.artist || "Unknown";

    artistCounts[artist] =
      (artistCounts[artist] || 0) + 1;
  });

  const sortedArtists = Object.entries(
    artistCounts
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const artistFrequencyData = {
    labels: sortedArtists.map(
      (item) => item[0]
    ),
    datasets: [
      {
        label: "Tracks in Top Songs",
        data: sortedArtists.map(
          (item) => item[1]
        ),
        backgroundColor:
          "rgba(153,102,255,0.7)",
      },
    ],
  };

  /* ----------------------------------
     SONG DURATION CHART
  ---------------------------------- */
  const songsChartData = {
    labels: songs.map((song) =>
      song.name.length > 18
        ? song.name.slice(0, 18) + "..."
        : song.name
    ),

    datasets: [
      {
        label: "Duration (Minutes)",
        data: songs.map(
          (song) =>
            song.duration_ms / 60000
        ),
        backgroundColor:
          "rgba(75,192,192,0.7)",
      },
    ],
  };

  return (
    <div className="profile-page">
      <h1 className="title">
        Profile Analytics
      </h1>

      <p className="updated-text">
        Last updated:{" "}
        {lastUpdated
          ? new Date(
              lastUpdated
            ).toLocaleString()
          : "Never"}
      </p>

      <div className="chart-container">
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2>
            Top Songs by Duration
          </h2>

          <Bar
            data={songsChartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
            }}
          />
        </div>

        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2>
            Release Year Trends
          </h2>

          <Line
            data={releaseYearData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
            }}
          />
        </div>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2>
            Artist Frequency
          </h2>

          <Bar
            data={artistFrequencyData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              indexAxis: "y",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;