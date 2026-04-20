import { getEnv } from "./_lib/env.js";
import { encodeState } from "./_lib/state.js";

export default function handler(request, response) {
  const clientId = getEnv("SPOTIFY_CLIENT_ID");
  const redirectUri = getEnv("SPOTIFY_REDIRECT_URI");
  const userId = request.query.user_id;

  if (!userId) {
    response.status(400).send("user_id e obrigatorio.");
    return;
  }

  const state = encodeState({
    userId,
    returnTo: process.env.APP_URL || "http://localhost:3000",
    createdAt: Date.now()
  });
  const scope = [
    "user-read-email",
    "user-top-read",
    "user-read-private",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public"
  ].join(" ");

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", scope);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);

  response.redirect(url.toString());
}
