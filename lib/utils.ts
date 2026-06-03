import { FormState } from "./types";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function buildWhatsAppMessage(state: FormState): string {
  const lines: string[] = [];
  lines.push(`*BRIEFING DE EVENTO — AURUM*`);
  lines.push(``);
  lines.push(`*Cliente:* ${state.nome}`);
  lines.push(`*WhatsApp:* ${state.whatsapp}`);
  if (state.email?.trim()) lines.push(`*E-mail:* ${state.email}`);
  lines.push(``);
  lines.push(`*EVENTO*`);
  const tipoLabel = state.tipo === "Outro" ? `Outro — ${state.tipoOutro}` : state.tipo || "";
  lines.push(`• Tipo: ${tipoLabel}`);
  const horario = [
    state.horaInicio,
    state.horaFim ? `às ${state.horaFim}` : "",
  ].filter(Boolean).join(" ");
  lines.push(`• Data: ${formatDate(state.data)}${horario ? `  •  ${horario}` : ""}`);
  if (state.obsHorario?.trim()) lines.push(`• Observação de horário: ${state.obsHorario}`);
  lines.push(`• Local: ${state.endereco}`);
  const criancas = state.criancas && state.criancas !== "0" ? ` + ${state.criancas} crianças` : "";
  lines.push(`• Convidados: ${state.adultos} adultos${criancas}`);
  if (state.restricoes.trim()) lines.push(`• Restrições alimentares: ${state.restricoes}`);

  const isCoffee = state.estilo.includes("Coffee Break");
  const isFeijoada = !isCoffee && state.estilo.includes("Feijoada Completa");

  if (isCoffee) {
    lines.push(``);
    lines.push(`*ESTILO DE SERVIÇO*`);
    lines.push(`• ${state.estilo.join(", ")}`);
    lines.push(``);
    lines.push(`*COFFEE BREAK*`);
    if (state.coffeeBreak) lines.push(`• Cardápio: ${state.coffeeBreak}`);
    if (state.coffeeBreakObs?.trim()) lines.push(`• Alterações pedidas: ${state.coffeeBreakObs}`);
  } else if (isFeijoada) {
    lines.push(``);
    lines.push(`*ESTILO DE SERVIÇO*`);
    lines.push(`• ${state.estilo.join(", ")}`);
    lines.push(``);
    lines.push(`*FEIJOADA*`);
    if (state.feijoada) lines.push(`• Formato: ${state.feijoada}`);
    if (state.sobremesas.length) lines.push(`• Sobremesas: ${state.sobremesas.join(", ")}`);
    if (state.sugestaoSobremesas?.trim()) lines.push(`• Sugestão de sobremesa: ${state.sugestaoSobremesas}`);
  } else {
    lines.push(``);
    lines.push(`*ESTILO DE SERVIÇO*`);
    lines.push(`• ${state.estilo.join(", ")}`);
    lines.push(``);
    lines.push(`*CARDÁPIO*`);
    if (state.entradas.length) lines.push(`• Entradas: ${state.entradas.join(", ")}`);
    if (state.sugestaoEntradas?.trim()) lines.push(`• Sugestão de entrada: ${state.sugestaoEntradas}`);
    if (state.principais.length) lines.push(`• Pratos principais: ${state.principais.join(", ")}`);
    if (state.sugestaoPrincipais?.trim()) lines.push(`• Sugestão de principal: ${state.sugestaoPrincipais}`);
    if (state.tacho.length) lines.push(`• Tacho/Paellera: ${state.tacho.join(", ")}`);
    if (state.sobremesas.length) lines.push(`• Sobremesas: ${state.sobremesas.join(", ")}`);
    if (state.sugestaoSobremesas?.trim()) lines.push(`• Sugestão de sobremesa: ${state.sugestaoSobremesas}`);
  }

  lines.push(``);
  lines.push(`*ESTRUTURA*`);
  lines.push(`• Cozinha: ${state.cozinha}`);
  lines.push(`• Mesas e louças: ${state.mesas}`);
  if (!isCoffee) lines.push(`• Bebidas: ${state.bebidas}`);

  lines.push(``);
  lines.push(`*PRÓXIMOS PASSOS*`);
  if (state.faixa) lines.push(`• Faixa de investimento: ${state.faixa}`);
  if (state.prazo) lines.push(`• Prazo para proposta: ${state.prazo}`);
  if (state.obs.trim()) lines.push(`• Observações: ${state.obs}`);

  return lines.join("\n");
}
