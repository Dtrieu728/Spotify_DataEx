const client_id = process.env.REACT_APP_CLIENT_ID;
const redirect_uri = process.env.REACT_APP_REDIRECT_URI;
const scope = [
  "playlist-read-private",
  "user-top-read",
  "user-library-read",
  "user-read-recently-played",
];

function generateRandomString(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain) {
  const data = new TextEncoder().encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function login() {
  const state = crypto.randomUUID();
  const code_verifier = generateRandomString(64);
  sessionStorage.setItem("oauth_state", state);
  sessionStorage.setItem("code_verifier", code_verifier);

  const challenge = base64encode(await sha256(code_verifier));
  const params = new URLSearchParams({
    client_id, response_type: "code",
    redirect_uri, code_challenge: challenge,
    code_challenge_method: "S256",
    scope: scope.join(" "), state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export const isLoggedIn = () => {
  const token = localStorage.getItem("spotify_token");
  const expiry = localStorage.getItem("spotify_token_expiry");
  return !!(token && expiry && Date.now() < Number(expiry));
};

export async function refreshAccessToken() {
  const refresh_token = localStorage.getItem("spotify_refresh_token");
  if (!refresh_token) return null;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id, grant_type: "refresh_token", refresh_token }),
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("spotify_token", data.access_token);
    localStorage.setItem("spotify_token_expiry", Date.now() + data.expires_in * 1000);
  }
  return data.access_token ?? null;
}