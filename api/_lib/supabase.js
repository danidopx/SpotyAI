import { getEnv } from "./env.js";

function getProjectConfig() {
  return {
    url: getEnv("SUPABASE_URL"),
    anonKey: getEnv("SUPABASE_ANON_KEY"),
    serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

export async function getAuthenticatedUser(request) {
  const header = request.headers.authorization || request.headers.Authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new Error("Token de autenticacao ausente.");
  }

  const { url, anonKey } = getProjectConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Sessao Supabase invalida.");
  }

  return response.json();
}

export async function supabaseAdmin(path, options = {}) {
  const { url, serviceRoleKey } = getProjectConfig();
  const response = await fetch(`${url}${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {})
    },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : JSON.stringify(data));
  }

  return data;
}

export async function getSpotifyConnection(userId) {
  const query = `/rest/v1/spotify_conexoes?user_id=eq.${encodeURIComponent(userId)}&select=*`;
  const data = await supabaseAdmin(query);
  return data?.[0] || null;
}

export async function upsertSpotifyConnection(connection) {
  const data = await supabaseAdmin("/rest/v1/spotify_conexoes?on_conflict=user_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=representation",
    headers: {
      "Content-Profile": "public"
    },
    body: connection
  });

  return data?.[0] || null;
}

export async function saveAiInteraction(record) {
  const data = await supabaseAdmin("/rest/v1/ai_interactions", {
    method: "POST",
    body: record
  });

  return data?.[0] || null;
}

export async function saveGeneratedPlaylist(record) {
  const data = await supabaseAdmin("/rest/v1/playlists_geradas", {
    method: "POST",
    body: record
  });

  return data?.[0] || null;
}

export async function listGeneratedPlaylists(userId) {
  return supabaseAdmin(
    `/rest/v1/playlists_geradas?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`
  );
}
