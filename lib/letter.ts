import JSZip from "jszip";
import { FormState } from "./types";
import { formatDate } from "./utils";

// Escapa caracteres especiais de XML
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTipoFrase(tipo: string | null): string | null {
  switch (tipo) {
    case "Aniversário": return "o aniversário";
    case "Casamento": return "o casamento";
    case "Confraternização / Corporativo": return "a confraternização";
    case "Almoço ou Jantar Privado": return "um momento especial";
    default: return null; // mantém o placeholder editável
  }
}

function getCardapioName(state: FormState): string | null {
  if (state.estilo.includes("Coffee Break") && state.coffeeBreak) return state.coffeeBreak;
  if (state.estilo.includes("Feijoada Completa")) {
    return state.feijoada ? `Feijoada ${state.feijoada}` : "Feijoada Completa";
  }
  if (state.estilo.includes("Jantar Harmonizado")) return "Jantar Harmonizado";
  if (state.estilo.includes("Jantar Temático")) return "Jantar Temático";
  return null; // mantém o placeholder editável
}

/**
 * Gera a carta-convite reaproveitando EXATAMENTE o template do cliente
 * (Carta_Convite_Aurum_Editavel_2.docx): mesmas fontes embutidas,
 * espaçamento, papel timbrado de fundo e layout em uma única página.
 * Apenas substitui os campos editáveis pelos dados do briefing,
 * deixando como placeholder o que ainda precisa ser preenchido à mão.
 */
export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const res = await fetch("/convite-template.docx");
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const docPath = "word/document.xml";
  let xml = await zip.file(docPath)!.async("string");

  // Substituições: só preenche quando há dado; senão mantém o placeholder
  const replacements: Array<[string, string | null]> = [
    ["[TIPO DO EVENTO]", getTipoFrase(state.tipo)],
    ["[DATA DO EVENTO]", state.data ? formatDate(state.data) : null],
    ["[HORÁRIO DO EVENTO]", state.horaInicio || null],
    ["[ENDEREÇO COMPLETO]", state.endereco?.trim() || null],
    ["[NOME DO CARDÁPIO]", getCardapioName(state)],
    ["[CONTATO PARA RSVP]", state.whatsapp?.trim() || null],
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
