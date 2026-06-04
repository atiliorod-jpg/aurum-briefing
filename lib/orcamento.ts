import { FormState } from "./types";
import {
  ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS, MenuOption,
} from "./menu";

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TABELA: MenuOption[] = [
  ...ENTRADAS_OPTIONS, ...PRINCIPAIS_OPTIONS, ...TACHO_OPTIONS, ...SOBREMESAS_OPTIONS,
];

export function precoDe(value: string): number | undefined {
  return TABELA.find((o) => o.value === value)?.preco;
}

// Itens "neutros" que não entram no cálculo
const IGNORAR = new Set(["Sem entradas", "Sem sobremesa", "Sem tacho", "Sugestão do chef"]);

export interface Estimativa {
  pessoas: number;
  porPessoa: number; // soma dos valores/pessoa dos itens com preço
  total: number;     // porPessoa × pessoas
  itens: { nome: string; preco: number }[];
  temItemSemPreco: boolean; // algum item selecionado ainda sem valor
}

export function estimar(state: FormState): Estimativa {
  const pessoas = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  const selecionados = [
    ...state.entradas, ...state.principais, ...state.tacho, ...state.sobremesas,
  ];

  let porPessoa = 0;
  const itens: { nome: string; preco: number }[] = [];
  let temItemSemPreco = false;

  for (const v of selecionados) {
    if (IGNORAR.has(v)) continue;
    const p = precoDe(v);
    if (p != null) {
      porPessoa += p;
      itens.push({ nome: v, preco: p });
    } else {
      temItemSemPreco = true;
    }
  }

  return { pessoas, porPessoa, total: porPessoa * pessoas, itens, temItemSemPreco };
}
