import { estaAutenticado } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CATALOGO } from "@/lib/admin-catalog";
import { TBL_PRECOS } from "@/lib/supabase";
import LoginForm from "@/components/admin/LoginForm";
import AdminPanel from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Aurum — Painel", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await estaAutenticado())) {
    return <LoginForm configurado={!!process.env.ADMIN_PASSWORD} />;
  }

  const sb = getSupabaseAdmin();
  const overridesIniciais: Record<string, number> = {};
  if (sb) {
    const { data } = await sb.from(TBL_PRECOS).select("id, preco");
    for (const r of (data ?? []) as Array<{ id: string; preco: number | string }>) {
      const n = typeof r.preco === "string" ? parseFloat(r.preco) : r.preco;
      if (Number.isFinite(n)) overridesIniciais[r.id] = n as number;
    }
  }

  return <AdminPanel catalogo={CATALOGO} overridesIniciais={overridesIniciais} supabaseOk={!!sb} />;
}
