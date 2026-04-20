import { readJsonBody } from "./_lib/http.js";
import { buildSpotifyProfile, getValidSpotifyConnection, spotifyApi } from "./_lib/spotify.js";
import {
  getAuthenticatedUser,
  listGeneratedPlaylists,
  saveGeneratedPlaylist
} from "./_lib/supabase.js";
import { sendJson } from "./_lib/json.js";

function uniqueTrackUris(topTracks) {
  return [...new Set((topTracks || []).map((track) => track.uri).filter(Boolean))].slice(0, 20);
}

export default async function handler(request, response) {
  try {
    const user = await getAuthenticatedUser(request);

    if (request.method === "GET") {
      const items = await listGeneratedPlaylists(user.id);
      return sendJson(response, 200, {
        ok: true,
        items
      });
    }

    if (request.method !== "POST") {
      return sendJson(response, 405, {
        ok: false,
        message: "Metodo nao permitido."
      });
    }

    const body = await readJsonBody(request);
    const connection = await getValidSpotifyConnection(user.id);
    const profile = await buildSpotifyProfile(connection.access_token);
    const trackUris = uniqueTrackUris(profile.topTracks);

    if (!trackUris.length) {
      throw new Error("Nao ha musicas suficientes no perfil para criar a playlist.");
    }

    const analysis = body.analysis || {};
    const title = analysis.playlistTitle || `SpotyAI - ${body.context || "Seu momento"}`;
    const description =
      analysis.playlistDescription ||
      "Playlist criada automaticamente pelo SpotyAI com base no seu historico do Spotify.";

    const createdPlaylist = await spotifyApi(`/users/${profile.me.id}/playlists`, connection.access_token, {
      method: "POST",
      body: {
        name: title,
        description,
        public: false
      }
    });

    await spotifyApi(`/playlists/${createdPlaylist.id}/tracks`, connection.access_token, {
      method: "POST",
      body: {
        uris: trackUris
      }
    });

    const saved = await saveGeneratedPlaylist({
      user_id: user.id,
      spotify_playlist_id: createdPlaylist.id,
      titulo: title,
      descricao: description,
      mood: body.context || null,
      faixas: profile.topTracks.slice(0, trackUris.length)
    });

    return sendJson(response, 200, {
      ok: true,
      playlist: createdPlaylist,
      saved
    });
  } catch (error) {
    return sendJson(response, 400, {
      ok: false,
      message: error.message
    });
  }
}
