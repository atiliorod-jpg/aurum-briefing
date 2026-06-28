import { FormState } from "./types";
import {
  ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS, FEIJOADA_OPTIONS,
  BEBIDAS_KITS, COFFEE_PRECOS, MenuOption,
} from "./menu";
import {
  ADICIONAL_LOUCAS,
  FORMULA_BASE_PESSOAS, FORMULA_TAXA_ACRESCIMO, FORMULA_CAP_ACRESCIMO,
  FORMULA_INICIO_DESCONTO, FORMULA_TAXA_DESCONTO, FORMULA_CAP_DESCONTO,
  CUSTO_OP_POR_BLOCO, CUSTO_OP_BLOCO_QTDE,
  LOGISTICA_CONSUMO_KM_L, LOGISTICA_COMBUSTIVEL_RL, LOGISTICA_MIN_KM,
} from "./config";

export { ADICIONAL_LOUCAS } from "./config";

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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
  porPessoa: number;       // soma dos itens × pessoa antes do multiplicador
  multiplicador: number;   // ajuste por tamanho do grupo (1.0 = sem ajuste)
  foodTotal: number;       // (porPessoa × pessoas + tachoSubtotal) — antes do multiplicador
  total: number;           // foodTotal × multiplicador + custoOperacional + custoLogistica
  custoOperacional: number;
  custoLogistica: number;
  itens: { nome: string; preco: number }[];
  temItemSemPreco: boolean;
  incluiLoucas: boolean;
}

export const ESTILO_EMPRATADO = "Serviço franco-americano (empratado)";

// Quantas pessoas comem de cada tacho (distribuição informada pelo cliente).
export function pessoasDoTacho(state: FormState, value: string): number {
  const total = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  if (!state.tacho.includes(value)) return 0;
  if (state.tacho.length === 1) return total;
  const informado = Number(state.tachoPessoas[value]);
  return Number.isFinite(informado) && informado >= 0 ? informado : 0;
}

// Multiplicador contínuo por headcount: sobe para grupos pequenos, cai para grandes.
export function multiplicadorPessoas(pessoas: number): number {
  if (pessoas <= 0) return 1 + FORMULA_CAP_ACRESCIMO;
  if (pessoas >= FORMULA_BASE_PESSOAS) {
    const desconto = Math.min(
      Math.max(0, pessoas - FORMULA_INICIO_DESCONTO) * FORMULA_TAXA_DESCONTO,
      FORMULA_CAP_DESCONTO,
    );
    return 1.0 - desconto;
  }
  const acrescimo = Math.min(
    (FORMULA_BASE_PESSOAS - pessoas) * FORMULA_TAXA_ACRESCIMO,
    FORMULA_CAP_ACRESCIMO,
  );
  return 1.0 + acrescimo;
}

// Custo operacional fixo por bloco de convidados (equipe adicional de apoio).
export function calcCustoOperacional(pessoas: number): number {
  return Math.floor(pessoas / CUSTO_OP_BLOCO_QTDE) * CUSTO_OP_POR_BLOCO;
}

// Custo de logística por distância em linha reta (estimativa aproximada).
export function calcCustoLogistica(distanciaKm: number | null): number {
  if (!distanciaKm || distanciaKm < LOGISTICA_MIN_KM) return 0;
  return (distanciaKm * 2) / LOGISTICA_CONSUMO_KM_L * LOGISTICA_COMBUSTIVEL_RL;
}

export function estimar(state: FormState): Estimativa {
  const pessoas = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
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

  // Coffee Break
  if (state.coffeeBreak && COFFEE_PRECOS[state.coffeeBreak] != null) {
    const p = COFFEE_PRECOS[state.coffeeBreak];
    porPessoa += p;
    itens.push({ nome: state.coffeeBreak, preco: p });
  }

  // Bebidas em kit (quando "Incluir Aurum" selecionado)
  if (state.bebidas === "Incluir Aurum" && state.bebidasKit) {
    const kit = BEBIDAS_KITS.find((k) => k.value === state.bebidasKit);
    if (kit) {
      porPessoa += kit.preco;
      itens.push({ nome: kit.label, preco: kit.preco });
    }
  }

  // Tacho
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

  // Louças e talheres
  const incluiLoucas = state.mesas === "Incluir Aurum";
  if (incluiLoucas && (porPessoa > 0 || tachoSubtotal > 0)) {
    porPessoa += ADICIONAL_LOUCAS;
    itens.push({ nome: "Louças e talheres (básico)", preco: ADICIONAL_LOUCAS });
  }

  const foodTotal = porPessoa * pessoas + tachoSubtotal;
  const mult = pessoas > 0 ? multiplicadorPessoas(pessoas) : 1;
  const custoOperacional = pessoas > 0 ? calcCustoOperacional(pessoas) : 0;
  const custoLogistica = Math.round(calcCustoLogistica(state.distanciaKm));
  const total = Math.round(foodTotal * mult) + custoOperacional + custoLogistica;

  return {
    pessoas, porPessoa, multiplicador: mult, foodTotal,
    total, custoOperacional, custoLogistica,
    itens, temItemSemPreco, incluiLoucas,
  };
}

// Mostra o preço dos itens do cardápio (entradas/principais/sobremesas) só no empratado
export function mostrarPrecoCardapio(state: FormState): boolean {
  return state.estilo.includes(ESTILO_EMPRATADO);
}
