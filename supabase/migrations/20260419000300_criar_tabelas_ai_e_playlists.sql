CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    prompt_base TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    prompt_id UUID REFERENCES public.ai_prompts(id),
    contexto_usuario TEXT,
    input_profile JSONB,
    raw_response TEXT,
    parsed_response JSONB,
    model_used TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.playlists_geradas (
    id UUID DEFAULT extensions.gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    interaction_id UUID REFERENCES public.ai_interactions(id),
    spotify_playlist_id TEXT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    mood TEXT,
    faixas JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists_geradas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver as proprias interacoes"
ON public.ai_interactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir as proprias interacoes"
ON public.ai_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem ver as proprias playlists"
ON public.playlists_geradas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem inserir as proprias playlists"
ON public.playlists_geradas FOR INSERT
WITH CHECK (auth.uid() = user_id);

INSERT INTO public.ai_prompts (slug, titulo, prompt_base)
VALUES (
    'analise-perfil-musical',
    'Analise de perfil musical',
    'Analise o gosto musical do usuario, explique o momento emocional, o estilo predominante e gere ideias de playlist com linguagem calorosa e objetiva.'
)
ON CONFLICT (slug) DO NOTHING;

