import { NextResponse } from "next/server";
import { estaAutenticado } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CATALOGO, IDS_VALIDOS } from "@/lib/admin-catalog";
import { TBL_PRECOS } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const META = new Map(CATALOGO.map((c) => [c.id, c]));
const PRECO_MAX = 1_000_000;

// Lê os overrides atuais (valores já alterados em relação ao padrão).
export async function GET() {
  if (!(await estaAutenticado())) {
    return NextResponse.json({ ok: false, erro: "Não autenticado." }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, erro: "Supabase não configurado no servidor." }, { status: 503 });

  const { data, error } = await sb.from(TBL_PRECOS).select("id, preco");
  if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });

  const precos: Record<string, number> = {};
  for (const row of (data ?? []) as Array<{ id: string; preco: number | string }>) {
    const n = typeof row.preco === "string" ? parseFloat(row.preco) : row.preco;
    if (Number.isFinite(n)) precos[row.id] = n as number;
  }
  return NextResponse.json({ ok: true, precos });
}

// Salva alterações. Body: { updates: [{ id, preco | null }] }
// preco null/"" → remove o override (volta ao padrão do código).
export async function POST(req: Request) {
  if (!(await estaAutenticado())) {
    return NextResponse.json({ ok: false, erro: "Não autenticado." }, { status: 401 });
  }
  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: false, erro: "Supabase não configurado no servidor." }, { status: 503 });

  let updates: Array<{ id: string; preco: number | null }> = [];
  try {
    const body = await req.json();
    updates = Array.isArray(body?.updates) ? body.updates : [];
  } catch {
    return NextResponse.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const upserts: Array<{ id: string; preco: number; rotulo: string; categoria: string; updated_at: string }> = [];
  const deletes: string[] = [];

  for (const u of updates) {
    if (typeof u?.id !== "string" || !IDS_VALIDOS.has(u.id)) {
      return NextResponse.json({ ok: false, erro: `Item inválido: ${u?.id}` }, { status: 400 });
    }
    if (u.preco === null || (u.preco as unknown) === "") {
      deletes.push(u.id);
      continue;
    }
    const n = typeof u.preco === "string" ? parseFloat(u.preco) : u.preco;
    if (!Number.isFinite(n) || (n as number) < 0 || (n as number) > PRECO_MAX) {
      return NextResponse.json({ ok: false, erro: `Valor inválido para ${u.id}` }, { status: 400 });
    }
    const meta = META.get(u.id);
    upserts.push({
      id: u.id,
      preco: n as number,
      rotulo: meta?.rotulo ?? u.id,
      categoria: meta?.categoria ?? "",
      updated_at: new Date().toISOString(),
    });
  }

  if (upserts.length) {
    const { error } = await sb.from(TBL_PRECOS).upsert(upserts, { onConflict: "id" });
    if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }
  if (deletes.length) {
    const { error } = await sb.from(TBL_PRECOS).delete().in("id", deletes);
    if (error) return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, salvos: upserts.length, removidos: deletes.length });
}
