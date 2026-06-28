import "server-only";

// Rate-limit simples em memória (best-effort). Em serverless o estado pode
// resetar entre invocações, mas já adiciona fricção contra força bruta na senha.
const baldes = new Map<string, { count: number; reset: number }>();

export function rateLimit(chave: string, max: number, janelaMs: number): boolean {
  const agora = Date.now();
  const b = baldes.get(chave);
  if (!b || agora > b.reset) {
    baldes.set(chave, { count: 1, reset: agora + janelaMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count++;
  return true;
}

export function ipDe(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "desconhecido";
}
