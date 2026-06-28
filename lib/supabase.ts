import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente público (anon key) — usado só para LEITURA de preços/config no navegador.
// A escrita nunca passa por aqui: vai por rota server-side com a service-role key.
// Se as variáveis não estiverem configuradas, retorna null e o app cai no fallback
// dos preços embutidos no código (nunca quebra).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  if (!client) {
    client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

// Prefixo das tabelas da Aurum dentro do projeto compartilhado "estoque controle aurum".
export const TBL_PRECOS = "aurum_precos";
export const TBL_BRIEFINGS = "aurum_briefings";
