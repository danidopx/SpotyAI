import { analyzeProfile, checkHealth, createPlaylist, getSpotifyStatus, listPlaylists } from "./api.js";
import { getAccessToken, getCurrentUser, signInWithEmail, signOut } from "./auth.js";
import { DEFAULT_ANALYSIS_PROMPT } from "./config.js";
import { connectSpotify } from "./spotify.js";
import { askForEmail, bindUI, getMomentPrompt, renderAnalysis, renderStatus } from "./ui.js";

let latestAnalysis = null;

async function refreshStatus(flashMessage = "") {
  const user = await getCurrentUser();
  const accessToken = await getAccessToken();

  if (!user || !accessToken) {
    const visitorStatus = `Conta: visitante\nSpotify: desconectado\nPlaylists salvas: 0${
      flashMessage ? `\nAviso: ${flashMessage}` : ""
    }`;
    renderStatus(visitorStatus);
    return { user: null, accessToken: null };
  }

  const playlists = await listPlaylists(accessToken).catch(() => ({ items: [] }));
  const spotify = await getSpotifyStatus(accessToken).catch((error) => ({
    ok: false,
    message: error.message
  }));

  const spotifyLabel = spotify.ok
    ? `conectado (${spotify.spotify_user_id})`
    : `desconectado${spotify.message ? ` - ${spotify.message}` : ""}`;

  renderStatus(
    `Conta: ${user.email || user.id}\nSpotify: ${spotifyLabel}\nPlaylists salvas: ${
      playlists.items?.length || 0
    }${flashMessage ? `\nAviso: ${flashMessage}` : ""}`
  );

  return { user, accessToken, spotify };
}

async function bootstrap() {
  try {
    await checkHealth();
    await refreshStatus();
  } catch (error) {
    renderAnalysis(`Infra inicial pendente: ${error.message}`);
  }

  bindUI({
    onLogin: async () => {
      try {
        const email = askForEmail();

        if (!email) {
          return;
        }

        await signInWithEmail(email);
        renderStatus(`Link magico enviado para ${email}. Abra o e-mail e volte para o app.`);
      } catch (error) {
        renderStatus(`Falha no login: ${error.message}`);
      }
    },
    onConnectSpotify: async () => {
      try {
        const { user } = await refreshStatus();
        connectSpotify(user?.id);
      } catch (error) {
        renderStatus(`Falha ao conectar Spotify: ${error.message}`);
      }
    },
    onAnalyze: async () => {
      renderAnalysis("Gerando analise musical...");

      try {
        const { accessToken, spotify } = await refreshStatus();

        if (!accessToken) {
          throw new Error("Entre no app antes de analisar.");
        }

        if (!spotify?.ok) {
          throw new Error("Conecte novamente o Spotify antes de analisar.");
        }

        const data = await analyzeProfile(
          {
            prompt: DEFAULT_ANALYSIS_PROMPT,
            context: getMomentPrompt()
          },
          accessToken
        );

        latestAnalysis = data;
        renderAnalysis(JSON.stringify(data, null, 2));
      } catch (error) {
        renderAnalysis(`Falha ao analisar: ${error.message}`);
      }
    },
    onCreatePlaylist: async () => {
      try {
        const { accessToken, spotify } = await refreshStatus();

        if (!accessToken) {
          throw new Error("Entre no app antes de criar a playlist.");
        }

        if (!spotify?.ok) {
          throw new Error("Conecte novamente o Spotify antes de criar a playlist.");
        }

        const payload = {
          context: getMomentPrompt(),
          analysis: latestAnalysis?.analysis || null
        };

        const result = await createPlaylist(payload, accessToken);
        renderAnalysis(JSON.stringify(result, null, 2));
        await refreshStatus();
      } catch (error) {
        renderAnalysis(`Falha ao criar playlist: ${error.message}`);
      }
    },
    onLogout: async () => {
      try {
        await signOut();
        latestAnalysis = null;
        renderStatus("Sessao encerrada.");
        renderAnalysis("Aguardando analise...");
        await refreshStatus();
      } catch (error) {
        renderStatus(`Falha ao sair: ${error.message}`);
      }
    }
  });

  const url = new URL(window.location.href);
  const spotifyStatus = url.searchParams.get("spotify");
  const spotifyError = url.searchParams.get("spotify_error");
  let flashMessage = "";

  if (spotifyStatus === "connected") {
    flashMessage = "Spotify conectado com sucesso.";
    url.searchParams.delete("spotify");
  }

  if (spotifyError) {
    flashMessage = `Falha ao conectar Spotify: ${spotifyError}`;
    url.searchParams.delete("spotify_error");
  }

  if (spotifyStatus || spotifyError) {
    window.history.replaceState({}, "", url);
  }

  await refreshStatus(flashMessage);
}

bootstrap();
