import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

// Autenticação simples do painel /admin (sem login completo). A proteção é a
// ADMIN_PASSWORD (só no servidor). No login, comparamos a senha de forma
// timing-safe; se bater, gravamos um cookie httpOnly cujo valor é uma assinatura
// HMAC derivada da própria senha — então o cookie não pode ser forjado por quem
// não conhece a senha.

const COOKIE = "aurum_admin";
const MAX_AGE = 60 * 60 * 8; // 8 horas

function senhaConfigurada(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length > 0 ? p : null;
}

function assinatura(secret: string): string {
  return crypto.createHmac("sha256", secret).update("aurum-admin-session-v1").digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Verifica a senha enviada no login. Retorna o token de sessão se correta.
export function verificarSenha(senha: string): string | null {
  const real = senhaConfigurada();
  if (!real) return null; // sem ADMIN_PASSWORD definida, ninguém entra
  if (typeof senha !== "string" || senha.length === 0) return null;
  // Compara contra a senha real de forma timing-safe (mesmo tamanho via hash).
  const hSenha = crypto.createHash("sha256").update(senha).digest("hex");
  const hReal = crypto.createHash("sha256").update(real).digest("hex");
  if (!timingSafeEqual(hSenha, hReal)) return null;
  return assinatura(real);
}

export async function criarSessao(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function encerrarSessao(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

// True se o cookie de sessão for válido para a ADMIN_PASSWORD atual.
export async function estaAutenticado(): Promise<boolean> {
  const real = senhaConfigurada();
  if (!real) return false;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  return timingSafeEqual(token, assinatura(real));
}
