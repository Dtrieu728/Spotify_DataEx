 
 const Home = ({ topSongs, topArtists }) => {
    return (
      <>
        <h1 className="title">Spotify Insights</h1>
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

        </div>
      </>
    );
    };

export default Home;