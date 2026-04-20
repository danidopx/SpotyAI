import { sendJson } from "./_lib/json.js";

export default function handler(_request, response) {
  sendJson(response, 200, {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  });
}
