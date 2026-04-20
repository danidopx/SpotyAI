let publicConfigPromise;

export async function loadPublicConfig() {
  if (!publicConfigPromise) {
    publicConfigPromise = fetch("/api/public-config").then(async (response) => {
      if (!response.ok) {
        throw new Error("Nao foi possivel carregar a configuracao publica.");
      }

      return response.json();
    });
  }

  return publicConfigPromise;
}

export const DEFAULT_ANALYSIS_PROMPT =
  "Analise o gosto musical do usuario com base no Spotify, no contexto enviado e nos sinais emocionais. Retorne um JSON com summary, identity, moods, playlistTitle e playlistDescription.";
