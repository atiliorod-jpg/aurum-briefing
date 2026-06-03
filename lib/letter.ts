import {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  LevelFormat, BorderStyle, ImageRun, Footer, Header,
} from "docx";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY = "1B2A41";
const GOLD = "C9A24B";
const GREY = "5A6478";

const FONT_HEADING = "Georgia";
const FONT_BODY = "Calibri";

function paragraph(text: string, opts: {
  bold?: boolean; italic?: boolean; size?: number; color?: string;
  align?: typeof AlignmentType[keyof typeof AlignmentType];
  font?: string; spaceAfter?: number; spaceBefore?: number;
} = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { after: opts.spaceAfter ?? 120, before: opts.spaceBefore ?? 0 },
    children: [new TextRun({
      text,
      bold: opts.bold,
      italics: opts.italic,
      size: opts.size ?? 22, // half-points
      color: opts.color ?? NAVY,
      font: opts.font ?? FONT_BODY,
    })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { after: 80 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "•  ", color: GOLD, bold: true, size: 22, font: FONT_BODY }),
      new TextRun({ text, size: 22, color: NAVY, font: FONT_BODY }),
    ],
  });
}

function divider() {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 6 },
    },
    spacing: { after: 160, before: 80 },
    children: [],
  });
}

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const eventDate = state.data ? formatDate(state.data) : "[data a definir]";
  const clientName = state.nome || "[Nome do cliente]";
  const eventType = state.tipo === "Outro" ? state.tipoOutro : (state.tipo || "[tipo de evento]");
  const guests = state.adultos || "[número de convidados]";
  const horario = state.horaInicio ? `a partir das ${state.horaInicio}${state.horaFim ? ` até ${state.horaFim}` : ""}` : "";
  const local = state.endereco || "[endereço a confirmar]";

  // Cabeçalho com logo
  let headerImage: Paragraph;
  try {
    const img = await fetchImageBytes("/aurum-logo.png");
    headerImage = new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({
        type: "png",
        data: img,
        transformation: { width: 160, height: 50 },
      })],
    });
  } catch {
    headerImage = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({
        text: "AURUM", bold: true, size: 56, color: NAVY, font: FONT_HEADING,
        characterSpacing: 120,
      })],
    });
  }

  const tagline = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [new TextRun({
      text: "SERVIÇOS GASTRONÔMICOS",
      size: 16, color: GOLD, italics: true, font: FONT_BODY,
      characterSpacing: 60,
    })],
  });

  // Corpo da carta
  const bodyChildren: Paragraph[] = [
    headerImage,
    tagline,
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 6 } },
      spacing: { after: 240 },
      children: [],
    }),

    paragraph(today, { align: AlignmentType.RIGHT, italic: true, color: GREY, size: 20, spaceAfter: 320 }),

    paragraph(`Prezado(a) ${clientName},`, { bold: true, size: 24, spaceAfter: 200 }),

    paragraph(
      `É com grande satisfação que confirmamos o recebimento das informações para o seu ${eventType.toLowerCase()}, ` +
      `agendado para o dia ${eventDate}${horario ? ", " + horario : ""}, no endereço ${local}. ` +
      `Será uma honra para a Aurum Serviços Gastronômicos cuidar de cada detalhe da sua celebração.`,
      { align: AlignmentType.JUSTIFIED, spaceAfter: 200, size: 22 },
    ),

    paragraph(
      `Para receber ${guests} convidado${guests === "1" ? "" : "s"}, foi delineado um cardápio especial, ` +
      `composto pelas seguintes preparações:`,
      { align: AlignmentType.JUSTIFIED, spaceAfter: 160, size: 22 },
    ),
  ];

  // Cardápio
  bodyChildren.push(paragraph("CARDÁPIO", {
    bold: true, color: GOLD, size: 22, align: AlignmentType.LEFT,
    spaceBefore: 80, spaceAfter: 120, font: FONT_HEADING,
  }));

  if (isCoffee) {
    if (state.coffeeBreak) {
      bodyChildren.push(paragraph(state.coffeeBreak, { bold: true, size: 22, spaceAfter: 80 }));
    }
    if (state.coffeeBreakObs?.trim()) {
      bodyChildren.push(paragraph(`Personalizações: ${state.coffeeBreakObs}`, { italic: true, color: GREY, size: 20 }));
    }
  } else if (isFeijoada) {
    bodyChildren.push(paragraph(`Feijoada ${state.feijoada || ""}`.trim(), { bold: true, size: 22, spaceAfter: 80 }));
    bodyChildren.push(paragraph(
      "Acompanhamentos clássicos: arroz branco, couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete.",
      { italic: true, color: GREY, size: 20, spaceAfter: 120 },
    ));
    if (state.sobremesas.length) {
      bodyChildren.push(paragraph("Sobremesas:", { bold: true, size: 21, spaceAfter: 60 }));
      state.sobremesas.forEach((s) => bodyChildren.push(bullet(s)));
    }
  } else {
    if (state.entradas.length) {
      bodyChildren.push(paragraph("Entradas", { bold: true, size: 21, color: NAVY, spaceAfter: 60 }));
      state.entradas.forEach((s) => bodyChildren.push(bullet(s)));
      if (state.sugestaoEntradas?.trim()) bodyChildren.push(bullet(state.sugestaoEntradas + " (sugestão)"));
    }
    if (state.principais.length) {
      bodyChildren.push(paragraph("Pratos principais", { bold: true, size: 21, color: NAVY, spaceBefore: 120, spaceAfter: 60 }));
      state.principais.forEach((s) => bodyChildren.push(bullet(s)));
      if (state.sugestaoPrincipais?.trim()) bodyChildren.push(bullet(state.sugestaoPrincipais + " (sugestão)"));
    }
    if (state.tacho.length) {
      bodyChildren.push(paragraph("Tacho / Paellera", { bold: true, size: 21, color: NAVY, spaceBefore: 120, spaceAfter: 60 }));
      state.tacho.forEach((s) => bodyChildren.push(bullet(s)));
    }
    if (state.sobremesas.length) {
      bodyChildren.push(paragraph("Sobremesas", { bold: true, size: 21, color: NAVY, spaceBefore: 120, spaceAfter: 60 }));
      state.sobremesas.forEach((s) => bodyChildren.push(bullet(s)));
      if (state.sugestaoSobremesas?.trim()) bodyChildren.push(bullet(state.sugestaoSobremesas + " (sugestão)"));
    }
  }

  bodyChildren.push(divider());

  bodyChildren.push(paragraph(
    `Permaneço à disposição para alinharmos os ajustes finais do cardápio e da operação. ` +
    `Em até 48 horas enviaremos a proposta comercial completa, com valores e condições.`,
    { align: AlignmentType.JUSTIFIED, spaceBefore: 80, spaceAfter: 200, size: 22 },
  ));

  bodyChildren.push(paragraph(
    "Será uma honra recebê-lo(a) em mais um momento especial.",
    { align: AlignmentType.JUSTIFIED, spaceAfter: 320, size: 22, italic: true },
  ));

  bodyChildren.push(paragraph("Cordialmente,", { spaceAfter: 360, size: 22 }));
  bodyChildren.push(paragraph("Chef Atilio Leite", { bold: true, size: 24, color: NAVY, font: FONT_HEADING, spaceAfter: 40 }));
  bodyChildren.push(paragraph("Aurum Serviços Gastronômicos", { italic: true, color: GOLD, size: 20, font: FONT_BODY }));

  const doc = new Document({
    creator: "Aurum Briefing",
    title: `Carta — ${clientName}`,
    styles: {
      default: { document: { run: { font: FONT_BODY, size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter
          margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: "Aurum Serviços Gastronômicos  •  (81) 99818-4489  •  aurumbuffet.eventos@gmail.com  •  @aurumbuffet.eventos",
                size: 14, color: GREY, font: FONT_BODY, italics: true,
              })],
            }),
          ],
        }),
      },
      children: bodyChildren,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
}
