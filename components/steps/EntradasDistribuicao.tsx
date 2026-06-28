"use client";
import { FormState } from "@/lib/types";
import { precoDe, formatBRL } from "@/lib/orcamento";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

// Redistribui automaticamente quando o total de convidados muda.
function balancearEntradas(
  entradas: string[],
  total: number,
  atual: Record<string, string>,
): Record<string, string> {
  if (entradas.length < 2 || total <= 0) return {};
  const [a, b] = entradas;
  const va = Number(atual[a]);
  const vb = Number(atual[b]);
  const ambosValidos = Number.isFinite(va) && va >= 0 && Number.isFinite(vb) && vb >= 0;
  if (ambosValidos && va + vb === total) return { [a]: String(va), [b]: String(vb) };
  if (Number.isFinite(va) && va >= 0 && va <= total) return { [a]: String(va), [b]: String(total - va) };
  const metade = Math.floor(total / 2);
  return { [a]: String(metade), [b]: String(total - metade) };
}

export function balancearEntradasInit(
  entradas: string[],
  total: number,
  atual: Record<string, string>,
): Record<string, string> {
  return balancearEntradas(entradas, total, atual);
}

export default function EntradasDistribuicao({ state, onChange }: Props) {
  const EXCLUSIVAS = new Set(["Sem entradas", "Sugestão do chef"]);
  const entradasReais = state.entradas.filter((v) => !EXCLUSIVAS.has(v));
  const total = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);

  // Só mostra quando empratado com 2 entradas reais e há convidados informados
  const isEmpratado = state.estilo.includes("Serviço franco-americano (empratado)");
  if (!isEmpratado || entradasReais.length < 2 || total <= 0) return null;

  const minPorPrato = Math.ceil(total * 0.2);
  const atual = state.entradasPessoas ?? {};
  const soma = entradasReais.reduce((s, v) => s + (Number(atual[v]) || 0), 0);
  const restante = total - soma;
  const ok = soma === total && entradasReais.every((v) => (Number(atual[v]) || 0) >= minPorPrato);

  const set = (value: string, raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return;
    const novoAtual = { ...atual, [value]: String(n) };
    onChange({ entradasPessoas: novoAtual });
  };

  return (
    <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-4 mt-2 space-y-3">
      <p className="text-sm font-semibold text-[#1B2A41]">
        Quantos convidados recebem cada entrada?
      </p>
      <p className="text-xs text-gray-500">
        Distribua os <strong>{total} convidados</strong> entre as opções (mínimo {minPorPrato} por prato — 20%).
      </p>

      {entradasReais.map((v) => {
        const n = Number(atual[v]) || 0;
        const preco = precoDe(v);
        return (
          <div key={v} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1B2A41] truncate">{v}</p>
              {preco != null && (
                <p className="text-xs text-gray-500">{formatBRL(preco)}/pessoa</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button type="button"
                onClick={() => set(v, String(Math.max(minPorPrato, n - 1)))}
                className="w-8 h-8 rounded-full border-2 border-gray-200 text-[#1B2A41] font-bold text-lg flex items-center justify-center active:scale-95 transition-all">−</button>
              <span className="w-8 text-center font-bold text-[#1B2A41] text-sm">{n}</span>
              <button type="button"
                onClick={() => set(v, String(n + 1))}
                className="w-8 h-8 rounded-full border-2 border-[#C9A24B] text-[#1B2A41] font-bold text-lg flex items-center justify-center active:scale-95 transition-all">+</button>
            </div>
          </div>
        );
      })}

      <div className={`text-xs font-semibold mt-1 ${ok ? "text-green-700" : restante > 0 ? "text-[#9A7B2E]" : "text-red-600"}`}>
        {ok
          ? `✓ Distribuição completa (${total} convidados)`
          : restante > 0
            ? `Faltam ${restante} convidados para distribuir`
            : `Soma ultrapassou ${total} — ajuste os valores`}
      </div>
    </div>
  );
}
