import "./Home.css";
import { useState } from "react";

const Home = ({ topSongs = [], topArtists = [], topAlbums = [] }) => {
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);

  if (!topSongs.length && !topArtists.length && !topAlbums.length) {
    return <h2 className="loading">Loading Spotify Insights...</h2>;
  }

  const visibleSongs = showAllSongs ? topSongs : topSongs.slice(0, 10);
  const visibleArtists = showAllArtists ? topArtists : topArtists.slice(0, 10);
  const visibleAlbums = showAllAlbums ? topAlbums : topAlbums.slice(0, 10);

  return (
    <>
      <h1 className="title">Spotify Insights</h1>

      <div className="container">

        <Section
          title="Top Songs"
          items={visibleSongs}
          fullItems={topSongs}
          showAll={showAllSongs}
          toggle={() => setShowAllSongs(!showAllSongs)}
          render={(song, i) => (
            <div className="item" key={`${song.name}-${song.artist}`}>
              #{i + 1} <strong>{song.name}</strong> — {song.artist}
            </div>
          )}
        />

        <Section
          title="Top Artists"
          items={visibleArtists}
          fullItems={topArtists}
          showAll={showAllArtists}
          toggle={() => setShowAllArtists(!showAllArtists)}
          render={(artist, i) => (
            <div className="item" key={artist.name}>
              #{i + 1} {artist.name}
            </div>
          )}
        />

        <Section
          title="Top Albums"
          items={visibleAlbums}
          fullItems={topAlbums}
          showAll={showAllAlbums}
          toggle={() => setShowAllAlbums(!showAllAlbums)}
          render={(album, i) => (
            <div className="item" key={`${album.name}-${album.artist}`}>
              #{i + 1} {album.name} — {album.artist}
            </div>
          )}
        />

      </div>
    </>
  );
};

const Section = ({ title, items, fullItems, showAll, toggle, render }) => (
  <div className="card">
    <h2>{title}</h2>

    {items.map(render)}

    {fullItems.length > 10 && (
      <button className="toggle-btn" onClick={toggle}>
        {showAll ? "Show Less" : "Show More"}
      </button>
    )}
  </div>
);

export default Home;