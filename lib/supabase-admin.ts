import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente ADMIN (service_role) — SOMENTE no servidor. A chave service_role
// ignora o RLS, então só pode ser usada em rotas server-side autenticadas.
// O import "server-only" garante erro de build se alguém tentar usá-la no client.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!admin) {
    admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
