import { FormState } from "./types";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// Sugere a data de confirmação de presença (RSVP): 40% do tempo entre hoje e o evento.
// Se cair em fração de dia, arredonda sempre para baixo (dia anterior).
// Retorna no formato "5 de maio" (ou "" se não houver data válida no futuro).
export function sugestaoRSVP(eventoISO: string): string {
  if (!eventoISO) return "";
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const evento = new Date(`${eventoISO}T00:00:00`);
  if (isNaN(evento.getTime()) || evento <= hoje) return "";
  const DIA = 86400000;
  const dias = Math.round((evento.getTime() - hoje.getTime()) / DIA);
  const offset = Math.floor(dias * 0.4); // arredonda para baixo
  const alvo = new Date(hoje.getTime() + offset * DIA);
  return `${alvo.getDate()} de ${MESES[alvo.getMonth()]}`;
}

// Telefone completo = DDD (2) + 8 (fixo) ou 9 (celular) dígitos
export function isPhoneComplete(v: string): boolean {
  const d = v.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

// Validação simples de e-mail
export function isEmailValid(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
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

// Monta a mensagem do briefing. Em modo compacto, omite textos livres longos
// (sugestões, observações) — usado quando a mensagem seria grande demais para o
// link do WhatsApp; os detalhes completos seguem no PDF.
export function buildWhatsAppMessage(state: FormState, opts: { compact?: boolean } = {}): string {
  const compact = !!opts.compact;
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
  if (!compact && state.obsHorario?.trim()) lines.push(`• Observação de horário: ${state.obsHorario}`);
  lines.push(`• Local: ${state.endereco}`);
  const criancas = state.criancas && state.criancas !== "0" ? ` + ${state.criancas} crianças` : "";
  lines.push(`• Convidados: ${state.adultos} adultos${criancas}`);
  // Restrições/alergias são mantidas mesmo no compacto (segurança alimentar)
  if (state.restricoes.trim()) lines.push(`• Restrições alimentares: ${state.restricoes}`);

  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

  lines.push(``);
  lines.push(`*ESTILO DE SERVIÇO*`);
  lines.push(`• ${state.estilo.join(", ")}`);

  lines.push(``);
  lines.push(`*CARDÁPIO*`);
  if (state.entradas.length) lines.push(`• Entradas: ${state.entradas.join(", ")}`);
  if (!compact && state.sugestaoEntradas?.trim()) lines.push(`• Sugestão de entrada: ${state.sugestaoEntradas}`);
  if (state.principais.length) lines.push(`• Pratos principais: ${state.principais.join(", ")}`);
  if (!compact && state.sugestaoPrincipais?.trim()) lines.push(`• Sugestão de principal: ${state.sugestaoPrincipais}`);
  if (state.tacho.length) {
    if (state.tacho.length === 2) {
      const parts = state.tacho.map((v) => {
        const n = Number(state.tachoPessoas?.[v]) || 0;
        return `${v} (${n} pessoas)`;
      });
      lines.push(`• Tacho/Paellera: ${parts.join("; ")}`);
    } else {
      lines.push(`• Tacho/Paellera: ${state.tacho.join(", ")}`);
    }
  }
  if (state.feijoada) lines.push(`• Feijoada: ${state.feijoada}`);
  if (state.coffeeBreak) lines.push(`• Coffee Break: ${state.coffeeBreak}`);
  if (!compact && state.coffeeBreakObs?.trim()) lines.push(`• Alterações no coffee: ${state.coffeeBreakObs}`);
  if (state.sobremesas.length) lines.push(`• Sobremesas: ${state.sobremesas.join(", ")}`);
  if (!compact && state.sugestaoSobremesas?.trim()) lines.push(`• Sugestão de sobremesa: ${state.sugestaoSobremesas}`);

  // Direcionamento de cardápio sob medida (Sugestão da Aurum)
  if (state.estilo.includes("Sugestão da Aurum")) {
    lines.push(``);
    lines.push(`*CARDÁPIO SOB MEDIDA*`);
    if (state.cardapioPerfil.length) lines.push(`• Perfil: ${state.cardapioPerfil.join(", ")}`);
    if (!compact && state.cardapioNaoPodeFaltar?.trim()) lines.push(`• Não pode faltar: ${state.cardapioNaoPodeFaltar}`);
    if (!compact && state.cardapioEvitar?.trim()) lines.push(`• Evitar: ${state.cardapioEvitar}`);
  }

  lines.push(``);
  lines.push(`*ESTRUTURA*`);
  lines.push(`• Cozinha: ${state.cozinha}`);
  lines.push(`• Louças e talheres: ${state.mesas}`);
  if (!isCoffeeOnly) lines.push(`• Bebidas: ${state.bebidas}`);

  lines.push(``);
  lines.push(`*PRÓXIMOS PASSOS*`);
  lines.push(`• Proposta de orçamento enviada em até 24 horas.`);
  if (!compact && state.obs.trim()) lines.push(`• Observações: ${state.obs}`);

  if (compact) {
    lines.push(``);
    lines.push(`_Observações e sugestões completas no resumo em PDF/Word._`);
  }

  return lines.join("\n");
}

// Texto para o link do WhatsApp: usa a versão completa quando cabe no link;
// se ficar grande demais (alguns aparelhos cortam), usa a versão compacta.
// O limite considera o tamanho JÁ codificado para URL (acentos contam mais).
const WA_LINK_LIMITE = 1900;
export function buildWhatsAppLinkText(state: FormState): string {
  const full = buildWhatsAppMessage(state);
  if (encodeURIComponent(full).length <= WA_LINK_LIMITE) return full;
  return buildWhatsAppMessage(state, { compact: true });
}
