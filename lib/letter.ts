import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, Footer, PageOrientation, Table, TableRow, TableCell,
  WidthType, ShadingType, VerticalAlign,
} from "docx";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY = "1B2A41";
const GOLD = "C9A24B";
const GREY = "5A6478";
const SOFT = "8A93A6";

const FONT_TITLE = "Georgia";
const FONT_BODY = "Calibri";

// ── Helpers ─────────────────────────────────────────────────────────────────
function p(opts: {
  text?: string;
  runs?: TextRun[];
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
  align?: typeof AlignmentType[keyof typeof AlignmentType];
  font?: string;
  spaceAfter?: number;
  spaceBefore?: number;
  spacing?: number;
}) {
  const children = opts.runs ?? [new TextRun({
    text: opts.text ?? "",
    bold: opts.bold,
    italics: opts.italic,
    size: opts.size ?? 22,
    color: opts.color ?? NAVY,
    font: opts.font ?? FONT_BODY,
    characterSpacing: opts.spacing,
  })];
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.CENTER,
    spacing: { after: opts.spaceAfter ?? 120, before: opts.spaceBefore ?? 0 },
    children,
  });
}

function bullet(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({ text: "✦  ", color: GOLD, bold: true, size: 18, font: FONT_BODY }),
      new TextRun({ text, size: 21, color: NAVY, font: FONT_BODY, italics: true }),
    ],
  });
}

function ornamentLine() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
    children: [new TextRun({
      text: "✦   ◆   ✦",
      color: GOLD, size: 18, font: FONT_BODY,
      characterSpacing: 80,
    })],
  });
}

function divider() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 4 } },
    children: [new TextRun({ text: "" })],
  });
}

// ── Texto adaptativo por tipo de evento ────────────────────────────────────
function getEventLabel(tipo: string | null): { title: string; nameHint: string } {
  switch (tipo) {
    case "Aniversário":
      return { title: "o aniversário de [NOME DO ANIVERSARIANTE]", nameHint: "ANIVERSARIANTE" };
    case "Casamento":
      return { title: "o casamento de [NOMES DOS NOIVOS]", nameHint: "NOIVOS" };
    case "Confraternização / Corporativo":
      return { title: "a confraternização de [NOME DO EVENTO / EMPRESA]", nameHint: "ANFITRIÃO" };
    case "Almoço ou Jantar Privado":
      return { title: "um almoço/jantar especial em homenagem a [NOME DO HOMENAGEADO]", nameHint: "ANFITRIÃO" };
    default:
      return { title: "[OCASIÃO ESPECIAL]", nameHint: "ANFITRIÃO" };
  }
}

function getCardapioName(state: FormState): string {
  if (state.estilo.includes("Coffee Break") && state.coffeeBreak) return state.coffeeBreak;
  if (state.estilo.includes("Feijoada Completa")) {
    return state.feijoada ? `Feijoada ${state.feijoada}` : "Feijoada Completa";
  }
  if (state.estilo.includes("Jantar Harmonizado")) return "Jantar Harmonizado";
  if (state.estilo.includes("Jantar Temático")) return "Jantar Temático — [TEMA]";
  return "[NOME DO CARDÁPIO]";
}

// ── Documento ──────────────────────────────────────────────────────────────
export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const { title: eventTitle } = getEventLabel(state.tipo);
  const eventDate = state.data ? formatDate(state.data) : "[DATA DO EVENTO]";
  const startTime = state.horaInicio || "[HORÁRIO DE INÍCIO]";
  const endTime = state.horaFim;
  const local = state.endereco || "[ENDEREÇO DO EVENTO]";
  const rsvpPhone = state.whatsapp || "[TELEFONE / WHATSAPP PARA RSVP]";
  const cardapioName = getCardapioName(state);

  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  // ── Conteúdo da carta ────────────────────────────────────────────────────
  const content: Paragraph[] = [];

  // Título principal
  content.push(p({
    text: "CONVITE",
    bold: true, size: 52, color: NAVY, font: FONT_TITLE,
    spacing: 240, spaceAfter: 40,
  }));

  content.push(p({
    text: "✦ ESPECIAL ✦",
    color: GOLD, size: 18, font: FONT_BODY,
    spacing: 120, spaceAfter: 200,
  }));

  // Pequena linha divisória dourada
  content.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [new TextRun({
      text: "──────────",
      color: GOLD, size: 18, font: FONT_BODY,
    })],
  }));

  // Saudação
  content.push(p({
    text: "Prezado(a) convidado(a),",
    italic: true, size: 24, color: NAVY, font: FONT_TITLE,
    spaceAfter: 240,
  }));

  // Convite principal
  content.push(p({
    runs: [
      new TextRun({ text: "É com grande alegria que convidamos você para celebrar conosco um momento muito especial: ", size: 22, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: eventTitle + ".", size: 22, color: NAVY, font: FONT_BODY, italics: true, bold: true }),
    ],
    align: AlignmentType.CENTER, spaceAfter: 200,
  }));

  content.push(p({
    text: "Preparamos uma ocasião pensada com carinho para reunir pessoas queridas, compartilhar bons momentos e celebrar com alegria, afeto e boas memórias.",
    italic: true, color: GREY, size: 21, spaceAfter: 280, font: FONT_BODY,
  }));

  // Bloco de detalhes (data / horário / local) — destaque
  content.push(ornamentLine());

  content.push(p({
    text: eventDate.toUpperCase(),
    bold: true, size: 26, color: NAVY, font: FONT_TITLE, spacing: 320,
    spaceAfter: 80,
  }));

  const horarioStr = endTime
    ? `das ${startTime} às ${endTime}`
    : `a partir das ${startTime}`;
  content.push(p({
    text: horarioStr,
    italic: true, color: GOLD, size: 20, font: FONT_BODY,
    spaceAfter: 140,
  }));

  content.push(p({
    text: local,
    color: NAVY, size: 20, font: FONT_BODY,
    spaceAfter: 80,
  }));

  content.push(ornamentLine());

  // Cardápio
  content.push(p({
    text: "CARDÁPIO",
    bold: true, color: GOLD, size: 18, font: FONT_BODY,
    spacing: 320, spaceBefore: 240, spaceAfter: 120,
  }));

  content.push(p({
    text: cardapioName,
    bold: true, size: 26, color: NAVY, font: FONT_TITLE,
    spaceAfter: 160,
  }));

  // Itens do cardápio
  if (isCoffee) {
    if (state.coffeeBreakObs?.trim()) {
      content.push(p({ text: state.coffeeBreakObs, italic: true, color: GREY, size: 20, spaceAfter: 120 }));
    } else {
      content.push(p({
        text: "Seleção de bebidas, salgados e doces preparados especialmente para a ocasião.",
        italic: true, color: GREY, size: 20, spaceAfter: 120,
      }));
    }
  } else if (isFeijoada) {
    content.push(p({
      text: "Acompanhada de arroz branco, couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete.",
      italic: true, color: GREY, size: 20, spaceAfter: 140,
    }));
    if (state.sobremesas.length) {
      content.push(p({ text: "Para finalizar", color: GOLD, size: 18, font: FONT_BODY, bold: true, spaceAfter: 60 }));
      state.sobremesas.forEach((s) => content.push(bullet(s)));
    }
  } else {
    if (state.entradas.length) {
      content.push(p({ text: "Entradas", color: GOLD, size: 18, font: FONT_BODY, bold: true, spacing: 120, spaceAfter: 60 }));
      state.entradas.forEach((s) => content.push(bullet(s)));
    }
    if (state.principais.length) {
      content.push(p({ text: "Pratos principais", color: GOLD, size: 18, font: FONT_BODY, bold: true, spacing: 120, spaceBefore: 120, spaceAfter: 60 }));
      state.principais.forEach((s) => content.push(bullet(s)));
    }
    if (state.tacho.length) {
      content.push(p({ text: "Tacho / Paellera", color: GOLD, size: 18, font: FONT_BODY, bold: true, spacing: 120, spaceBefore: 120, spaceAfter: 60 }));
      state.tacho.forEach((s) => content.push(bullet(s)));
    }
    if (state.sobremesas.length) {
      content.push(p({ text: "Sobremesas", color: GOLD, size: 18, font: FONT_BODY, bold: true, spacing: 120, spaceBefore: 120, spaceAfter: 60 }));
      state.sobremesas.forEach((s) => content.push(bullet(s)));
    }
  }

  // Atribuição discreta à Aurum
  content.push(p({
    text: "Cardápio assinado pela Aurum Serviços Gastronômicos.",
    italic: true, color: SOFT, size: 16, font: FONT_BODY,
    spaceBefore: 200, spaceAfter: 280,
  }));

  // Divisor
  content.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "──────────", color: GOLD, size: 18, font: FONT_BODY })],
  }));

  // RSVP
  content.push(p({
    text: "Sua presença tornará essa celebração ainda mais especial.",
    italic: true, size: 22, color: NAVY, font: FONT_TITLE,
    spaceAfter: 200,
  }));

  content.push(p({
    runs: [
      new TextRun({ text: "Pedimos, por gentileza, a confirmação de presença até ", size: 20, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: "[DATA LIMITE PARA CONFIRMAÇÃO]", size: 20, color: NAVY, font: FONT_BODY, bold: true, italics: true }),
      new TextRun({ text: ", através do contato ", size: 20, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: rsvpPhone, size: 20, color: NAVY, font: FONT_BODY, bold: true }),
      new TextRun({ text: ".", size: 20, color: NAVY, font: FONT_BODY }),
    ],
    spaceAfter: 360,
  }));

  // Assinatura
  content.push(p({
    text: "Com carinho,",
    italic: true, size: 22, color: GREY, font: FONT_TITLE,
    spaceAfter: 80,
  }));

  content.push(p({
    text: "[NOME DO ANFITRIÃO / FAMÍLIA]",
    bold: true, size: 24, color: NAVY, font: FONT_TITLE,
    spaceAfter: 80,
  }));

  // ── Tabela 1 célula que centraliza verticalmente todo o conteúdo ────────
  // Página paisagem US Letter: width=15840, height=12240. Margens 720 = 0.5"
  // Cell width = 15840 - 1440 = 14400. Height = 12240 - 1440 = 10800.
  const wrapper = new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [14400],
    rows: [new TableRow({
      height: { value: 10080, rule: "atLeast" },
      children: [new TableCell({
        width: { size: 14400, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 360, bottom: 360, left: 720, right: 720 },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        children: content,
      })],
    })],
  });

  // ── Documento ────────────────────────────────────────────────────────────
  const doc = new Document({
    creator: "Aurum Briefing",
    title: `Convite — ${state.nome || "evento"}`,
    styles: {
      default: { document: { run: { font: FONT_BODY, size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: 12240,   // short edge — docx-js trocará internamente
            height: 15840,  // long edge
            orientation: PageOrientation.LANDSCAPE,
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
          borders: {
            pageBorderTop:    { style: BorderStyle.DOUBLE, size: 12, color: GOLD, space: 24 },
            pageBorderBottom: { style: BorderStyle.DOUBLE, size: 12, color: GOLD, space: 24 },
            pageBorderLeft:   { style: BorderStyle.DOUBLE, size: 12, color: GOLD, space: 24 },
            pageBorderRight:  { style: BorderStyle.DOUBLE, size: 12, color: GOLD, space: 24 },
            pageBorders: {
              offsetFrom: "page",
              display: "allPages",
            },
          },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: "Convite gerado com assessoria gastronômica Aurum",
              size: 14, color: SOFT, font: FONT_BODY, italics: true,
            })],
          })],
        }),
      },
      children: [wrapper],
    }],
  });

  return await Packer.toBlob(doc);
}
