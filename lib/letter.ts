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

// Frase do tipo de evento — encaixa em "celebrar conosco ___ de ___"
function getTipoFrase(tipo: string | null): string | null {
  switch (tipo) {
    case "Aniversário": return "o aniversário";
    case "Casamento": return "o casamento";
    case "Confraternização / Corporativo": return "a confraternização";
    case "Almoço ou Jantar Privado": return "uma ocasião especial";
    default: return null; // mantém o placeholder editável
  }
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

// Nome do cardápio = derivado do estilo de serviço (Feijoada → apenas "Feijoada")
function getCardapioName(state: FormState): string | null {
  if (state.estilo.includes("Feijoada Completa")) return "Feijoada";
  if (state.estilo.includes("Coffee Break")) return state.coffeeBreak || "Coffee Break";
  if (state.estilo.includes("Jantar Harmonizado")) return "Jantar Harmonizado";
  if (state.estilo.includes("Jantar Temático")) return "Jantar Temático";
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
