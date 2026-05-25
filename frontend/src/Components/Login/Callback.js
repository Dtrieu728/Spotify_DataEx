import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const client_id = process.env.REACT_APP_CLIENT_ID;
const redirect_uri = process.env.REACT_APP_REDIRECT_URI;

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function getToken() {
      const params = new URLSearchParams(window.location.search);

      const error = params.get("error");
      if (error) {
        console.error("Spotify auth error:", error);
        navigate("/?error=" + error);
        return;
      }

      const returnedState = params.get("state");
      const savedState = sessionStorage.getItem("oauth_state");
      if (!returnedState || returnedState !== savedState) {
        console.error("State mismatch");
        navigate("/?error=state_mismatch");
        return;
      }

      const code = params.get("code");
      const verifier = sessionStorage.getItem("code_verifier");
      if (!code || !verifier) {
        navigate("/?error=missing_params");
        return;
      }

      sessionStorage.removeItem("code_verifier");
      sessionStorage.removeItem("oauth_state");

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id, grant_type: "authorization_code",
          code, redirect_uri, code_verifier: verifier,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.access_token) {
        console.error("Token exchange failed:", data);
        navigate("/?error=token_failed");
        return;
      }

      localStorage.setItem("spotify_token", data.access_token);
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
      localStorage.setItem("spotify_token_expiry", Date.now() + data.expires_in * 1000);

      navigate("/profile", { replace: true });
    }

    getToken();
  }, [navigate]);

  return <div>Logging in...</div>;
}

export default Callback;