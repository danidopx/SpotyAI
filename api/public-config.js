import { sendJson } from "./_lib/json.js";

export default function handler(_request, response) {
  sendJson(response, 200, {
    supabaseUrl: String(process.env.SUPABASE_URL || "").trim(),
    supabaseAnonKey: String(process.env.SUPABASE_ANON_KEY || "").trim()
  });
}
