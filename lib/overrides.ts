import { getSupabase, TBL_PRECOS } from "./supabase";

// ────────────────────────────────────────────────────────────────────────────
// Camada de OVERRIDES de preços/parâmetros.
//
// Tudo que é editável pelo painel /admin é guardado na tabela `aurum_precos`
// como pares (id → valor). Aqui esses valores ficam num mapa em memória e são
// consultados pelo motor de cálculo e pelas telas. Se o Supabase não responder
// ou um id não existir, usa-se o valor padrão embutido no código — então o app
// NUNCA quebra e funciona normalmente antes mesmo de o banco estar populado.
//
// Convenção de ids:
//   - prato/kit/coffee: o próprio `value` do item (ex: "Galinhada", "Coffee Break Simples")
//   - kit de bebidas:   "kit:<value>"  (ex: "kit:espumante")
//   - parâmetro:        "cfg:<CONSTANTE>" (ex: "cfg:MINIMO_FATURAVEL_PESSOAS")
// ────────────────────────────────────────────────────────────────────────────

let overrides: Record<string, number> = {};
let carregado = false;

export function setOverrides(map: Record<string, number>): void {
  overrides = map || {};
  carregado = true;
}

export function overridesCarregados(): boolean {
  return carregado;
}

// Retorna o valor sobrescrito (se houver e for número finito) ou o padrão.
export function comOverride(id: string, padrao: number): number {
  const v = overrides[id];
  return typeof v === "number" && Number.isFinite(v) ? v : padrao;
}

export function getOverride(id: string): number | undefined {
  const v = overrides[id];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

// Aplica os overrides à lista de opções de cardápio (para exibição nos cards),
// usando o `value` como id. Itens sem preço base ficam inalterados.
export function aplicarPrecosMenu<T extends { value: string; preco?: number }>(opts: T[]): T[] {
  return opts.map((o) => (o.preco != null ? { ...o, preco: comOverride(o.value, o.preco) } : o));
}

// Busca os overrides no Supabase (leitura pública) e popula o mapa.
// Tolerante a falhas: qualquer erro deixa o app nos preços padrão.
export async function loadOverrides(): Promise<void> {
  const sb = getSupabase();
  if (!sb) { carregado = true; return; }
  try {
    const { data, error } = await sb.from(TBL_PRECOS).select("id, preco");
    if (error || !data) { carregado = true; return; }
    const map: Record<string, number> = {};
    for (const row of data as Array<{ id: string; preco: number | string }>) {
      const n = typeof row.preco === "string" ? parseFloat(row.preco) : row.preco;
      if (row.id && Number.isFinite(n)) map[row.id] = n as number;
    }
    setOverrides(map);
  } catch {
    carregado = true;
  }
}
