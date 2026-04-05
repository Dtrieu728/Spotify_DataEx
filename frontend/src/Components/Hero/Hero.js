import React from "react";
import "./Hero.css";
import { useNavigate} from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="Hero">
      <h1>Looking for music?</h1>
      <div className="subtext">
        <p>Discover your Spotify insights!</p>
        <p>Explore your top songs, artists, and albums in one place.</p>
        <button className="hero-btn" onClick={() => navigate("/Profile")}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Hero;
