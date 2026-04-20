import { sendJson } from "./_lib/json.js";
import { getValidSpotifyConnection } from "./_lib/spotify.js";
import { getAuthenticatedUser } from "./_lib/supabase.js";

export default async function handler(request, response) {
  try {
    const user = await getAuthenticatedUser(request);
    const connection = await getValidSpotifyConnection(user.id);

    sendJson(response, 200, {
      ok: true,
      spotify_user_id: connection.spotify_user_id,
      expires_at: connection.token_expires_at
    });
  } catch (error) {
    sendJson(response, 400, {
      ok: false,
      message: error.message
    });
  }
}
