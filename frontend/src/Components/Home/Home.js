 import "./Home.css";
 const Home = ({ topSongs = [], topArtists = [], topAlbums = [] }) => {
    return (
      <>
        <h1 className="title" align="center">
          Spotify Insights
        </h1>
        <div className="container">
          
          <div className="card">
            <h2>Top Songs</h2>
            {topSongs.map((song, index) => (
              <div className="item" key={index}>
                #{index + 1} {song.name} — {song.artist}
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Top Artists</h2>
            {topArtists.map((artist, index) => (
              <div className="item" key={index}>
                #{index + 1} {artist.name}
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Top Albums</h2>
            {topAlbums.map((album, index) => (
              <div className="item" key={index}>
                #{index + 1} {album.name} — {album.artist}
              </div>
            ))}
          </div>

        </div>
      </>
    );
    };

export default Home;