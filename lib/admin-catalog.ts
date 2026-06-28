// Catálogo de TUDO que é editável no painel /admin. Cada entrada tem o `id`
// (mesma convenção de lib/overrides.ts), um rótulo amigável, a categoria para
// agrupar na tela e o valor PADRÃO embutido no código. O painel mostra o padrão
// e grava em aurum_precos só o que você alterar.
import {
  ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS, FEIJOADA_OPTIONS,
  ENTRADAS_BUFFET_OPTIONS, PRINCIPAIS_BUFFET_OPTIONS, SOBREMESAS_BUFFET_OPTIONS,
  SOBREMESAS_REGIONAIS_OPTIONS, COFFEE_PRECOS, BEBIDAS_KITS, type MenuOption,
} from "./menu";
import {
  MINIMO_FATURAVEL_PESSOAS, ADICIONAL_LOUCAS,
  CUSTO_OP_POR_BLOCO, CUSTO_OP_BLOCO_QTDE,
  FORMULA_INICIO_DESCONTO, FORMULA_TAXA_DESCONTO, FORMULA_CAP_DESCONTO,
  LOGISTICA_CONSUMO_KM_L, LOGISTICA_COMBUSTIVEL_RL, LOGISTICA_MIN_KM,
} from "./config";

export interface ItemEditavel {
  id: string;
  rotulo: string;
  categoria: string;
  padrao: number;
  sufixo?: string; // ex: "/pessoa", "%", "km"
}

const dishes = (opts: MenuOption[], categoria: string): ItemEditavel[] =>
  opts
    .filter((o) => o.preco != null)
    .map((o) => ({ id: o.value, rotulo: o.label, categoria, padrao: o.preco as number, sufixo: "/pessoa" }));

export const CATALOGO: ItemEditavel[] = [
  // ── Parâmetros de cálculo ──────────────────────────────────────────────
  { id: "cfg:MINIMO_FATURAVEL_PESSOAS", rotulo: "Mínimo faturável", categoria: "Parâmetros de cálculo", padrao: MINIMO_FATURAVEL_PESSOAS, sufixo: " pessoas" },
  { id: "cfg:ADICIONAL_LOUCAS", rotulo: "Adicional de louças", categoria: "Parâmetros de cálculo", padrao: ADICIONAL_LOUCAS, sufixo: "/pessoa" },
  { id: "cfg:CUSTO_OP_POR_BLOCO", rotulo: "Equipe de apoio (valor por bloco)", categoria: "Parâmetros de cálculo", padrao: CUSTO_OP_POR_BLOCO, sufixo: " R$" },
  { id: "cfg:CUSTO_OP_BLOCO_QTDE", rotulo: "Tamanho do bloco de equipe", categoria: "Parâmetros de cálculo", padrao: CUSTO_OP_BLOCO_QTDE, sufixo: " pessoas" },
  { id: "cfg:FORMULA_INICIO_DESCONTO", rotulo: "Desconto começa a partir de", categoria: "Parâmetros de cálculo", padrao: FORMULA_INICIO_DESCONTO, sufixo: " pessoas" },
  { id: "cfg:FORMULA_TAXA_DESCONTO", rotulo: "Taxa de desconto por pessoa (0,002 = 0,2%)", categoria: "Parâmetros de cálculo", padrao: FORMULA_TAXA_DESCONTO },
  { id: "cfg:FORMULA_CAP_DESCONTO", rotulo: "Desconto máximo (0,12 = 12%)", categoria: "Parâmetros de cálculo", padrao: FORMULA_CAP_DESCONTO },
  { id: "cfg:LOGISTICA_CONSUMO_KM_L", rotulo: "Consumo do veículo (km/litro)", categoria: "Parâmetros de cálculo", padrao: LOGISTICA_CONSUMO_KM_L, sufixo: " km/L" },
  { id: "cfg:LOGISTICA_COMBUSTIVEL_RL", rotulo: "Preço do combustível", categoria: "Parâmetros de cálculo", padrao: LOGISTICA_COMBUSTIVEL_RL, sufixo: " R$/L" },
  { id: "cfg:LOGISTICA_MIN_KM", rotulo: "Distância mínima p/ cobrar deslocamento", categoria: "Parâmetros de cálculo", padrao: LOGISTICA_MIN_KM, sufixo: " km" },

  // ── Pratos ─────────────────────────────────────────────────────────────
  ...dishes(ENTRADAS_OPTIONS, "Entradas (empratado)"),
  ...dishes(PRINCIPAIS_OPTIONS, "Principais (empratado)"),
  ...dishes(SOBREMESAS_OPTIONS, "Sobremesas (empratado)"),
  ...dishes(ENTRADAS_BUFFET_OPTIONS, "Entradas (buffet/volante)"),
  ...dishes(PRINCIPAIS_BUFFET_OPTIONS, "Principais (buffet/volante)"),
  ...dishes(SOBREMESAS_BUFFET_OPTIONS, "Sobremesas (buffet/volante)"),
  ...dishes(TACHO_OPTIONS, "Tacho / Paellera"),
  ...dishes(FEIJOADA_OPTIONS, "Feijoada"),
  ...dishes(SOBREMESAS_REGIONAIS_OPTIONS, "Sobremesas regionais"),

  // ── Coffee Break ───────────────────────────────────────────────────────
  ...Object.entries(COFFEE_PRECOS).map(([nome, preco]) => ({
    id: nome, rotulo: nome, categoria: "Coffee Break", padrao: preco, sufixo: "/pessoa",
  })),

  // ── Kits de bebida ─────────────────────────────────────────────────────
  ...BEBIDAS_KITS.map((k) => ({
    id: "kit:" + k.value, rotulo: k.label, categoria: "Kits de bebida", padrao: k.preco, sufixo: "/pessoa",
  })),
];

// Conjunto de ids válidos — usado para validar gravações no servidor.
export const IDS_VALIDOS = new Set(CATALOGO.map((c) => c.id));
