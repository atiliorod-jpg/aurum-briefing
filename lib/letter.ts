import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, Footer, PageOrientation, Table, TableRow, TableCell,
  WidthType, VerticalAlign,
} from "docx";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY = "1B2A41";
const GOLD = "C9A24B";
const GREY = "5A6478";
const SOFT = "9099AB";

const FONT_TITLE = "Georgia";
const FONT_BODY = "Garamond";

// ── Cardápios de Coffee Break (mantidos sincronizados com CoffeeBreakStep) ─
const COFFEE_DETAILS: Record<string, { bebidas: string; salgados: string; doces: string }> = {
  "Coffee Break Simples": {
    bebidas: "Café filtrado, leite quente, água mineral e suco natural.",
    salgados: "Mini sanduíche natural, mini pão de queijo, torta salgada, torradinhas com patês e cuscuz nordestino recheado.",
    doces: "Bolos caseiros, mungunzá e salada de frutas.",
  },
  "Coffee Break Tradicional": {
    bebidas: "Café filtrado, leite quente, chá, água mineral, sucos naturais e achocolatado.",
    salgados: "Mini croissant recheado, croque monsieur, pão de queijo, quiche, torta salgada, pães com ovos mexidos à francesa e cuscuz nordestino recheado.",
    doces: "Bolos caseiros, petit four, mungunzá, waffles e frutas frescas.",
  },
  "Coffee Break Premium": {
    bebidas: "Café arábica filtrado, leite quente (opção zero lactose), chocolate quente, chás variados, águas mineral e com gás, sucos naturais e água aromatizada com frutas e ervas.",
    salgados: "Mini croissant recheado, mini sanduíche artesanal, quiches (Lorraine, gorgonzola, tomate seco ou alho-poró), pão de queijo, torradinhas com patês, cuscuz recheado, beiju de queijo, croque monsieur e pães francês, integral e brioche com ovos mexidos à francesa.",
    doces: "Bolos caseiros, waffles, tortas, frutas selecionadas, petit four, bolo de rolo e mungunzá.",
  },
};

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
    size: opts.size ?? 24,
    color: opts.color ?? NAVY,
    font: opts.font ?? FONT_BODY,
    characterSpacing: opts.spacing,
  })];
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.CENTER,
    spacing: { after: opts.spaceAfter ?? 140, before: opts.spaceBefore ?? 0 },
    children,
  });
}

function ornamentLine() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({
      text: "◆     ◆     ◆",
      color: GOLD, size: 22, font: FONT_BODY,
      characterSpacing: 120,
    })],
  });
}

function thinDivider() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 60 },
    children: [new TextRun({
      text: "——————————————",
      color: GOLD, size: 16, font: FONT_BODY,
    })],
  });
}

// ── Textos adaptativos ─────────────────────────────────────────────────────
function getEventDescription(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "o aniversário de [NOME DO ANIVERSARIANTE]";
    case "Casamento": return "o casamento de [NOMES DOS NOIVOS]";
    case "Confraternização / Corporativo": return "a confraternização de [NOME DO EVENTO / EMPRESA]";
    case "Almoço ou Jantar Privado": return "o almoço/jantar especial em homenagem a [NOME DO HOMENAGEADO]";
    default: return "[TIPO DO EVENTO] de [NOME DO ANFITRIÃO / ANIVERSARIANTE / CASAL]";
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

// ── Descrição do cardápio (parágrafos) ──────────────────────────────────────
function buildMenuParagraphs(state: FormState): Paragraph[] {
  const items: Paragraph[] = [];
  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  const sectionLabel = (label: string) => p({
    text: label,
    bold: true, color: GOLD, size: 20, font: FONT_BODY,
    spaceBefore: 120, spaceAfter: 80, spacing: 100,
  });

  const itemList = (text: string) => p({
    text,
    italic: true, color: NAVY, size: 22, font: FONT_BODY,
    spaceAfter: 80,
  });

  if (isCoffee) {
    const detail = state.coffeeBreak ? COFFEE_DETAILS[state.coffeeBreak] : undefined;
    if (detail) {
      items.push(sectionLabel("BEBIDAS"));
      items.push(itemList(detail.bebidas));
      items.push(sectionLabel("SALGADOS"));
      items.push(itemList(detail.salgados));
      items.push(sectionLabel("DOCES"));
      items.push(itemList(detail.doces));
      if (state.coffeeBreakObs?.trim()) {
        items.push(p({
          text: `Observação: ${state.coffeeBreakObs}`,
          italic: true, color: GREY, size: 18, spaceBefore: 100,
        }));
      }
    } else {
      items.push(itemList("[INSERIR DESCRIÇÃO DO CARDÁPIO AQUI]"));
    }
  } else if (isFeijoada) {
    items.push(itemList(
      "Feijão preto encorpado com carnes nobres selecionadas, acompanhado de arroz branco, " +
      "couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete.",
    ));
    if (state.sobremesas.length) {
      items.push(sectionLabel("SOBREMESAS"));
      items.push(itemList(state.sobremesas.join(", ") + "."));
    }
  } else {
    if (state.entradas.length) {
      items.push(sectionLabel("ENTRADAS"));
      items.push(itemList(state.entradas.join(", ") + "."));
    }
    if (state.principais.length) {
      items.push(sectionLabel("PRATOS PRINCIPAIS"));
      items.push(itemList(state.principais.join(", ") + "."));
    }
    if (state.tacho.length) {
      items.push(sectionLabel("TACHO / PAELLERA"));
      items.push(itemList(state.tacho.join(", ") + "."));
    }
    if (state.sobremesas.length) {
      items.push(sectionLabel("SOBREMESAS"));
      items.push(itemList(state.sobremesas.join(", ") + "."));
    }
    if (items.length === 0) {
      items.push(itemList("[INSERIR DESCRIÇÃO DO CARDÁPIO AQUI]"));
    }
  }
  return items;
}

// ── Documento principal ────────────────────────────────────────────────────
export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const eventDesc = getEventDescription(state.tipo);
  const eventDate = state.data ? formatDate(state.data) : "[DATA DO EVENTO]";
  const startTime = state.horaInicio || "[HORÁRIO DE INÍCIO]";
  const endTime = state.horaFim || "[HORÁRIO DE TÉRMINO]";
  const local = state.endereco || "[ENDEREÇO COMPLETO]";
  const rsvpPhone = state.whatsapp || "[WHATSAPP / TELEFONE]";
  const cardapioName = getCardapioName(state);

  const content: Paragraph[] = [];

  // ── Título principal ────────────────────────────────────────────────────
  content.push(p({
    text: "CONVITE",
    bold: true, size: 88, color: NAVY, font: FONT_TITLE,
    spacing: 320, spaceAfter: 0,
  }));

  content.push(p({
    text: "E S P E C I A L",
    size: 28, color: GOLD, font: FONT_BODY, italic: true,
    spacing: 360, spaceAfter: 200,
  }));

  content.push(thinDivider());

  // ── Saudação ────────────────────────────────────────────────────────────
  content.push(p({
    text: "Prezado(a) [NOME DO CONVIDADO],",
    italic: true, size: 30, color: NAVY, font: FONT_TITLE,
    spaceBefore: 200, spaceAfter: 240,
  }));

  // ── Convite principal ───────────────────────────────────────────────────
  content.push(p({
    runs: [
      new TextRun({
        text: "Com grande alegria, convidamos você para celebrar conosco um momento muito especial: ",
        size: 26, color: NAVY, font: FONT_BODY,
      }),
      new TextRun({
        text: eventDesc + ".",
        size: 26, color: NAVY, font: FONT_BODY, italics: true, bold: true,
      }),
    ],
    spaceAfter: 200,
  }));

  content.push(p({
    text: "Será uma ocasião preparada com carinho para reunir pessoas queridas, compartilhar bons momentos e celebrar esta data de forma especial.",
    italic: true, color: GREY, size: 24, font: FONT_BODY,
    spaceAfter: 320,
  }));

  // ── Bloco de destaque: data / horário / local ──────────────────────────
  content.push(ornamentLine());

  content.push(p({
    text: eventDate,
    bold: true, size: 36, color: NAVY, font: FONT_TITLE,
    spacing: 240, spaceAfter: 100,
  }));

  content.push(p({
    text: `das ${startTime} às ${endTime}`,
    italic: true, color: GOLD, size: 24, font: FONT_BODY,
    spaceAfter: 160,
  }));

  content.push(p({
    text: local,
    color: NAVY, size: 22, font: FONT_BODY,
    spaceAfter: 80,
  }));

  content.push(ornamentLine());

  // ── Apresentação do cardápio ───────────────────────────────────────────
  content.push(p({
    runs: [
      new TextRun({
        text: "Para este momento, será servido o cardápio ",
        size: 24, color: NAVY, font: FONT_BODY,
      }),
      new TextRun({
        text: cardapioName,
        size: 24, color: NAVY, font: FONT_BODY, bold: true, italics: true,
      }),
      new TextRun({
        text: ", preparado pela Aurum Serviços Gastronômicos, com uma seleção pensada para oferecer aos convidados uma experiência agradável, elegante e acolhedora.",
        size: 24, color: NAVY, font: FONT_BODY,
      }),
    ],
    spaceBefore: 200, spaceAfter: 260,
  }));

  // ── CARDÁPIO em destaque ───────────────────────────────────────────────
  content.push(p({
    text: "CARDÁPIO",
    bold: true, color: GOLD, size: 22, font: FONT_BODY,
    spacing: 480, spaceAfter: 120,
  }));

  content.push(p({
    text: cardapioName,
    bold: true, size: 32, color: NAVY, font: FONT_TITLE,
    spaceAfter: 160,
  }));

  // Itens
  content.push(...buildMenuParagraphs(state));

  // ── Fechamento ─────────────────────────────────────────────────────────
  content.push(thinDivider());

  content.push(p({
    text: "Sua presença será muito especial para tornar esta celebração ainda mais memorável.",
    italic: true, size: 26, color: NAVY, font: FONT_TITLE,
    spaceBefore: 240, spaceAfter: 240,
  }));

  content.push(p({
    runs: [
      new TextRun({ text: "Pedimos, por gentileza, a confirmação de presença até ", size: 22, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: "[DATA LIMITE]", size: 22, color: NAVY, font: FONT_BODY, bold: true, italics: true }),
      new TextRun({ text: ", através do contato ", size: 22, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: rsvpPhone, size: 22, color: NAVY, font: FONT_BODY, bold: true }),
      new TextRun({ text: ".", size: 22, color: NAVY, font: FONT_BODY }),
    ],
    spaceAfter: 480,
  }));

  // ── Assinatura ─────────────────────────────────────────────────────────
  content.push(p({
    text: "Com carinho,",
    italic: true, size: 26, color: GREY, font: FONT_TITLE,
    spaceAfter: 100,
  }));

  content.push(p({
    text: "[NOME DO ANFITRIÃO / FAMÍLIA / NOIVOS]",
    bold: true, size: 28, color: NAVY, font: FONT_TITLE,
  }));

  // ── Tabela 1 célula para centralizar verticalmente em landscape ────────
  // Letter LANDSCAPE: 15840 x 12240 DXA. Margem 720 (0.5"). Borda gera offset.
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

  // ── Documento (LANDSCAPE explícito: width > height) ────────────────────
  const doc = new Document({
    creator: "Aurum Briefing",
    title: `Convite — ${state.nome || "evento"}`,
    styles: {
      default: { document: { run: { font: FONT_BODY, size: 24 } } },
    },
    sections: [{
      properties: {
        page: {
          size: {
            // LANDSCAPE Letter — docx-js inverte width/height internamente,
            // então passamos as dimensões portrait + flag LANDSCAPE.
            width: 12240,
            height: 15840,
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
              text: "Cardápio e serviço gastronômico por Aurum Serviços Gastronômicos",
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
