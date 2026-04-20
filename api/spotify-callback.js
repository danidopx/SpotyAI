import { decodeState } from "./_lib/state.js";
import { exchangeSpotifyCode, spotifyApi } from "./_lib/spotify.js";
import { upsertSpotifyConnection } from "./_lib/supabase.js";

export default async function handler(request, response) {
  const { code, state, error } = request.query;

  if (error) {
    response.status(400).send(error);
    return;
  }

  try {
    const decodedState = decodeState(state);
    const tokenData = await exchangeSpotifyCode(code);
    const spotifyUser = await spotifyApi("/me", tokenData.access_token);

    await upsertSpotifyConnection({
      user_id: decodedState.userId,
      spotify_user_id: spotifyUser.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      scope: tokenData.scope,
      updated_at: new Date().toISOString()
    });

    const redirectUrl = new URL(decodedState.returnTo);
    redirectUrl.searchParams.set("spotify", "connected");
    response.redirect(redirectUrl.toString());
  } catch (callbackError) {
    response.status(500).send(callbackError.message);
  }
}
