import JSZip from "jszip";
import { FormState } from "./types";
import { resolveInvitation } from "./invitation";

// Escapa caracteres especiais de XML
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Gera a carta-convite reaproveitando EXATAMENTE o template do cliente
 * (Carta_Convite_Aurum_Editavel_2.docx): mesmas fontes embutidas, espaçamento,
 * papel timbrado de fundo e layout em uma única página. Apenas substitui os
 * campos editáveis pelos dados do briefing, deixando como placeholder o que
 * ainda precisa ser preenchido à mão.
 */
export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const c = resolveInvitation(state);
  const res = await fetch("/convite-template.docx");
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const docPath = "word/document.xml";
  let xml = await zip.file(docPath)!.async("string");

  // Conector entre tipo e nome: troca o run isolado " de " pelo conector calculado
  // (contração automática: de/da/do/dos, ou "promovida por/pela/pelo" para almoço/jantar)
  xml = xml.replace(
    '<w:t xml:space="preserve"> de </w:t>',
    `<w:t xml:space="preserve">${xmlEscape(c.conector)}</w:t>`,
  );

  // Evita a repetição "cardápio ... Cardápio Aurum" — reescreve a frase do cardápio
  xml = xml.replace(
    "Para este momento, será servido o cardápio ",
    "Para este momento, preparamos uma seleção especial — ",
  );
  xml = xml.replace(
    ", preparado pela Aurum Serviços Gastronômicos, com uma seleção pensada para oferecer uma experiência elegante, acolhedora e especial.",
    " — assinada pela Aurum Serviços Gastronômicos, pensada para oferecer uma experiência elegante, acolhedora e especial.",
  );

  // Substituições dos campos. null = mantém placeholder do template.
  const replacements: Array<[string, string | null]> = [
    ["[NOME DO ANFITRIÃO / ANIVERSARIANTE / CASAL]", c.nome],
    ["[NOME DO ANFITRIÃO / FAMÍLIA / NOIVOS]", c.assinatura],
    ["[DATA LIMITE PARA CONFIRMAÇÃO]", c.dataLimite.includes("[") ? null : c.dataLimite],
    ["[TIPO DO EVENTO]", c.tipoFrase.includes("[") ? null : c.tipoFrase],
    ["[DATA DO EVENTO]", c.data.includes("[") ? null : c.data],
    ["[HORÁRIO DO EVENTO]", c.horario.includes("[") ? null : c.horario],
    ["[ENDEREÇO COMPLETO]", c.local.includes("[") ? null : c.local],
    ["[NOME DO CARDÁPIO]", c.cardapio.includes("[") ? null : c.cardapio],
    ["[CONTATO PARA RSVP]", c.contato.includes("[") ? null : c.contato],
  ];

  for (const [placeholder, value] of replacements) {
    if (value) xml = xml.split(placeholder).join(xmlEscape(value));
  }

  zip.file(docPath, xml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}
