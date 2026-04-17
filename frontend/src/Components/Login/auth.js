const client_id = import.meta.env.SPOTIPY_CLIENT_ID;
const redirect_uri = import.meta.env.SPOTIPY_REDIRECT_URI;

const scope = [
    "playlist-read-private",
    "user-top-read",
    "user-library-read",
    "user-read-recently-played",
]

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }   
    return result;
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function base64encode(input) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(input)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function login() {
    const code_verifier = generateRandomString(64);
    localStorage.setItem("code_verifier", code_verifier);
    const hashed = await sha256(code_verifier);
    const challenge = base64encode(hashed);

    const params = new URLSearchParams({
        response_type: "code",
        client_id,
        scope: scope.join(" "),     
        code_challenge_method: "S256",
        code_challenge: challenge,
        redirect_uri,
    });
    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
