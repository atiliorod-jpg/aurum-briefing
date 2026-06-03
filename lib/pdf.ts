import jsPDF from "jspdf";
import { FormState } from "./types";
import { formatDate } from "./utils";

const NAVY: [number, number, number] = [27, 42, 65];
const GOLD: [number, number, number] = [201, 162, 75];
const GREY: [number, number, number] = [80, 90, 110];
const LIGHT_GREY: [number, number, number] = [140, 150, 165];

// Área útil entre cabeçalho e rodapé do papel timbrado
const CONTENT_TOP = 62;
const CONTENT_BOTTOM = 252;
const LEFT = 24;
const RIGHT = 186;
const VALUE_X = 64; // coluna onde começa o valor (label fica antes)

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

  // ── Cabeçalho do documento ────────────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("Briefing de Evento", 105, y, { align: "center" });
  y += 5;

  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  if (state.nome) doc.text(state.nome, 105, y, { align: "center" });
  y += 4;

  // Linha decorativa dupla (gold)
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(85, y + 1, 125, y + 1);
  doc.setLineWidth(0.2);
  doc.line(80, y + 2.4, 130, y + 2.4);
  y += 10;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addSection = (title: string) => {
    ensureSpace(11);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(title.toUpperCase(), LEFT, y, { charSpace: 1.5 });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.25);
    doc.line(LEFT, y + 1.4, RIGHT, y + 1.4);
    y += 7;
  };

  const addRow = (label: string, value: string) => {
    if (!value || !value.trim()) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(label, LEFT, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    const wrapped = doc.splitTextToSize(value, RIGHT - VALUE_X);
    const needed = wrapped.length * 4.6 + 1.5;
    ensureSpace(needed);
    doc.text(wrapped, VALUE_X, y);
    y += needed;
  };

  // ── Evento ────────────────────────────────────────────────────────────────
  addSection("Evento");
  addRow("Tipo", state.tipo === "Outro" ? state.tipoOutro : state.tipo || "");

  const horario = [
    state.horaInicio,
    state.horaFim ? `às ${state.horaFim}` : "",
  ].filter(Boolean).join(" ");
  addRow("Data", `${formatDate(state.data)}${horario ? "  •  " + horario : ""}`);
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
  if (state.mesas) addRow("Louças e talheres", state.mesas);
  if (!isCoffee && state.bebidas) addRow("Bebidas", state.bebidas);

  // ── Contato ───────────────────────────────────────────────────────────────
  addSection("Contato");
  addRow("Nome", state.nome);
  addRow("WhatsApp", state.whatsapp);
  if (state.email?.trim()) addRow("E-mail", state.email);
  if (state.prazo?.trim()) addRow("Prazo desejado", `até ${formatDate(state.prazo)}`);
  if (state.faixa) addRow("Faixa de investimento", state.faixa);
  if (state.obs?.trim()) addRow("Observações", state.obs);

  // ── Data de geração ───────────────────────────────────────────────────────
  doc.setFontSize(7.5);
  doc.setTextColor(...LIGHT_GREY);
  doc.setFont("times", "italic");
  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Documento gerado em ${today}`, RIGHT, CONTENT_BOTTOM + 4, { align: "right" });

  return doc.output("blob");
}

// Reexporta o utilitário de download (definido em módulo leve separado)
export { downloadBlob, downloadBlob as downloadPDF } from "./download";
