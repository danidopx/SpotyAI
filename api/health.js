import { sendJson } from "./_lib/json.js";

export default function handler(_request, response) {
  sendJson(response, 200, {
    ok: true,
    service: "spotyai",
    env: {
      supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      spotify: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
      ai: Boolean(process.env.AI_API_KEY)
    },
    timestamp: new Date().toISOString()
  });
}
