import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();
  const redirect_uri = "https://spotify-data-ex.vercel.app/callback";

  useEffect(() => {
    async function getToken() {
      const code = new URLSearchParams(window.location.search).get("code");
      const verifier = localStorage.getItem("code_verifier");

      if (!code || !verifier) return;

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri,
        code_verifier: verifier,
      });

      console.log("CODE:", code);
      console.log("VERIFIER:", verifier);
      console.log("REDIRECT:", redirect_uri);

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      );

      const data = await response.json();

      console.log("TOKEN RESPONSE:", data);

      if (!data.access_token) {
        console.error("Spotify auth failed:", data);
        return;
      }

      localStorage.setItem("spotify_token", data.access_token);

      navigate("/profile");
    }

    getToken();
  }, [navigate]);

  return <div>Logging in...</div>;
}

export default Callback;