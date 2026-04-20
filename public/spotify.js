import { startSpotifyLogin } from "./api.js";

export function connectSpotify(userId) {
  if (!userId) {
    throw new Error("Faca login antes de conectar o Spotify.");
  }

  startSpotifyLogin(userId);
}
