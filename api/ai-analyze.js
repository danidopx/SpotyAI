import { getEnv } from "./_lib/env.js";
import { readJsonBody } from "./_lib/http.js";
import { buildSpotifyProfile, getValidSpotifyConnection } from "./_lib/spotify.js";
import { getAuthenticatedUser, saveAiInteraction } from "./_lib/supabase.js";
import { sendJson } from "./_lib/json.js";

function buildFallbackAnalysis(profile, context) {
  const mainGenres = profile.genres.slice(0, 5);
  const topArtists = profile.topArtists.slice(0, 3).map((artist) => artist.name);
  const topTracks = profile.topTracks.slice(0, 5).map((track) => track.name);

  return {
    summary: `Seu perfil mistura ${mainGenres.join(", ") || "varios estilos"} com forte presenca de ${topArtists.join(", ")}.`,
    identity: `Ouvinte com tendencia a ${mainGenres[0] || "descoberta musical"} e repertorio guiado por contexto.`,
    moods: [context || "sem contexto informado", ...mainGenres].filter(Boolean).slice(0, 5),
    playlistTitle: `SpotyAI - ${context || "Seu Momento"}`,
    playlistDescription: `Playlist gerada com base em ${topTracks.slice(0, 3).join(", ") || "seu historico recente"}.`
  };
}

async function callOpenAiCompatibleApi(messages, model) {
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = getEnv("AI_API_KEY");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Falha ao chamar a IA.");
  }

  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { ok: false, message: "Metodo nao permitido." });
  }

  try {
    const user = await getAuthenticatedUser(request);
    const body = await readJsonBody(request);
    const { prompt, context } = body || {};
    const model = process.env.AI_MODEL || "gpt-4.1-mini";
    const connection = await getValidSpotifyConnection(user.id);
    const profile = await buildSpotifyProfile(connection.access_token);

    let analysis;

    try {
      analysis = await callOpenAiCompatibleApi(
        [
          {
            role: "system",
            content:
              "Voce recebe um perfil musical do Spotify e deve responder somente em JSON com summary, identity, moods, playlistTitle e playlistDescription."
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt,
              context,
              spotifyProfile: profile
            })
          }
        ],
        model
      );
    } catch (_error) {
      analysis = buildFallbackAnalysis(profile, context);
    }

    const interaction = await saveAiInteraction({
      user_id: user.id,
      contexto_usuario: context || null,
      input_profile: profile,
      raw_response: JSON.stringify(analysis),
      parsed_response: analysis,
      model_used: model
    });

    return sendJson(response, 200, {
      ok: true,
      model,
      interactionId: interaction?.id || null,
      analysis,
      spotifyProfile: profile
    });
  } catch (error) {
    return sendJson(response, 400, {
      ok: false,
      message: error.message
    });
  }
}
