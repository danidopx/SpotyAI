export function bindUI({ onLogin, onConnectSpotify, onAnalyze, onCreatePlaylist }) {
  document.querySelector("#login-button")?.addEventListener("click", onLogin);
  document.querySelector("#spotify-button")?.addEventListener("click", onConnectSpotify);
  document.querySelector("#analyze-button")?.addEventListener("click", onAnalyze);
  document.querySelector("#playlist-button")?.addEventListener("click", onCreatePlaylist);
}

export function getMomentPrompt() {
  return document.querySelector("#moment-input")?.value?.trim() || "";
}

export function renderAnalysis(value) {
  const target = document.querySelector("#analysis-output");
  if (target) {
    target.textContent = value;
  }
}

export function renderStatus(value) {
  const target = document.querySelector("#status-output");
  if (target) {
    target.textContent = value;
  }
}

export function askForEmail() {
  return window.prompt("Digite seu e-mail para receber o link magico do Supabase:");
}
