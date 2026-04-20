import { getEnv } from "./env.js";
import { getSpotifyConnection, upsertSpotifyConnection } from "./supabase.js";

async function parseSpotifyResponse(response, fallbackMessage) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    const snippet = text.slice(0, 180).trim();
    throw new Error(`${fallbackMessage}: ${snippet}`);
  }
}

async function spotifyTokenRequest(params) {
  const clientId = getEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = getEnv("SPOTIFY_CLIENT_SECRET");
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(params)
  });

  const data = await parseSpotifyResponse(response, "Resposta invalida ao obter token do Spotify");

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || "Falha ao obter token do Spotify.");
  }

  return data;
}

export async function exchangeSpotifyCode(code) {
  return spotifyTokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: getEnv("SPOTIFY_REDIRECT_URI")
  });
}

export async function refreshSpotifyToken(refreshToken) {
  return spotifyTokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
}

export async function spotifyApi(path, accessToken, options = {}) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await parseSpotifyResponse(response, "Resposta invalida da API do Spotify");

  if (!response.ok) {
    throw new Error(data?.error?.message || "Falha na API do Spotify.");
  }

  return data;
}

export async function getValidSpotifyConnection(userId) {
  const connection = await getSpotifyConnection(userId);

  if (!connection) {
    throw new Error("Spotify ainda nao conectado.");
  }

  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
  const shouldRefresh = !connection.access_token || !expiresAt || expiresAt < Date.now() + 60_000;

  if (!shouldRefresh) {
    return connection;
  }

  const refreshed = await refreshSpotifyToken(connection.refresh_token);
  const updatedConnection = await upsertSpotifyConnection({
    user_id: connection.user_id,
    spotify_user_id: connection.spotify_user_id,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || connection.refresh_token,
    token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    scope: refreshed.scope || connection.scope,
    updated_at: new Date().toISOString()
  });

  return updatedConnection;
}

export async function buildSpotifyProfile(accessToken) {
  const [me, topArtists, topTracks] = await Promise.all([
    spotifyApi("/me", accessToken),
    spotifyApi("/me/top/artists?limit=10&time_range=medium_term", accessToken),
    spotifyApi("/me/top/tracks?limit=15&time_range=medium_term", accessToken)
  ]);

  const genres = [...new Set((topArtists.items || []).flatMap((artist) => artist.genres || []))].slice(0, 12);

  return {
    me: {
      id: me.id,
      display_name: me.display_name,
      country: me.country
    },
    topArtists: (topArtists.items || []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      genres: artist.genres || []
    })),
    topTracks: (topTracks.items || []).map((track) => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: (track.artists || []).map((artist) => artist.name)
    })),
    genres
  };
}
