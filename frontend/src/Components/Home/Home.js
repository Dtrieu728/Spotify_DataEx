 import "./Home.css";
 import { useState } from "react";
 const Home = ({ topSongs = [], topArtists = [], topAlbums = [] }) => {
    const [showAllSongs, setShowAllSongs] = useState(false);
    const [showAllArtists, setShowAllArtists] = useState(false);
    const [showAllAlbums, setShowAllAlbums] = useState(false);

    const visibleSongs = showAllSongs ? topSongs : topSongs.slice(0, 10);
    const visibleArtists = showAllArtists ? topArtists : topArtists.slice(0, 10);
    const visibleAlbums = showAllAlbums ? topAlbums : topAlbums.slice(0, 10);

return (
    <>
      <h1 className="title">Spotify Insights</h1>

      <div className="container">
        
        {/* Top Songs */}
        <div className="card">
          <h2>Top Songs</h2>

          {visibleSongs.map((song, index) => (
            <div className="item" key={index}>
              #{index + 1} {song.name} — {song.artist}
            </div>
          ))}

          {topSongs.length > 10 && (
            <button
              className="toggle-btn"
              onClick={() => setShowAllSongs(!showAllSongs)}
            >
              {showAllSongs ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Top Artists */}
        <div className="card">
          <h2>Top Artists</h2>

          {visibleArtists.map((artist, index) => (
            <div className="item" key={index}>
              #{index + 1} {artist.name}
            </div>
          ))}

          {topArtists.length > 10 && (
            <button
              className="toggle-btn"
              onClick={() => setShowAllArtists(!showAllArtists)}
            >
              {showAllArtists ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Top Albums */}
        <div className="card">
          <h2>Top Albums</h2> 
          {visibleAlbums.map((album, index) => (
            <div className="item" key={index}>
              #{index + 1} {album.name} — {album.artist}
            </div>
          ))}
          {topAlbums.length > 10 && (
            <button
              className="toggle-btn"
              onClick={() => setShowAllAlbums(!showAllAlbums)}
            >
              {showAllAlbums ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

      </div>
    </>
  );
};


export default Home;