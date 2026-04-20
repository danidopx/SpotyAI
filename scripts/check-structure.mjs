import { access } from "node:fs/promises";
import { constants } from "node:fs";

const requiredPaths = [
  "public/index.html",
  "api/health.js",
  "api/spotify-login.js",
  "api/ai-analyze.js",
  "supabase/migrations/20260419000100_criar_tabela_perfis_usuarios.sql"
];

await Promise.all(
  requiredPaths.map(async (filePath) => {
    await access(filePath, constants.F_OK);
  })
);

console.log("Estrutura principal OK.");
