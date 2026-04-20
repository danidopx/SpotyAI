async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Falha na requisicao.");
  }

  return response.json();
}

export function checkHealth() {
  return request("/api/health");
}

export function startSpotifyLogin(userId) {
  const url = new URL("/api/spotify-login", window.location.origin);
  url.searchParams.set("user_id", userId);
  window.location.href = url.toString();
}

export function analyzeProfile(payload, accessToken) {
  return request("/api/ai-analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
}

export function createPlaylist(payload, accessToken) {
  return request("/api/playlists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
}

export function listPlaylists(accessToken) {
  return request("/api/playlists", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function getSpotifyStatus(accessToken) {
  return request("/api/spotify-refresh", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}
