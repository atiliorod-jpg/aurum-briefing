import { FormState } from "./types";
import {
  ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS, FEIJOADA_OPTIONS, MenuOption,
} from "./menu";

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Adicional médio de louças e talheres (por pessoa) quando incluído na proposta Aurum.
// Valor de partida; pode variar (10 a 15) conforme os pratos escolhidos.
export const ADICIONAL_LOUCAS = 10;

const TABELA: MenuOption[] = [
  ...ENTRADAS_OPTIONS, ...PRINCIPAIS_OPTIONS, ...TACHO_OPTIONS, ...SOBREMESAS_OPTIONS, ...FEIJOADA_OPTIONS,
];

export function precoDe(value: string): number | undefined {
  return TABELA.find((o) => o.value === value)?.preco;
}

// Itens "neutros" que não entram no cálculo
const IGNORAR = new Set(["Sem entradas", "Sem sobremesa", "Sem tacho", "Sugestão do chef"]);

export interface Estimativa {
  pessoas: number;
  porPessoa: number; // soma dos valores/pessoa dos itens com preço (+ louças, se incluído)
  total: number;     // porPessoa × pessoas
  itens: { nome: string; preco: number }[];
  temItemSemPreco: boolean; // algum item selecionado ainda sem valor
  incluiLoucas: boolean;    // adicional de louças e talheres somado
}

export const ESTILO_EMPRATADO = "Serviço franco-americano (empratado)";

// Quantas pessoas comem de cada tacho. Com 1 tacho, todos comem dele; com 2, usa a
// distribuição informada pelo cliente (default: divide o total entre os dois).
export function pessoasDoTacho(state: FormState, value: string): number {
  const total = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  if (!state.tacho.includes(value)) return 0;
  if (state.tacho.length === 1) return total;
  const informado = Number(state.tachoPessoas[value]);
  return Number.isFinite(informado) && informado >= 0 ? informado : 0;
}

export function estimar(state: FormState): Estimativa {
  const pessoas = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  // Por ora, os valores de entradas/principais/sobremesas valem só no empratado.
  // Feijoada tem preço próprio e conta para todos os convidados.
  const empratado = state.estilo.includes(ESTILO_EMPRATADO);

  let porPessoa = 0;
  const itens: { nome: string; preco: number }[] = [];
  let temItemSemPreco = false;

  const somar = (lista: string[], aplicarPreco: boolean) => {
    for (const v of lista) {
      if (IGNORAR.has(v)) continue;
      const p = aplicarPreco ? precoDe(v) : undefined;
      if (p != null) {
        porPessoa += p;
        itens.push({ nome: v, preco: p });
      } else if (aplicarPreco) {
        temItemSemPreco = true;
      }
    }
  };

  somar(state.entradas, empratado);
  somar(state.principais, empratado);
  somar(state.sobremesas, empratado);
  if (state.feijoada) somar([state.feijoada], true);

  // Tacho:
  // • 1 tacho → todos os convidados comem dele, entra em porPessoa (igual à feijoada)
  // • 2 tachos → o cliente distribui os convidados; cada tacho tem seu subtotal próprio
  let tachoSubtotal = 0;
  if (state.tacho.length === 1) {
    somar(state.tacho, true);
  } else if (state.tacho.length >= 2) {
    for (const v of state.tacho) {
      if (IGNORAR.has(v)) continue;
      const p = precoDe(v);
      if (p == null) { temItemSemPreco = true; continue; }
      tachoSubtotal += p * pessoasDoTacho(state, v);
      itens.push({ nome: v, preco: p });
    }
  }

  // Louças e talheres na proposta Aurum: adicional por pessoa (vale se há comida).
  const incluiLoucas = state.mesas === "Incluir Aurum";
  if (incluiLoucas && (porPessoa > 0 || tachoSubtotal > 0)) {
    porPessoa += ADICIONAL_LOUCAS;
    itens.push({ nome: "Louças e talheres (básico)", preco: ADICIONAL_LOUCAS });
  }

  const total = porPessoa * pessoas + tachoSubtotal;
  return { pessoas, porPessoa, total, itens, temItemSemPreco, incluiLoucas };
}

// Mostra o preço dos itens do cardápio (entradas/principais/sobremesas) só no empratado
export function mostrarPrecoCardapio(state: FormState): boolean {
  return state.estilo.includes(ESTILO_EMPRATADO);
}
