# SpotyAI

Plataforma web para conectar conta Spotify, entender gosto musical, gerar playlists e produzir analises com IA sobre momento, estilo, energia e identidade musical do usuario.

## Stack

- Frontend: SPA estatica em `public/`
- Backend: Vercel Functions em `api/`
- Banco, auth e persistencia: Supabase
- Integracao musical: Spotify Web API
- IA: provider configuravel por variaveis de ambiente

## Estrutura

- `public/index.html`: shell da aplicacao
- `public/styles.css`: identidade visual inicial
- `public/config.js`: configuracoes publicas do app
- `public/api.js`: cliente para chamadas ao backend
- `public/auth.js`: sessao Supabase no frontend
- `public/spotify.js`: login e acoes do Spotify no cliente
- `public/ui.js`: renderizacao e eventos
- `public/app.js`: bootstrap do app
- `api/health.js`: healthcheck rapido
- `api/spotify-login.js`: inicia OAuth com Spotify
- `api/spotify-callback.js`: callback OAuth
- `api/spotify-refresh.js`: renova token do Spotify
- `api/ai-analyze.js`: analise musical com IA
- `api/playlists.js`: cria e lista playlists geradas
- `supabase/migrations/`: esquema inicial do banco

## Fluxo sugerido

1. Usuario entra no app e faz login com Supabase.
2. Conecta a conta Spotify via OAuth.
3. O app coleta top tracks, artistas, generos e contexto informado pelo usuario.
4. O backend envia um prompt estruturado para a IA.
5. A resposta vira resumo de perfil musical, recomendacoes e playlist curada.
6. O resultado fica salvo no Supabase para historico e reuso.

## Variaveis de ambiente

- `SUPABASE_URL` (`https://jmidwvyllyhxtbqghmgx.supabase.co`)
- `SUPABASE_ANON_KEY` (`sb_publishable_v27vL1dlpWBNyOD9x14Lew_jsXJ3mGM`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `SPOTYAI_STATE_SECRET`
- `APP_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_BASE_URL`

Padrao atual de IA:

- `AI_MODEL=gemini-2.5-flash`
- `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`

## Proximos passos

1. Criar o projeto no Supabase e aplicar as migrations.
2. Criar o app no Spotify Developer Dashboard e cadastrar o callback.
3. Configurar os secrets na Vercel.
4. Testar a jornada: login por magic link, conectar Spotify, analisar perfil e gerar playlist privada.

## Arquivos de apoio

- `.env.local.example`: base para ambiente local e Vercel
- `DEPLOY_VERCEL.md`: checklist curto de deploy
- `supabase/sql/init_spotyai.sql`: SQL unico para aplicar direto no painel do Supabase
