CREATE TABLE IF NOT EXISTS public.perfis_usuarios (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    nome_exibicao TEXT,
    bio_musical TEXT,
    momento_atual TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.perfis_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver o proprio perfil musical"
ON public.perfis_usuarios FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuarios podem inserir o proprio perfil musical"
ON public.perfis_usuarios FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios podem atualizar o proprio perfil musical"
ON public.perfis_usuarios FOR UPDATE
USING (auth.uid() = id);

