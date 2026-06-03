import { FormState } from "./types";
import { formatDate, formatPhone, shiftHour } from "./utils";

// Frase do tipo de evento — encaixa em "celebrar conosco ___ <conector> ___"
export function getTipoFrase(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "a celebração do aniversário";
    case "Casamento": return "a celebração do casamento";
    case "Confraternização / Corporativo": return "a confraternização especial";
    case "Almoço ou Jantar Privado": return "a ocasião especial";
    default: return "[TIPO DO EVENTO]";
  }
}

// Conector entre tipo e nome (template traz " de "; Almoço/Jantar usa " promovida por ")
export function getConector(tipo: string | null): string {
  return tipo === "Almoço ou Jantar Privado" ? " promovida por " : " de ";
}

export function getNomePlaceholder(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "[NOME DO ANIVERSARIANTE]";
    case "Casamento": return "[NOMES DOS NOIVOS]";
    case "Confraternização / Corporativo": return "[NOME DA EMPRESA / ANFITRIÃO]";
    case "Almoço ou Jantar Privado": return "[NOME DO ANFITRIÃO]";
    default: return "[NOME DO ANFITRIÃO / EMPRESA]";
  }
}

export function getAssinaturaPlaceholder(tipo: string | null): string {
  switch (tipo) {
    case "Casamento": return "[NOIVOS / FAMÍLIA]";
    case "Confraternização / Corporativo": return "[EMPRESA / ORGANIZAÇÃO]";
    default: return "[NOME DO ANFITRIÃO / FAMÍLIA]";
  }
}

// Nome do cardápio = derivado do estilo de serviço escolhido
export function getCardapioName(state: FormState): string {
  const e = state.estilo;
  if (e.includes("Feijoada Completa")) return "Feijoada";
  if (e.includes("Coffee Break")) return state.coffeeBreak || "Coffee Break";
  if (e.includes("Jantar Harmonizado")) return "Jantar Harmonizado";
  if (e.includes("Jantar Temático")) return "Jantar Temático";
  if (e.includes("Serviço franco-americano (empratado)")) return "Menu Aurum Experience";
  if (e.includes("Serviço à americana (buffet)") || e.includes("Volante")) return "Cardápio Aurum Especial";
  if (e.includes("Tacho / Paellera")) {
    const pratos = state.tacho.filter((t) => t !== "Sem tacho");
    return pratos.length ? `Tacho/Paella de ${pratos.join(", ")}` : "Tacho/Paella";
  }
  return "[NOME DO CARDÁPIO]";
}

export interface InvitationContent {
  tipoFrase: string;
  conector: string;
  nome: string;
  data: string;
  horario: string;
  local: string;
  cardapio: string;
  dataLimite: string;
  contato: string;
  assinatura: string;
  /** true quando todos os campos editáveis foram preenchidos (sem placeholders) */
  completa: boolean;
}

export function resolveInvitation(state: FormState): InvitationContent {
  const nome = state.cartaHomenageado?.trim() || getNomePlaceholder(state.tipo);
  const data = state.data ? formatDate(state.data) : "[DATA DO EVENTO]";
  const horario = state.horaInicio ? shiftHour(state.horaInicio, -1) : "[HORÁRIO DO EVENTO]";
  const local = state.endereco?.trim() || "[ENDEREÇO COMPLETO]";
  const cardapio = getCardapioName(state);
  const dataLimite = state.cartaDataLimite?.trim() || "[DATA LIMITE PARA CONFIRMAÇÃO]";
  const contato = state.whatsapp?.trim() ? formatPhone(state.whatsapp) : "[CONTATO PARA RSVP]";
  const assinatura = state.cartaAssinatura?.trim() || getAssinaturaPlaceholder(state.tipo);

  const completa =
    !nome.includes("[") && !data.includes("[") && !horario.includes("[") &&
    !local.includes("[") && !cardapio.includes("[") && !dataLimite.includes("[") &&
    !contato.includes("[") && !assinatura.includes("[") &&
    !!state.tipo && state.tipo !== "Outro";

  return {
    tipoFrase: getTipoFrase(state.tipo),
    conector: getConector(state.tipo),
    nome, data, horario, local, cardapio, dataLimite, contato, assinatura, completa,
  };
}
