import { FormState } from "./types";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Formata telefone no padrão (DD)NNNNN-NNNN — ex: (81)99818-4489
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd})${rest}`;
  // celular (9 dígitos) ou fixo (8 dígitos): separa os 4 últimos com travessão
  const tail = rest.slice(-4);
  const head = rest.slice(0, rest.length - 4);
  return `(${ddd})${head}-${tail}`;
}

// Desloca um horário "HH:MM" por N horas (pode ser negativo)
export function shiftHour(time: string, delta: number): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  let total = h * 60 + m + delta * 60;
  total = ((total % 1440) + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
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

  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

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
  if (state.feijoada) lines.push(`• Feijoada: ${state.feijoada}`);
  if (state.coffeeBreak) lines.push(`• Coffee Break: ${state.coffeeBreak}`);
  if (state.coffeeBreakObs?.trim()) lines.push(`• Alterações no coffee: ${state.coffeeBreakObs}`);
  if (state.sobremesas.length) lines.push(`• Sobremesas: ${state.sobremesas.join(", ")}`);
  if (state.sugestaoSobremesas?.trim()) lines.push(`• Sugestão de sobremesa: ${state.sugestaoSobremesas}`);

  // Direcionamento de cardápio sob medida (Sugestão da Aurum)
  if (state.estilo.includes("Sugestão da Aurum")) {
    lines.push(``);
    lines.push(`*CARDÁPIO SOB MEDIDA*`);
    if (state.cardapioPerfil.length) lines.push(`• Perfil: ${state.cardapioPerfil.join(", ")}`);
    if (state.cardapioNaoPodeFaltar?.trim()) lines.push(`• Não pode faltar: ${state.cardapioNaoPodeFaltar}`);
    if (state.cardapioEvitar?.trim()) lines.push(`• Evitar: ${state.cardapioEvitar}`);
  }

  lines.push(``);
  lines.push(`*ESTRUTURA*`);
  lines.push(`• Cozinha: ${state.cozinha}`);
  lines.push(`• Louças e talheres: ${state.mesas}`);
  if (!isCoffeeOnly) lines.push(`• Bebidas: ${state.bebidas}`);

  lines.push(``);
  lines.push(`*PRÓXIMOS PASSOS*`);
  if (state.faixa) lines.push(`• Faixa de investimento: ${state.faixa}`);
  if (state.prazo) lines.push(`• Prazo para proposta: até ${formatDate(state.prazo)}`);
  if (state.obs.trim()) lines.push(`• Observações: ${state.obs}`);

  return lines.join("\n");
}
