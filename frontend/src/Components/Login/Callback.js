import { useEffect } from "react";
import {useNavigate} from "react-router-dom";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function getToken() {
      const code = new URLSearchParams(window.location.search).get("code");
      const verifier = localStorage.getItem("code_verifier");

      const body = new URLSearchParams({
        client_id: process.env.REACT_APP_CLIENT_ID,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI,
        code_verifier: verifier,
      });

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },
          body
        }
      );

      const data = await response.json();

      localStorage.setItem("spotify_token", data.access_token);

      navigate("/profile");
    }

    getToken();
  }, [navigate]);

  return <div>Logging in...</div>;
}

export default Callback;