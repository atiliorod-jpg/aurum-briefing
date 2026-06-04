import jsPDF from "jspdf";
import { FormState } from "./types";
import { resolveInvitation, InvitationContent } from "./invitation";

interface ConviteLinks {
  confirmar?: string; // WhatsApp do anfitrião
  waze?: string;      // Waze
}

// Remove complementos (apto, bloco, etc.) que atrapalham a navegação
function enderecoParaMapa(addr: string): string {
  let s = addr.replace(/—?\s*n[ºo°]?\s*e\s*complemento:?/gi, ", ");
  s = s.replace(/\b(apto|apartamento|ap|bloco|bl|andar|sala|conj(unto)?|fundos|complemento|torre)\b\.?\s*[\wºª°-]*/gi, "");
  s = s.replace(/\s*,\s*(,\s*)+/g, ", ").replace(/\s{2,}/g, " ").replace(/^[\s,]+|[\s,]+$/g, "").trim();
  return s;
}

// Monta os links do convite a partir do briefing (sem nada armazenado — só URLs)
function buildLinks(state: FormState, c: InvitationContent): ConviteLinks {
  const links: ConviteLinks = {};
  const refOk = !c.tipoFrase.includes("[") && !c.nome.includes("[");
  const ref = refOk ? `${c.tipoFrase}${c.conector}${c.nome}` : "no seu evento";

  // Confirmar presença → WhatsApp do ANFITRIÃO (número do contato do briefing)
  const hostDigits = (state.whatsapp || "").replace(/\D/g, "");
  if (hostDigits.length >= 10) {
    const wa = hostDigits.length >= 12 ? hostDigits : `55${hostDigits}`;
    const msg = `Ola! Sou ___ e confirmo presenca ${ref}, no dia ${c.data}. (somos ___ pessoas)`;
    links.confirmar = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  }

  // Rota no Waze — endereço limpo, sem apto/bloco
  if (!c.local.includes("[")) {
    links.waze = `https://www.waze.com/ul?q=${encodeURIComponent(enderecoParaMapa(c.local))}&navigate=yes`;
  }

  return links;
}

const NAVY: [number, number, number] = [27, 42, 65];
const GOLD: [number, number, number] = [184, 146, 60];

const CENTER = 148.5; // metade de 297mm (A4 paisagem)
const MAX_W = 210;    // largura do texto (dentro da moldura)
const PAGE_H = 210;   // altura A4 paisagem
const TOP = 44;       // início do conteúdo (abaixo do topo da moldura)
const BOTTOM = 196;   // limite inferior (acima da base da moldura)

async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// Escala dos tamanhos de fonte: 1.0 normal; reduz para caber quando o texto é longo.
interface Layout {
  scale: number;
  titulo: number; ornamento: number; saudacao: number;
  corpo: number; detalhe: number; assinaturaTexto: number; assinatura: number;
  gapCorpo: number; gapBloco: number;
}

function makeLayout(scale: number): Layout {
  return {
    scale,
    titulo: 30 * scale,
    ornamento: 11 * scale,
    saudacao: 34 * scale,
    corpo: 12.5 * scale,
    detalhe: 13 * scale,
    assinaturaTexto: 26 * scale,
    assinatura: 14 * scale,
    gapCorpo: 1.35,
    gapBloco: 4 * scale,
  };
}

// Desenha (ou só mede) o convite a partir de yStart. Retorna o y final.
function render(doc: jsPDF, c: InvitationContent, L: Layout, draw: boolean, yStart: number, links: ConviteLinks): number {
  let y = yStart;

  const centered = (
    text: string, font: string, style: string, size: number,
    color: [number, number, number], lineGap = 1.35, charSpace = 0,
  ) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    if (charSpace) doc.setCharSpace(charSpace);
    const lines = doc.splitTextToSize(text, MAX_W);
    const lh = size * 0.3528 * lineGap;
    for (const line of lines) {
      if (draw) {
        doc.setTextColor(...color);
        doc.text(line, CENTER, y, { align: "center" });
      }
      y += lh;
    }
    if (charSpace) doc.setCharSpace(0);
  };

  const detail = (label: string, value: string) => {
    doc.setFontSize(L.detalhe);
    doc.setFont("Cardo", "bold");
    doc.setCharSpace(0.4);
    const labelW = doc.getTextWidth(label);
    doc.setCharSpace(0);
    doc.setFont("Cardo", "normal");
    const valueW = doc.getTextWidth(value);
    const gap = 3;
    let x = CENTER - (labelW + gap + valueW) / 2;
    if (draw) {
      doc.setFont("Cardo", "bold");
      doc.setTextColor(...GOLD);
      doc.setCharSpace(0.4);
      doc.text(label, x, y);
      doc.setCharSpace(0);
      x += labelW + gap;
      doc.setFont("Cardo", "normal");
      doc.setTextColor(...NAVY);
      doc.text(value, x, y);
    }
    y += L.detalhe * 0.5;
  };

  centered("Convite Especial", "Cardo", "bold", L.titulo, GOLD, 1.2, 0.8);
  y += 1 * L.scale;
  centered("◆", "Cardo", "normal", L.ornamento, GOLD, 1);
  y += 3 * L.scale;

  centered("Queridos convidados,", "GreatVibes", "normal", L.saudacao, NAVY, 1);
  y += 3 * L.scale;

  const convite =
    `Com grande alegria, convidamos vocês para celebrar conosco ${c.tipoFrase}${c.conector}${c.nome}. ` +
    `Será um encontro preparado com todo cuidado para reunir as pessoas que amamos e tornar esta data inesquecível.`;
  centered(convite, "Cardo", "normal", L.corpo, NAVY, L.gapCorpo);
  y += L.gapBloco;

  detail("DATA", c.data);
  detail("HORÁRIO", `a partir das ${c.horario}`);
  detail("LOCAL", c.local);
  y += L.gapBloco;

  const cardapioFrase =
    `Para este momento, preparamos uma seleção cuidadosa — ${c.cardapio} — assinada pela ` +
    `Aurum Serviços Gastronômicos, para oferecer uma experiência elegante e acolhedora.`;
  centered(cardapioFrase, "Cardo", "normal", L.corpo, NAVY, L.gapCorpo);
  y += 3 * L.scale;

  const rsvp = `Pedimos, por gentileza, a confirmação de presença até ${c.dataLimite}, pelo contato ${c.contato}.`;
  centered(rsvp, "Cardo", "normal", L.corpo, NAVY, L.gapCorpo);
  y += L.gapBloco;

  centered("Com carinho,", "GreatVibes", "normal", L.assinaturaTexto, NAVY, 1);
  y += 1 * L.scale;
  centered(c.assinatura, "Cardo", "bold", L.assinatura, NAVY, 1.1, 0.3);

  // ── Botões interativos (links clicáveis) ──────────────────────────────────
  const temLinks = links.confirmar || links.waze;
  if (temLinks) {
    y += 5 * L.scale;
    if (draw) {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.2);
      doc.line(CENTER - 30, y - 2.5, CENTER + 30, y - 2.5);
    }
    const linkSize = L.corpo * 0.95;
    const addLink = (text: string, url?: string) => {
      if (!url) return;
      doc.setFont("Cardo", "normal");
      doc.setFontSize(linkSize);
      const w = doc.getTextWidth(text);
      const x = CENTER - w / 2;
      if (draw) {
        doc.setTextColor(...NAVY);
        doc.textWithLink(text, x, y, { url });
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.2);
        doc.line(x, y + 1.3, x + w, y + 1.3);
      }
      y += linkSize * 0.3528 * 1.7;
    };
    addLink("Confirmar presença pelo WhatsApp", links.confirmar);
    addLink("Abrir rota no Waze", links.waze);
  }

  return y;
}

export async function generateInvitationPDF(state: FormState): Promise<Blob> {
  const c = resolveInvitation(state);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const [cardo, cardoBold, vibes, bg] = await Promise.all([
    fetchBase64("/fonts/Cardo-Regular.ttf"),
    fetchBase64("/fonts/Cardo-Bold.ttf"),
    fetchBase64("/fonts/GreatVibes-Regular.ttf"),
    fetchDataUrl("/convite-fundo.png"),
  ]);
  doc.addFileToVFS("Cardo-Regular.ttf", cardo);
  doc.addFont("Cardo-Regular.ttf", "Cardo", "normal");
  doc.addFileToVFS("Cardo-Bold.ttf", cardoBold);
  doc.addFont("Cardo-Bold.ttf", "Cardo", "bold");
  doc.addFileToVFS("GreatVibes-Regular.ttf", vibes);
  doc.addFont("GreatVibes-Regular.ttf", "GreatVibes", "normal");

  const links = buildLinks(state, c);

  // 1) Mede com escala cheia e reduz até caber no espaço disponível (sem estourar)
  const disponivel = BOTTOM - TOP;
  let scale = 1;
  let usado = render(doc, c, makeLayout(scale), false, TOP, links) - TOP;
  for (let i = 0; i < 6 && usado > disponivel; i++) {
    scale = Math.max(0.7, scale * (disponivel / usado) * 0.98);
    usado = render(doc, c, makeLayout(scale), false, TOP, links) - TOP;
  }

  // 2) Centraliza verticalmente o bloco e desenha de fato
  const yStart = Math.max(TOP, (PAGE_H - usado) / 2);
  doc.addImage(bg, "PNG", 0, 0, 297, 210, undefined, "FAST");
  render(doc, c, makeLayout(scale), true, yStart, links);

  return doc.output("blob");
}
