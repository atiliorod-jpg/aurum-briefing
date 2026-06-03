import JSZip from "jszip";
import { FormState } from "./types";
import { formatDate, formatPhone, shiftHour } from "./utils";

// Escapa caracteres especiais de XML
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Frase do tipo de evento — encaixa em "celebrar conosco ___ <conector> ___"
function getTipoFrase(tipo: string | null): string | null {
  switch (tipo) {
    case "Aniversário": return "a celebração do aniversário";
    case "Casamento": return "a celebração do casamento";
    case "Confraternização / Corporativo": return "a confraternização especial";
    case "Almoço ou Jantar Privado": return "a ocasião especial";
    default: return null; // mantém o placeholder editável
  }
}

// Conector entre o tipo do evento e o nome do anfitrião
// (o template traz " de "; Almoço/Jantar usa " promovida por ")
function getConector(tipo: string | null): string {
  return tipo === "Almoço ou Jantar Privado" ? " promovida por " : " de ";
}

// Placeholder do nome do homenageado/anfitrião — sempre com opção de empresa quando faz sentido
function getNomePlaceholder(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "[NOME DO ANIVERSARIANTE]";
    case "Casamento": return "[NOMES DOS NOIVOS]";
    case "Confraternização / Corporativo": return "[NOME DA EMPRESA / ANFITRIÃO]";
    case "Almoço ou Jantar Privado": return "[NOME DO ANFITRIÃO]";
    default: return "[NOME DO ANFITRIÃO / EMPRESA]";
  }
}

// Placeholder da assinatura
function getAssinaturaPlaceholder(tipo: string | null): string {
  switch (tipo) {
    case "Casamento": return "[NOIVOS / FAMÍLIA]";
    case "Confraternização / Corporativo": return "[EMPRESA / ORGANIZAÇÃO]";
    case "Aniversário": return "[NOME DO ANFITRIÃO / FAMÍLIA]";
    case "Almoço ou Jantar Privado": return "[NOME DO ANFITRIÃO / FAMÍLIA]";
    default: return "[NOME DO ANFITRIÃO / FAMÍLIA / EMPRESA]";
  }
}

// Nome do cardápio = derivado do estilo de serviço escolhido
function getCardapioName(state: FormState): string | null {
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
  return null; // mantém o placeholder editável para o anfitrião nomear
}

/**
 * Gera a carta-convite reaproveitando EXATAMENTE o template do cliente
 * (Carta_Convite_Aurum_Editavel_2.docx): mesmas fontes embutidas, espaçamento,
 * papel timbrado de fundo e layout em uma única página. Apenas substitui os
 * campos editáveis pelos dados do briefing, deixando como placeholder o que
 * ainda precisa ser preenchido à mão.
 */
export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const res = await fetch("/convite-template.docx");
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const docPath = "word/document.xml";
  let xml = await zip.file(docPath)!.async("string");

  // Conector entre tipo e nome: troca o run isolado " de " quando necessário
  const conector = getConector(state.tipo);
  if (conector !== " de ") {
    xml = xml.replace(
      '<w:t xml:space="preserve"> de </w:t>',
      `<w:t xml:space="preserve">${xmlEscape(conector)}</w:t>`,
    );
  }

  // Horário do convite = 1 hora antes do início do serviço (tempo de chegada dos convidados)
  const horarioConvite = state.horaInicio ? shiftHour(state.horaInicio, -1) : null;

  // Substituições: preenche quando há dado; ajusta placeholders para leitura fluida
  const replacements: Array<[string, string | null]> = [
    // Placeholders de texto (sempre ajustados, mesmo sem dado do briefing)
    ["[NOME DO ANFITRIÃO / ANIVERSARIANTE / CASAL]", getNomePlaceholder(state.tipo)],
    ["[NOME DO ANFITRIÃO / FAMÍLIA / NOIVOS]", getAssinaturaPlaceholder(state.tipo)],
    // Campos preenchidos com dados do briefing
    ["[TIPO DO EVENTO]", getTipoFrase(state.tipo)],
    ["[DATA DO EVENTO]", state.data ? formatDate(state.data) : null],
    ["[HORÁRIO DO EVENTO]", horarioConvite],
    ["[ENDEREÇO COMPLETO]", state.endereco?.trim() || null],
    ["[NOME DO CARDÁPIO]", getCardapioName(state)],
    ["[CONTATO PARA RSVP]", state.whatsapp?.trim() ? formatPhone(state.whatsapp) : null],
  ];

  for (const [placeholder, value] of replacements) {
    if (value) {
      xml = xml.split(placeholder).join(xmlEscape(value));
    }
  }

  zip.file(docPath, xml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}
