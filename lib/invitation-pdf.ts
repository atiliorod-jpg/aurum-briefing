import jsPDF from "jspdf";
import { FormState } from "./types";
import { resolveInvitation } from "./invitation";

const NAVY: [number, number, number] = [27, 42, 65];
const GOLD: [number, number, number] = [184, 146, 60];

const CENTER = 148.5; // metade de 297mm (A4 paisagem)
const MAX_W = 210;    // largura máxima do texto (dentro da moldura)

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

export async function generateInvitationPDF(state: FormState): Promise<Blob> {
  const c = resolveInvitation(state);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Fontes
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

  // Fundo (papel timbrado paisagem)
  doc.addImage(bg, "PNG", 0, 0, 297, 210, undefined, "FAST");

  let y = 46;

  const centered = (
    text: string, font: string, style: string, size: number,
    color: [number, number, number], lineGap = 1.35, charSpace = 0,
  ) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    if (charSpace) doc.setCharSpace(charSpace);
    const lines = doc.splitTextToSize(text, MAX_W);
    const lh = size * 0.3528 * lineGap;
    for (const line of lines) {
      doc.text(line, CENTER, y, { align: "center" });
      y += lh;
    }
    if (charSpace) doc.setCharSpace(0);
  };

  // Linha com rótulo dourado (maiúsculo) + valor navy, centralizada
  const detail = (label: string, value: string) => {
    doc.setFontSize(13);
    doc.setFont("Cardo", "bold");
    doc.setCharSpace(0.4);
    const labelW = doc.getTextWidth(label);
    doc.setCharSpace(0);
    doc.setFont("Cardo", "normal");
    const valueW = doc.getTextWidth(value);
    const gap = 3;
    const total = labelW + gap + valueW;
    let x = CENTER - total / 2;
    doc.setFont("Cardo", "bold");
    doc.setTextColor(...GOLD);
    doc.setCharSpace(0.4);
    doc.text(label, x, y);
    doc.setCharSpace(0);
    x += labelW + gap;
    doc.setFont("Cardo", "normal");
    doc.setTextColor(...NAVY);
    doc.text(value, x, y);
    y += 6.5;
  };

  // ── Título ────────────────────────────────────────────────────────────────
  centered("Convite Especial", "Cardo", "bold", 30, GOLD, 1.2, 0.8);
  y += 1;
  centered("◆", "Cardo", "normal", 11, GOLD, 1);
  y += 3;

  // ── Saudação (manuscrita) ───────────────────────────────────────────────
  centered("Queridos convidados,", "GreatVibes", "normal", 34, NAVY, 1);
  y += 3;

  // ── Convite ─────────────────────────────────────────────────────────────
  const convite =
    `Com grande alegria, convidamos vocês para celebrar conosco ${c.tipoFrase}${c.conector}${c.nome}. ` +
    `Será um encontro preparado com carinho para reunir as pessoas que amamos e tornar esta data ainda mais especial.`;
  centered(convite, "Cardo", "normal", 12.5, NAVY, 1.35);
  y += 4;

  // ── Data / Horário / Local ──────────────────────────────────────────────
  detail("DATA", c.data);
  detail("HORÁRIO", `a partir das ${c.horario}`);
  detail("LOCAL", c.local);
  y += 4;

  // ── Cardápio ────────────────────────────────────────────────────────────
  const cardapioFrase =
    `Para este momento, preparamos uma seleção especial — ${c.cardapio} — assinada pela ` +
    `Aurum Serviços Gastronômicos, pensada para oferecer uma experiência elegante, acolhedora e especial.`;
  centered(cardapioFrase, "Cardo", "normal", 12.5, NAVY, 1.35);
  y += 3;

  // ── RSVP ────────────────────────────────────────────────────────────────
  const rsvp = `Pedimos, com carinho, a confirmação de presença até ${c.dataLimite}, pelo contato ${c.contato}.`;
  centered(rsvp, "Cardo", "normal", 12.5, NAVY, 1.35);
  y += 4;

  // ── Assinatura ──────────────────────────────────────────────────────────
  centered("Com carinho,", "GreatVibes", "normal", 26, NAVY, 1);
  y += 1;
  centered(c.assinatura, "Cardo", "bold", 14, NAVY, 1.1, 0.3);

  return doc.output("blob");
}
