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
  lines.push(``);
  lines.push(`*EVENTO*`);
  const tipoLabel = state.tipo === "Outro" ? `Outro — ${state.tipoOutro}` : state.tipo || "";
  lines.push(`• Tipo: ${tipoLabel}`);
  const horario = [
    state.horaInicio,
    state.horaFim ? `às ${state.horaFim}` : "",
  ].filter(Boolean).join(" ");
  lines.push(`• Data: ${formatDate(state.data)}${horario ? `  •  ${horario}` : ""}`);
  lines.push(`• Local: ${state.endereco}`);
  const criancas = state.criancas && state.criancas !== "0" ? ` + ${state.criancas} crianças` : "";
  lines.push(`• Convidados: ${state.adultos} adultos${criancas}`);
  if (state.restricoes.trim()) lines.push(`• Restrições: ${state.restricoes}`);

  if (state.tipo === "Evento de Feijoada") {
    lines.push(``);
    lines.push(`*FEIJOADA*`);
    lines.push(`• Estilo: ${state.feijoada}`);
  } else {
    lines.push(``);
    lines.push(`*CARDÁPIO*`);
    lines.push(`• Estilo: ${state.estilo.join(", ")}`);
    lines.push(`• Entradas: ${state.entradas.join(", ")}`);
    lines.push(`• Principais: ${state.principais.join(", ")}`);
    if (state.tacho.length > 0) lines.push(`• Tacho/Paellera: ${state.tacho.join(", ")}`);
    lines.push(`• Sobremesas: ${state.sobremesas.join(", ")}`);
  }

  lines.push(``);
  lines.push(`*ESTRUTURA*`);
  lines.push(`• Cozinha: ${state.cozinha}`);
  lines.push(`• Mesas e louças: ${state.mesas}`);
  lines.push(`• Bebidas: ${state.bebidas}`);

  lines.push(``);
  lines.push(`*PRÓXIMOS PASSOS*`);
  if (state.faixa) lines.push(`• Faixa de investimento: ${state.faixa}`);
  if (state.prazo) lines.push(`• Prazo para proposta: ${state.prazo}`);
  if (state.obs.trim()) lines.push(`• Observações: ${state.obs}`);

  return lines.join("\n");
}
