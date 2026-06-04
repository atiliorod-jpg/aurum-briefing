import jsPDF from "jspdf";
import { FormState } from "./types";
import { formatDate } from "./utils";
import { getDescricao, getFeijoadaLabel, COFFEE_DETAILS } from "./menu";
import { estimar, formatBRL } from "./orcamento";

// Quebra "item a; item b." em itens limpos (mesma lógica da tela de coffee break)
function splitItens(texto: string): string[] {
  return texto.split(";").map((s) => s.replace(/\.+\s*$/, "").trim()).filter(Boolean);
}

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

  // Rótulo de um grupo de pratos (ex: "Entradas")
  const addDishLabel = (label: string) => {
    ensureSpace(6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text(label.toUpperCase(), LEFT, y, { charSpace: 0.5 });
    y += 5;
  };

  // Um prato: nome em destaque + descrição abaixo (quando houver)
  const addDishItem = (name: string, desc: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    const nameLines = doc.splitTextToSize(`•  ${name}`, RIGHT - (LEFT + 3));
    const descLines = desc ? doc.splitTextToSize(desc, RIGHT - (LEFT + 7)) : [];
    ensureSpace(nameLines.length * 4.3 + descLines.length * 3.6 + 2.5);
    doc.text(nameLines, LEFT + 3, y);
    y += nameLines.length * 4.3;
    if (descLines.length) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(descLines, LEFT + 7, y);
      y += descLines.length * 3.6;
    }
    y += 2;
  };

  // Lista de pratos de uma categoria, cada um com sua descrição
  const addDishList = (label: string, values: string[]) => {
    if (!values.length) return;
    addDishLabel(label);
    for (const v of values) addDishItem(v, getDescricao(v));
    y += 1;
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

  // ── Cardápio (mostra tudo que foi selecionado, em qualquer combinação) ─────
  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

  addSection("Estilo de serviço");
  addRow("Estilo", state.estilo.join(", "));

  addSection("Cardápio");
  addDishList("Entradas", state.entradas);
  if (state.sugestaoEntradas?.trim()) addRow("Sugestão de entrada", state.sugestaoEntradas);
  addDishList("Pratos principais", state.principais);
  if (state.sugestaoPrincipais?.trim()) addRow("Sugestão de principal", state.sugestaoPrincipais);
  addDishList("Tacho / Paellera", state.tacho);
  if (state.feijoada) {
    addDishLabel("Feijoada");
    addDishItem(getFeijoadaLabel(state.feijoada), getDescricao(state.feijoada));
    y += 1;
  }
  if (state.coffeeBreak) {
    addDishLabel("Coffee Break");
    addDishItem(state.coffeeBreak, "");
    const d = COFFEE_DETAILS[state.coffeeBreak];
    if (d) {
      const addCoffeeCat = (titulo: string, texto: string) => {
        addRow(titulo, splitItens(texto).join(" · "));
      };
      addCoffeeCat("Bebidas", d.bebidas);
      addCoffeeCat("Salgados", d.salgados);
      addCoffeeCat("Doces", d.doces);
    }
    y += 1;
  }
  if (state.coffeeBreakObs?.trim()) addRow("Alterações no coffee", state.coffeeBreakObs);
  addDishList("Sobremesas", state.sobremesas);
  if (state.sugestaoSobremesas?.trim()) addRow("Sugestão de sobremesa", state.sugestaoSobremesas);

  // Direcionamento de cardápio sob medida (Sugestão da Aurum)
  if (state.estilo.includes("Sugestão da Aurum")) {
    addSection("Cardápio sob medida");
    if (state.cardapioPerfil.length) addRow("Perfil desejado", state.cardapioPerfil.join(", "));
    if (state.cardapioNaoPodeFaltar?.trim()) addRow("Não pode faltar", state.cardapioNaoPodeFaltar);
    if (state.cardapioEvitar?.trim()) addRow("Evitar", state.cardapioEvitar);
  }

  // ── Estrutura ─────────────────────────────────────────────────────────────
  addSection("Estrutura");
  if (state.cozinha) addRow("Cozinha no local", state.cozinha);
  if (state.mesas) addRow("Louças e talheres", state.mesas);
  if (!isCoffeeOnly && state.bebidas) addRow("Bebidas", state.bebidas);

  // ── Contato ───────────────────────────────────────────────────────────────
  addSection("Contato");
  addRow("Nome", state.nome);
  addRow("WhatsApp", state.whatsapp);
  if (state.email?.trim()) addRow("E-mail", state.email);
  if (state.obs?.trim()) addRow("Observações", state.obs);
  addRow("Proposta", "Orçamento enviado em até 24 horas.");

  // ── Estimativa parcial ────────────────────────────────────────────────────
  const est = estimar(state);
  if (est.porPessoa > 0 && est.pessoas > 0) {
    addSection("Estimativa parcial");

    const ADICIONAL = "Louças e talheres (básico)";
    const comida = est.itens.filter((i) => i.nome !== ADICIONAL).reduce((s, i) => s + i.preco, 0);
    const loucas = est.itens.filter((i) => i.nome === ADICIONAL).reduce((s, i) => s + i.preco, 0);

    if (comida > 0) addRow("Cardápio", `${formatBRL(comida)} por pessoa × ${est.pessoas} = ${formatBRL(comida * est.pessoas)}`);
    if (loucas > 0) addRow("Louças e talheres", `${formatBRL(loucas)} por pessoa × ${est.pessoas} = ${formatBRL(loucas * est.pessoas)}`);
    addRow("Total estimado", `${formatBRL(est.porPessoa)} por pessoa × ${est.pessoas} = ${formatBRL(est.total)}`);

    if (est.temItemSemPreco) addRow("Observação", "Há itens selecionados ainda sem valor — o total pode aumentar.");
    addRow("", "Valor de referência. Não é a proposta final — a Aurum confirma o orçamento.");
  }

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
