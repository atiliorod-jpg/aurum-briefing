import { NextResponse } from "next/server";
import { verificarSenha, criarSessao } from "@/lib/admin-auth";
import { rateLimit, ipDe } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Máximo 8 tentativas por IP a cada 5 minutos
  if (!rateLimit("login:" + ipDe(req), 8, 5 * 60_000)) {
    return NextResponse.json({ ok: false, erro: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  let senha = "";
  try {
    const body = await req.json();
    senha = typeof body?.senha === "string" ? body.senha : "";
  } catch {
    return NextResponse.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const token = verificarSenha(senha);
  if (!token) {
    return NextResponse.json({ ok: false, erro: "Senha incorreta." }, { status: 401 });
  }

  await criarSessao(token);
  return NextResponse.json({ ok: true });
}
