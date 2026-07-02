import jsPDF from "jspdf";
import { FormState } from "./types";
import { formatDate, enderecoLimpo } from "./utils";
import { getDescricao, getFeijoadaLabel, COFFEE_DETAILS, BEBIDAS_ITEMS } from "./menu";
import { estimar, formatBRL, precoDe, pessoasDoTacho, entradasPessoasCobranca } from "./orcamento";

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

  addRow("Local", enderecoLimpo(state.endereco));
  const criancas = state.criancas && state.criancas !== "0" ? ` + ${state.criancas} crianças` : "";
  addRow("Convidados", `${state.adultos} adultos${criancas}`);
  if (state.restricoes?.trim()) addRow("Restrições", state.restricoes);

  // ── Cardápio (mostra tudo que foi selecionado, em qualquer combinação) ─────
  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

  addSection("Estilo de serviço");
  addRow("Estilo", state.estilo.join(", "));

  addSection("Cardápio");
  // Cardápio clássico (empratado + tacho)
  addDishList("Entradas", state.entradas);
  if (state.sugestaoEntradas?.trim()) addRow("Sugestão de entrada", state.sugestaoEntradas);
  addDishList("Pratos principais", state.principais);
  if (state.sugestaoPrincipais?.trim()) addRow("Sugestão de principal", state.sugestaoPrincipais);
  // Cardápio buffet / volante
  addDishList("Entradas (Buffet / Volante)", state.entradasBuffet ?? []);
  if (state.sugestaoEntradasBuffet?.trim()) addRow("Sugestão de entrada", state.sugestaoEntradasBuffet);
  addDishList("Pratos principais (Buffet / Volante)", state.principaisBuffet ?? []);
  if (state.sugestaoPrincipaisBuffet?.trim()) addRow("Sugestão de principal", state.sugestaoPrincipaisBuffet);
  if (state.tacho.length) {
    addDishLabel("Tacho / Paellera");
    for (const v of state.tacho) {
      const n = state.tacho.length === 2 ? pessoasDoTacho(state, v) : 0;
      const nome = n > 0 ? `${v}  (${n} convidados)` : v;
      addDishItem(nome, getDescricao(v));
    }
    y += 1;
  }
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
  addDishList("Sobremesas (Buffet / Volante)", state.sobremesasBuffet ?? []);
  if (state.sugestaoSobremesasBuffet?.trim()) addRow("Sugestão de sobremesa", state.sugestaoSobremesasBuffet);
  addDishList("Sobremesas regionais", state.sobremesasRegionais ?? []);
  if (state.sugestaoSobremesasRegionais?.trim()) addRow("Sugestão de sobremesa", state.sugestaoSobremesasRegionais);

  // Direcionamento de cardápio sob medida (Sugestão da Aurum)
  if (state.estilo.includes("Sugestão da Aurum")) {
    addSection("Cardápio sob medida");
    if (state.cardapioPerfil.length) addRow("Perfil desejado", state.cardapioPerfil.join(", "));
    if (state.cardapioNaoPodeFaltar?.trim()) addRow("Não pode faltar", state.cardapioNaoPodeFaltar);
    if (state.cardapioEvitar?.trim()) addRow("Evitar", state.cardapioEvitar);
  }

  // Jantar Harmonizado
  if (state.estilo.includes("Jantar Harmonizado")) {
    addSection("Jantar Harmonizado — Menu Degustação");
    if (state.harmonizadoCursos) addRow("Formato", state.harmonizadoCursos);
    if (state.harmonizadoVinhos) addRow("Harmonização", state.harmonizadoVinhos);
    if (state.harmonizadoObs?.trim()) addRow("Observações", state.harmonizadoObs);
    addRow("Valor", "Sob consulta — a Aurum apresentará a proposta após o primeiro contato.");
  }

  // Jantar Temático
  if (state.estilo.includes("Jantar Temático")) {
    addSection("Jantar Temático");
    if (state.temaJantar) addRow("Culinária", state.temaJantar);
    if (state.temaJantarProbs?.length) addRow("Pratos de interesse", state.temaJantarProbs.join(", "));
    if (state.temaJantarNaoPodeFaltar?.trim()) addRow("Não pode faltar", state.temaJantarNaoPodeFaltar);
    if (state.temaJantarEvitar?.trim()) addRow("Evitar / substituir", state.temaJantarEvitar);
    addRow("Valor", "Sob consulta — a Aurum apresentará a proposta após o primeiro contato.");
  }

  // ── Estrutura ─────────────────────────────────────────────────────────────
  addSection("Estrutura");
  if (state.cozinha) addRow("Cozinha no local", state.cozinha + (state.cozinhaDesc ? ` — ${state.cozinhaDesc}` : ""));
  if (state.mesas) addRow("Louças e talheres", state.mesas);
  if (!isCoffeeOnly && state.bebidas) {
    if (state.bebidas === "Incluir Aurum" && (state.bebidasItens?.length ?? 0) > 0) {
      const nomes = (state.bebidasItens ?? [])
        .map((v) => BEBIDAS_ITEMS.find((b) => b.value === v)?.label)
        .filter(Boolean).join(", ");
      addRow("Bebidas", `Incluir Aurum — ${nomes}`);
    } else {
      addRow("Bebidas", state.bebidas);
    }
  }

  // ── Contato ───────────────────────────────────────────────────────────────
  addSection("Contato");
  addRow("Nome", state.nome);
  addRow("WhatsApp", state.whatsapp);
  if (state.email?.trim()) addRow("E-mail", state.email);
  if (state.obs?.trim()) addRow("Observações", state.obs);
  addRow("Proposta", "Orçamento enviado em até 24 horas.");

  // ── Estimativa parcial ────────────────────────────────────────────────────
  const est = estimar(state);
  if (est.total > 0 && est.pessoas > 0) {
    addSection("Estimativa parcial");

    // Entradas distribuídas (empratado c/ 2 opções) — distribuição de COBRANÇA
    // (escalada para o mínimo faturável em grupos pequenos)
    const EXCL_E = new Set(["Sem entradas", "Sugestão do chef"]);
    const entradasReais = state.entradas.filter((v) => !EXCL_E.has(v));
    const multiEntrada = state.estilo.includes("Serviço franco-americano (empratado)") && entradasReais.length >= 2;
    if (multiEntrada && est.entradasSubtotal > 0) {
      const cobranca = entradasPessoasCobranca(state);
      for (const v of entradasReais) {
        const p = precoDe(v);
        if (p == null) continue;
        const n = cobranca[v] ?? 0;
        addRow(`Entrada (${v})`, `${formatBRL(p)} × ${n} = ${formatBRL(p * n)}`);
      }
    }

    const cardapioTotal = est.porPessoa * est.pessoasFaturaveis;
    if (cardapioTotal > 0) {
      addRow("Cardápio", `${formatBRL(est.porPessoa)}/pessoa × ${est.pessoasFaturaveis} = ${formatBRL(cardapioTotal)}`);
      if (est.itens.filter((i) => i.nome !== "Louças e talheres (básico)").length > 0) {
        addRow("Itens", est.itens.filter((i) => i.nome !== "Louças e talheres (básico)").map((i) => i.nome).join(", "));
      }
    }

    if (est.aplicouMinimo) {
      addRow(
        "Grupo pequeno",
        `Evento com ${est.pessoas} convidados — cardápio e bebidas calculados pelo mínimo de ${est.pessoasFaturaveis} pessoas (custos fixos da operação). O valor por convidado fica mais alto em eventos menores.`,
      );
    }

    // 2 tachos: cada tacho em linha própria com sua distribuição de convidados
    if (state.tacho.length === 2) {
      for (const v of state.tacho) {
        const p = precoDe(v);
        if (p == null) continue;
        const n = pessoasDoTacho(state, v);
        addRow(`Tacho (${v})`, `${formatBRL(p)} × ${n} = ${formatBRL(p * n)}`);
      }
    }

    // Desconto para grupos grandes (acima de 70 convidados)
    if (est.multiplicador < 1 && est.foodTotal > 0) {
      addRow("Subtotal do cardápio", formatBRL(est.foodTotal));
      const ajuste = Math.round(est.foodTotal * est.multiplicador) - est.foodTotal;
      addRow("Desconto grupo grande", `− ${formatBRL(Math.abs(ajuste))}`);
    }

    // Bebidas (separado do cardápio)
    if (est.custoBebidas > 0 && est.itensBebidas.length > 0) {
      addRow("Bebidas", `${formatBRL(est.custoBebidas / est.pessoasFaturaveis)}/pessoa × ${est.pessoasFaturaveis} = ${formatBRL(est.custoBebidas)}`);
      addRow("Itens de bebida", est.itensBebidas.map((i) => i.nome).join(", "));
    }

    if (est.custoOperacional > 0) {
      addRow("Apoio de produção", formatBRL(est.custoOperacional));
    }

    if (est.custoLogistica > 0 && state.distanciaKm != null) {
      addRow("Logística", `${formatBRL(est.custoLogistica)} (~${state.distanciaKm} km da base Aurum)`);
    }

    addRow("Total estimado", formatBRL(est.total));

    if (est.temItemSemPreco) addRow("Atenção", "Há itens sem valor cadastrado — o total pode aumentar.");
    if (est.incluiLoucas) addRow("Louças", "Inclui adicional básico de louças e talheres (R$ 10/pessoa) — pode variar conforme os pratos.");
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
