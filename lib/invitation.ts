import { FormState } from "./types";
import { formatDate, formatPhone, shiftHour } from "./utils";

// Artigo (o/a) para um texto de evento livre, pela primeira palavra
function artigoEvento(text: string): "o" | "a" {
  const first = text.trim().toLowerCase().split(/\s+/)[0].replace(/[.,;:]/g, "");
  const fem = new Set([
    "festa", "celebração", "celebracao", "comemoração", "comemoracao", "cerimônia", "cerimonia",
    "recepção", "recepcao", "confraternização", "confraternizacao", "formatura", "festividade",
    "reunião", "reuniao", "noite", "tarde", "missa", "bodas", "ceia", "feira", "gala",
  ]);
  return fem.has(first) ? "a" : "o";
}

// Frase do tipo de evento — encaixa em "celebrar conosco ___ <conector> ___"
export function getTipoFrase(tipo: string | null, tipoOutro = ""): string {
  switch (tipo) {
    case "Aniversário": return "a celebração do aniversário";
    case "Casamento": return "a celebração do casamento";
    case "Confraternização / Corporativo": return "a confraternização especial";
    case "Almoço ou Jantar Privado": return "a ocasião especial";
    case "Outro": {
      const t = tipoOutro.trim();
      return t ? `${artigoEvento(t)} ${t}` : "[TIPO DO EVENTO]";
    }
    default: return "[TIPO DO EVENTO]";
  }
}

// Detecta o artigo do nome a partir da primeira palavra (heurística)
// Retorna "a" | "o" | "as" | "os" | null (nome próprio, sem artigo)
function getArtigo(name: string): "a" | "o" | "as" | "os" | null {
  if (!name || name.includes("[")) return null;
  const first = name.trim().toLowerCase().split(/\s+/)[0].replace(/[.,;:]/g, "");
  const femSing = new Set([
    "família", "familia", "construtora", "empresa", "organização", "organizacao",
    "associação", "associacao", "igreja", "loja", "confeitaria", "padaria", "escola",
    "turma", "equipe", "diretoria", "comissão", "comissao", "fábrica", "fabrica",
    "clínica", "clinica", "ong", "produtora", "incorporadora", "imobiliária", "imobiliaria",
    "prefeitura", "secretaria", "fundação", "fundacao", "cooperativa", "rede",
  ]);
  const mascSing = new Set([
    "grupo", "time", "condomínio", "condominio", "restaurante", "bar", "buffet",
    "instituto", "clube", "escritório", "escritorio", "conselho", "sindicato",
    "comitê", "comite", "colégio", "colegio", "hospital", "hotel", "salão", "salao",
  ]);
  const femPl = new Set(["famílias", "familias", "empresas", "lojas"]);
  const mascPl = new Set(["noivos", "amigos", "organizadores", "sócios", "socios", "aniversariantes"]);
  if (femSing.has(first)) return "a";
  if (mascSing.has(first)) return "o";
  if (femPl.has(first)) return "as";
  if (mascPl.has(first)) return "os";
  return null;
}

// Conector entre tipo e nome, com contração automática de preposição.
// Padrão: "de/da/do/das/dos". Almoço/Jantar: "promovida por/pela/pelo/...".
export function getConector(tipo: string | null, name: string): string {
  const art = getArtigo(name);
  if (tipo === "Almoço ou Jantar Privado") {
    const por = art === "a" ? "pela" : art === "o" ? "pelo" : art === "as" ? "pelas" : art === "os" ? "pelos" : "por";
    return ` promovida ${por} `;
  }
  const de = art === "a" ? "da" : art === "o" ? "do" : art === "as" ? "das" : art === "os" ? "dos" : "de";
  return ` ${de} `;
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

  const tipoFrase = getTipoFrase(state.tipo, state.tipoOutro);

  const completa =
    !tipoFrase.includes("[") && !nome.includes("[") && !data.includes("[") &&
    !horario.includes("[") && !local.includes("[") && !cardapio.includes("[") &&
    !dataLimite.includes("[") && !contato.includes("[") && !assinatura.includes("[");

  return {
    tipoFrase,
    conector: getConector(state.tipo, nome),
    nome, data, horario, local, cardapio, dataLimite, contato, assinatura, completa,
  };
}
