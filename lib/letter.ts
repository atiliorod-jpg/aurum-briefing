import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Footer, Header, PageOrientation, ImageRun,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom,
  TextWrappingType, Table, TableRow, TableCell, WidthType, VerticalAlign, BorderStyle,
} from "docx";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY = "1B2A41";
const GOLD = "B08D43";
const GREY = "5A6478";

const FONT_TITLE = "Georgia";
const FONT_BODY = "Garamond";

// ── Cardápios de Coffee Break ───────────────────────────────────────────────
const COFFEE_DETAILS: Record<string, { bebidas: string; salgados: string; doces: string }> = {
  "Coffee Break Simples": {
    bebidas: "Café filtrado, leite quente, água mineral e suco natural.",
    salgados: "Mini sanduíche natural, mini pão de queijo, torta salgada, torradinhas com patês e cuscuz nordestino recheado.",
    doces: "Bolos caseiros, mungunzá e salada de frutas.",
  },
  "Coffee Break Tradicional": {
    bebidas: "Café filtrado, leite quente, chá, água mineral, sucos naturais e achocolatado.",
    salgados: "Mini croissant recheado, croque monsieur, pão de queijo, quiche, torta salgada, pães com ovos mexidos à francesa e cuscuz recheado.",
    doces: "Bolos caseiros, petit four, mungunzá, waffles e frutas frescas.",
  },
  "Coffee Break Premium": {
    bebidas: "Café arábica, leite quente (opção zero lactose), chocolate quente, chás, águas mineral e com gás, sucos naturais e água aromatizada.",
    salgados: "Mini croissant, mini sanduíche artesanal, quiches variadas, pão de queijo, torradinhas com patês, cuscuz recheado, beiju de queijo, croque monsieur e pães com ovos à francesa.",
    doces: "Bolos caseiros, waffles, tortas, frutas selecionadas, petit four, bolo de rolo e mungunzá.",
  },
};

// ── Helper de parágrafo ─────────────────────────────────────────────────────
function p(opts: {
  text?: string;
  runs?: TextRun[];
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
  align?: typeof AlignmentType[keyof typeof AlignmentType];
  font?: string;
  after?: number;
  before?: number;
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
    spacing: { after: opts.after ?? 80, before: opts.before ?? 0, line: 252 },
    children,
  });
}

// Seção do cardápio: rótulo dourado + itens em uma linha separados por vírgula
function menuLine(label: string, items: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60, before: 40, line: 240 },
    children: [
      new TextRun({ text: `${label}  `, bold: true, color: GOLD, size: 19, font: FONT_BODY }),
      new TextRun({ text: items, italics: true, color: NAVY, size: 20, font: FONT_BODY }),
    ],
  });
}

function getEventDescription(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "o aniversário de [NOME DO ANIVERSARIANTE]";
    case "Casamento": return "o casamento de [NOMES DOS NOIVOS]";
    case "Confraternização / Corporativo": return "a confraternização de [NOME DO EVENTO]";
    case "Almoço ou Jantar Privado": return "um momento especial em homenagem a [NOME DO HOMENAGEADO]";
    default: return "[TIPO DO EVENTO] de [NOME DO ANFITRIÃO]";
  }
}

function getCardapioName(state: FormState): string {
  if (state.estilo.includes("Coffee Break") && state.coffeeBreak) return state.coffeeBreak;
  if (state.estilo.includes("Feijoada Completa")) {
    return state.feijoada ? `Feijoada ${state.feijoada}` : "Feijoada Completa";
  }
  if (state.estilo.includes("Jantar Harmonizado")) return "Jantar Harmonizado";
  if (state.estilo.includes("Jantar Temático")) return "Jantar Temático";
  return "[NOME DO CARDÁPIO]";
}

function buildMenu(state: FormState): Paragraph[] {
  const items: Paragraph[] = [];
  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  if (isCoffee) {
    const d = state.coffeeBreak ? COFFEE_DETAILS[state.coffeeBreak] : undefined;
    if (d) {
      items.push(menuLine("Bebidas", d.bebidas));
      items.push(menuLine("Salgados", d.salgados));
      items.push(menuLine("Doces", d.doces));
      if (state.coffeeBreakObs?.trim()) {
        items.push(p({ text: state.coffeeBreakObs, italic: true, color: GREY, size: 17, before: 40 }));
      }
    }
  } else if (isFeijoada) {
    items.push(p({
      text: "Acompanha arroz branco, couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete.",
      italic: true, color: NAVY, size: 20, after: 60,
    }));
    if (state.sobremesas.length) items.push(menuLine("Sobremesas", state.sobremesas.join(", ") + "."));
  } else {
    if (state.entradas.length) items.push(menuLine("Entradas", state.entradas.join(", ") + "."));
    if (state.principais.length) items.push(menuLine("Pratos principais", state.principais.join(", ") + "."));
    if (state.tacho.length) items.push(menuLine("Tacho / Paellera", state.tacho.join(", ") + "."));
    if (state.sobremesas.length) items.push(menuLine("Sobremesas", state.sobremesas.join(", ") + "."));
  }
  if (items.length === 0) {
    items.push(p({ text: "[INSERIR DESCRIÇÃO DO CARDÁPIO]", italic: true, color: GREY, size: 20 }));
  }
  return items;
}

// ── Documento ──────────────────────────────────────────────────────────────
async function fetchBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

export async function generateLetterDOCX(state: FormState): Promise<Blob> {
  const eventDesc = getEventDescription(state.tipo);
  const eventDate = state.data ? formatDate(state.data) : "[DATA DO EVENTO]";
  const startTime = state.horaInicio || "[INÍCIO]";
  const endTime = state.horaFim || "[TÉRMINO]";
  const local = state.endereco || "[ENDEREÇO COMPLETO]";
  const rsvpPhone = state.whatsapp || "[WHATSAPP / TELEFONE]";
  const cardapioName = getCardapioName(state);

  // Fundo (papel timbrado paisagem)
  let bgImage: ImageRun | null = null;
  try {
    const bytes = await fetchBytes("/convite-fundo.png");
    bgImage = new ImageRun({
      type: "png",
      data: bytes,
      transformation: { width: 1123, height: 794 }, // A4 paisagem em px (≈297×210mm)
      floating: {
        horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
        verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
        behindDocument: true,
        allowOverlap: true,
        wrap: { type: TextWrappingType.NONE },
      },
    });
  } catch {
    bgImage = null;
  }

  // ── Conteúdo compacto ────────────────────────────────────────────────────
  const content: Paragraph[] = [];

  content.push(p({
    text: "Convite Especial",
    bold: true, size: 40, color: NAVY, font: FONT_TITLE, after: 40,
  }));

  content.push(p({
    runs: [new TextRun({ text: "◆", color: GOLD, size: 16, font: FONT_BODY })],
    after: 120,
  }));

  content.push(p({
    text: "Prezado(a) [NOME DO CONVIDADO],",
    italic: true, size: 23, color: NAVY, font: FONT_TITLE, after: 100,
  }));

  content.push(p({
    runs: [
      new TextRun({ text: "Com grande alegria, convidamos você para celebrar conosco um momento muito especial: ", size: 21, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: eventDesc + ".", size: 21, color: NAVY, font: FONT_BODY, italics: true, bold: true }),
    ],
    after: 140,
  }));

  // Data / horário / local
  content.push(p({
    text: eventDate,
    bold: true, size: 26, color: NAVY, font: FONT_TITLE, after: 30,
  }));
  content.push(p({
    text: `das ${startTime} às ${endTime}  •  ${local}`,
    italic: true, color: GOLD, size: 19, font: FONT_BODY, after: 140,
  }));

  // Apresentação do cardápio
  content.push(p({
    runs: [
      new TextRun({ text: "Será servido o cardápio ", size: 20, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: cardapioName, size: 20, color: NAVY, font: FONT_BODY, bold: true, italics: true }),
      new TextRun({ text: ", preparado pela Aurum Serviços Gastronômicos.", size: 20, color: NAVY, font: FONT_BODY }),
    ],
    after: 100,
  }));

  // Cardápio
  content.push(...buildMenu(state));

  // RSVP + assinatura
  content.push(p({
    runs: [
      new TextRun({ text: "Confirme sua presença até ", size: 19, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: "[DATA LIMITE]", size: 19, color: NAVY, font: FONT_BODY, bold: true, italics: true }),
      new TextRun({ text: " pelo contato ", size: 19, color: NAVY, font: FONT_BODY }),
      new TextRun({ text: rsvpPhone, size: 19, color: NAVY, font: FONT_BODY, bold: true }),
      new TextRun({ text: ".", size: 19, color: NAVY, font: FONT_BODY }),
    ],
    before: 120, after: 100,
  }));

  content.push(p({
    runs: [
      new TextRun({ text: "Com carinho,  ", italics: true, size: 20, color: GREY, font: FONT_TITLE }),
      new TextRun({ text: "[NOME DO ANFITRIÃO / FAMÍLIA]", bold: true, size: 21, color: NAVY, font: FONT_TITLE }),
    ],
  }));

  // Tabela 1 célula para centralizar verticalmente dentro da moldura
  const wrapper = new Table({
    width: { size: 13000, type: WidthType.DXA },
    columnWidths: [13000],
    alignment: AlignmentType.CENTER,
    rows: [new TableRow({
      height: { value: 7000, rule: "atLeast" },
      children: [new TableCell({
        width: { size: 13000, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
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

  const headerChildren = bgImage
    ? [new Paragraph({ children: [bgImage] })]
    : [new Paragraph({ children: [] })];

  const doc = new Document({
    creator: "Aurum Briefing",
    title: `Convite — ${state.nome || "evento"}`,
    styles: { default: { document: { run: { font: FONT_BODY, size: 22 } } } },
    sections: [{
      properties: {
        page: {
          // A4 paisagem: docx-js inverte → passar portrait (11906 × 16838) + LANDSCAPE
          size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
          margin: { top: 1300, right: 1700, bottom: 1100, left: 1700, header: 0, footer: 567 },
        },
      },
      headers: { default: new Header({ children: headerChildren }) },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({
              text: "Cardápio e serviço gastronômico por Aurum Serviços Gastronômicos",
              size: 13, color: GOLD, font: FONT_BODY, italics: true,
            })],
          })],
        }),
      },
      children: [wrapper],
    }],
  });

  return await Packer.toBlob(doc);
}
