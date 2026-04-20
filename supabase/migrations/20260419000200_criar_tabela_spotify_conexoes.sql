CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.spotify_conexoes (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    spotify_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id)
);

ALTER TABLE public.spotify_conexoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver a propria conexao Spotify"
ON public.spotify_conexoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir a propria conexao Spotify"
ON public.spotify_conexoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem atualizar a propria conexao Spotify"
ON public.spotify_conexoes FOR UPDATE
USING (auth.uid() = user_id);

