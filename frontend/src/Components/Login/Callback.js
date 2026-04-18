import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const redirect_uri = "https://spotify-data-ex.vercel.app/callback";
const client_id = process.env.REACT_APP_CLIENT_ID;

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function getToken() {
      const code = new URLSearchParams(window.location.search).get("code");
      const verifier = localStorage.getItem("code_verifier");

      if (!code || !verifier) return;

      const body = new URLSearchParams({
        client_id: client_id,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        code_verifier: verifier,
      });

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body,
        }
      );

      const data = await response.json();

      console.log(data);

      if (!data.access_token) {
        console.error(data);
        return;
      }

      localStorage.setItem("spotify_token", data.access_token);

     window.location.href = "/profile"; // Redirect to home after successful login
    }

    getToken();
  }, [navigate]);

  return <div>Logging in...</div>;
}

export default Callback;