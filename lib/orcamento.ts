import { FormState } from "./types";
import {
  ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS, FEIJOADA_OPTIONS,
  ENTRADAS_BUFFET_OPTIONS, PRINCIPAIS_BUFFET_OPTIONS, SOBREMESAS_BUFFET_OPTIONS,
  SOBREMESAS_REGIONAIS_OPTIONS,
  BEBIDAS_KITS, COFFEE_PRECOS, MenuOption,
} from "./menu";
import {
  ADICIONAL_LOUCAS, MINIMO_FATURAVEL_PESSOAS,
  FORMULA_INICIO_DESCONTO, FORMULA_TAXA_DESCONTO, FORMULA_CAP_DESCONTO,
  CUSTO_OP_POR_BLOCO, CUSTO_OP_BLOCO_QTDE,
  LOGISTICA_CONSUMO_KM_L, LOGISTICA_COMBUSTIVEL_RL, LOGISTICA_MIN_KM, LOGISTICA_ARREDONDA,
} from "./config";

export { MINIMO_FATURAVEL_PESSOAS } from "./config";

export { ADICIONAL_LOUCAS } from "./config";

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TABELA: MenuOption[] = [
  ...ENTRADAS_OPTIONS, ...PRINCIPAIS_OPTIONS, ...TACHO_OPTIONS, ...SOBREMESAS_OPTIONS, ...FEIJOADA_OPTIONS,
  ...ENTRADAS_BUFFET_OPTIONS, ...PRINCIPAIS_BUFFET_OPTIONS, ...SOBREMESAS_BUFFET_OPTIONS,
  ...SOBREMESAS_REGIONAIS_OPTIONS,
];

export function precoDe(value: string): number | undefined {
  return TABELA.find((o) => o.value === value)?.preco;
}

// Itens "neutros" que não entram no cálculo
const IGNORAR = new Set([
  "Sem entradas", "Sem sobremesa", "Sem tacho", "Sugestão do chef",
  "Sem entradas buffet", "Sugestão do chef buffet", "Sem sobremesa buffet",
]);

export interface Estimativa {
  pessoas: number;
  pessoasFaturaveis: number; // = max(pessoas, MINIMO_FATURAVEL_PESSOAS)
  aplicouMinimo: boolean;    // true quando o grupo é menor que o mínimo faturável
  porPessoa: number;       // soma dos itens × pessoa antes do multiplicador
  multiplicador: number;   // ajuste por tamanho do grupo (1.0 = sem ajuste)
  foodTotal: number;       // (porPessoa × pessoasFaturaveis + tachoSubtotal) — antes do multiplicador
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

// Multiplicador por headcount: 1.0 por padrão; desconto progressivo só para
// grupos grandes (a partir de FORMULA_INICIO_DESCONTO). Grupos pequenos são
// tratados pelo faturamento mínimo (MINIMO_FATURAVEL_PESSOAS), não por percentual.
export function multiplicadorPessoas(pessoas: number): number {
  if (pessoas >= FORMULA_INICIO_DESCONTO) {
    const desconto = Math.min(
      (pessoas - FORMULA_INICIO_DESCONTO) * FORMULA_TAXA_DESCONTO,
      FORMULA_CAP_DESCONTO,
    );
    return 1.0 - desconto;
  }
  return 1.0;
}

// Custo operacional fixo por bloco de convidados (equipe adicional de apoio).
export function calcCustoOperacional(pessoas: number): number {
  return Math.floor(pessoas / CUSTO_OP_BLOCO_QTDE) * CUSTO_OP_POR_BLOCO;
}

// Custo de logística por distância em linha reta (estimativa aproximada).
// O valor final é sempre arredondado PARA CIMA em múltiplos de LOGISTICA_ARREDONDA
// (ex.: 73 → 75) — nunca deixa valor quebrado.
export function calcCustoLogistica(distanciaKm: number | null): number {
  if (!distanciaKm || distanciaKm < LOGISTICA_MIN_KM) return 0;
  const bruto = (distanciaKm * 2) / LOGISTICA_CONSUMO_KM_L * LOGISTICA_COMBUSTIVEL_RL;
  return Math.ceil(bruto / LOGISTICA_ARREDONDA) * LOGISTICA_ARREDONDA;
}

export function estimar(state: FormState): Estimativa {
  const pessoas = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  const empratado = state.estilo.includes(ESTILO_EMPRATADO);
  const hasBuffetVolante = state.estilo.some((x) =>
    ["Serviço à americana (buffet)", "Volante"].includes(x),
  );

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

  // Buffet / Volante: o cliente paga pela montagem do buffet, não por uma porção
  // integral de cada prato. Por isso usamos a MÉDIA dos pratos dentro da categoria
  // (em vez da soma), evitando inflar o valor quando há várias opções.
  const mediaCategoria = (lista: string[], aplicarPreco: boolean) => {
    if (!aplicarPreco) return;
    const precos: number[] = [];
    for (const v of lista) {
      if (IGNORAR.has(v)) continue;
      const p = precoDe(v);
      if (p != null) { precos.push(p); itens.push({ nome: v, preco: p }); }
      else temItemSemPreco = true;
    }
    if (precos.length) porPessoa += precos.reduce((a, b) => a + b, 0) / precos.length;
  };

  // Cardápio clássico (empratado + tacho)
  somar(state.entradas, empratado);
  somar(state.principais, empratado);
  somar(state.sobremesas, empratado);
  if (state.feijoada) somar([state.feijoada], true);

  // Cardápio buffet / volante (sempre precificado) — média por categoria
  mediaCategoria(state.entradasBuffet ?? [], hasBuffetVolante);
  mediaCategoria(state.principaisBuffet ?? [], hasBuffetVolante);
  mediaCategoria(state.sobremesasBuffet ?? [], hasBuffetVolante);

  // Sobremesas regionais (Feijoada + Tacho — sempre precificadas)
  somar(state.sobremesasRegionais ?? [], true);

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

  // Faturamento mínimo: grupos pequenos são cobrados como o mínimo de pessoas.
  const pessoasFaturaveis = pessoas > 0 ? Math.max(pessoas, MINIMO_FATURAVEL_PESSOAS) : 0;
  const aplicouMinimo = pessoas > 0 && pessoas < MINIMO_FATURAVEL_PESSOAS;

  const foodTotal = porPessoa * pessoasFaturaveis + tachoSubtotal;
  const mult = pessoas > 0 ? multiplicadorPessoas(pessoas) : 1;
  const custoOperacional = pessoas > 0 ? calcCustoOperacional(pessoas) : 0;
  const custoLogistica = calcCustoLogistica(state.distanciaKm);
  const total = Math.round(foodTotal * mult) + custoOperacional + custoLogistica;

  return {
    pessoas, pessoasFaturaveis, aplicouMinimo,
    porPessoa, multiplicador: mult, foodTotal,
    total, custoOperacional, custoLogistica,
    itens, temItemSemPreco, incluiLoucas,
  };
}

// Mostra o preço dos itens do cardápio (entradas/principais/sobremesas) só no empratado
export function mostrarPrecoCardapio(state: FormState): boolean {
  return state.estilo.includes(ESTILO_EMPRATADO);
}
