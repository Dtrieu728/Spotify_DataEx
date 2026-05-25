import React from "react";
import "./Hero.css";
import { login } from "../Login/auth";

const Hero = () => {
  return (
    <div className="Hero">
      <h1>Looking for music?</h1>
      <div className="subtext">
        <p>Discover your Spotify insights!</p>
        <p>Explore your top songs, artists, and albums in one place.</p>
        <button onClick={login} className="hero-btn">
              Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default Hero;
