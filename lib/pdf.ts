import jsPDF from "jspdf";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY: [number, number, number] = [27, 42, 65];
const GOLD: [number, number, number] = [201, 162, 75];
const GREY: [number, number, number] = [90, 100, 120];

// Área útil do papel timbrado (entre cabeçalho e rodapé)
const CONTENT_TOP = 60;
const CONTENT_BOTTOM = 252;
const LEFT = 22;
const RIGHT = 188;
const LINE_H = 4.4;

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateBriefingPDF(state: FormState): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const letterhead = await fetchAsDataUrl("/papel-timbrado.png");

  const drawLetterhead = () => {
    doc.addImage(letterhead, "PNG", 0, 0, 210, 297, undefined, "FAST");
  };

  drawLetterhead();

  let y = CONTENT_TOP;

  const ensureSpace = (needed: number) => {
    if (y + needed > CONTENT_BOTTOM) {
      doc.addPage();
      drawLetterhead();
      y = CONTENT_TOP;
    }
  };

  // ── Título ────────────────────────────────────────────────────────────────
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("BRIEFING DE EVENTO", 105, y, { align: "center" });
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "italic");
  const subtitle = state.nome ? `${state.nome}` : "Resumo de proposta";
  doc.text(subtitle, 105, y, { align: "center" });
  y += 6;

  // Linha decorativa central
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(90, y, 120, y);
  y += 8;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addSection = (title: string) => {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text(title.toUpperCase(), LEFT, y);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.15);
    doc.line(LEFT, y + 1, RIGHT, y + 1);
    y += 6;
  };

  const addRow = (label: string, value: string) => {
    if (!value || !value.trim()) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    const labelText = `${label}:`;
    doc.text(labelText, LEFT, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    const valueX = LEFT + 36;
    const wrapped = doc.splitTextToSize(value, RIGHT - valueX);
    const needed = wrapped.length * LINE_H + 1;
    ensureSpace(needed);
    doc.text(wrapped, valueX, y);
    y += needed;
  };

  // ── Evento ────────────────────────────────────────────────────────────────
  addSection("Evento");
  addRow("Tipo", state.tipo === "Outro" ? state.tipoOutro : state.tipo || "");
  const horario = [
    state.horaInicio,
    state.horaFim ? `às ${state.horaFim}` : "",
  ].filter(Boolean).join(" ");
  addRow(
    "Data",
    `${formatDate(state.data)}${horario ? "  •  " + horario : ""}`,
  );
  if (state.obsHorario?.trim()) addRow("Obs. horário", state.obsHorario);
  addRow("Local", state.endereco);
  const criancas = state.criancas && state.criancas !== "0" ? ` + ${state.criancas} crianças` : "";
  addRow("Convidados", `${state.adultos} adultos${criancas}`);
  if (state.restricoes?.trim()) addRow("Restrições", state.restricoes);

  // ── Cardápio ──────────────────────────────────────────────────────────────
  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  addSection("Estilo de serviço");
  addRow("Estilo", state.estilo.join(", "));

  if (isCoffee) {
    addSection("Coffee Break");
    if (state.coffeeBreak) addRow("Cardápio", state.coffeeBreak);
    if (state.coffeeBreakObs?.trim()) addRow("Alterações", state.coffeeBreakObs);
  } else if (isFeijoada) {
    addSection("Feijoada");
    if (state.feijoada) addRow("Formato", state.feijoada);
    if (state.sobremesas.length) addRow("Sobremesas", state.sobremesas.join(", "));
    if (state.sugestaoSobremesas?.trim()) addRow("Sugestão sobr.", state.sugestaoSobremesas);
  } else {
    addSection("Cardápio");
    if (state.entradas.length) addRow("Entradas", state.entradas.join(", "));
    if (state.sugestaoEntradas?.trim()) addRow("Sugestão entr.", state.sugestaoEntradas);
    if (state.principais.length) addRow("Principais", state.principais.join(", "));
    if (state.sugestaoPrincipais?.trim()) addRow("Sugestão princ.", state.sugestaoPrincipais);
    if (state.tacho.length) addRow("Tacho/Paellera", state.tacho.join(", "));
    if (state.sobremesas.length) addRow("Sobremesas", state.sobremesas.join(", "));
    if (state.sugestaoSobremesas?.trim()) addRow("Sugestão sobr.", state.sugestaoSobremesas);
  }

  // ── Estrutura ─────────────────────────────────────────────────────────────
  addSection("Estrutura");
  if (state.cozinha) addRow("Cozinha", state.cozinha);
  if (state.mesas) addRow("Mesas e louças", state.mesas);
  if (!isCoffee && state.bebidas) addRow("Bebidas", state.bebidas);

  // ── Contato ───────────────────────────────────────────────────────────────
  addSection("Contato");
  addRow("Nome", state.nome);
  addRow("WhatsApp", state.whatsapp);
  if (state.email?.trim()) addRow("E-mail", state.email);
  if (state.prazo?.trim()) addRow("Prazo desejado", state.prazo);
  if (state.faixa) addRow("Faixa de investimento", state.faixa);
  if (state.obs?.trim()) addRow("Observações", state.obs);

  // ── Data de geração (canto inferior, antes do rodapé) ────────────────────
  doc.setFontSize(7);
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "italic");
  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Briefing gerado em ${today}`, RIGHT, CONTENT_BOTTOM + 3, { align: "right" });

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
