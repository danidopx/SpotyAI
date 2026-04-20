# Deploy Vercel

## 1. Variaveis obrigatorias

Cadastre no projeto da Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `SPOTYAI_STATE_SECRET`
- `APP_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_BASE_URL`

## 2. Valores recomendados

### Desenvolvimento local

- `SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify-callback`
- `APP_URL=http://localhost:3000`

### Producao Vercel

Troque pelos valores finais do dominio publicado:

- `SPOTIFY_REDIRECT_URI=https://SEU-DOMINIO/api/spotify-callback`
- `APP_URL=https://SEU-DOMINIO`

## 3. Spotify Developer Dashboard

No app do Spotify, cadastre estes Redirect URIs:

- `http://localhost:3000/api/spotify-callback`
- `https://SEU-DOMINIO/api/spotify-callback`

Scopes usados hoje:

- `user-read-email`
- `user-read-private`
- `user-top-read`
- `playlist-read-private`
- `playlist-modify-private`
- `playlist-modify-public`

## 4. Fluxo de deploy

1. Suba o codigo para `main`.
2. Importe o repositório `danidopx/SpotyAI` na Vercel.
3. Configure as variaveis de ambiente.
4. Rode o primeiro deploy.
5. Atualize `APP_URL` e `SPOTIFY_REDIRECT_URI` para o dominio final.
6. Rode novo deploy para validar o callback do Spotify.

## 5. Teste minimo

1. Abrir o app.
2. Clicar em `Entrar`.
3. Confirmar o magic link do Supabase.
4. Clicar em `Conectar Spotify`.
5. Clicar em `Analisar perfil`.
6. Clicar em `Criar playlist`.

