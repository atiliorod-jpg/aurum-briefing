import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await encerrarSessao();
  return NextResponse.json({ ok: true });
}
