"use client";
import { FormState } from "@/lib/types";
import { estimar, formatBRL, precoDe, pessoasDoTacho } from "@/lib/orcamento";

export default function EstimativaCard({ state }: { state: FormState }) {
  const e = estimar(state);
  if (e.total <= 0 || e.pessoas <= 0) return null;

  const cardapioTotal = e.porPessoa * e.pessoas;

  // Linhas individuais por tacho aparecem só quando há 2 tachos (cada um com sua qtd).
  const tachoLinhas = state.tacho.length === 2
    ? state.tacho.map((v) => {
        const preco = precoDe(v) ?? 0;
        const n = pessoasDoTacho(state, v);
        return { nome: v, preco, pessoas: n, subtotal: preco * n };
      }).filter((l) => l.subtotal > 0)
    : [];

  return (
    <div className="bg-[#FBF7EE] border border-[#C9A24B]/50 rounded-xl p-4 text-left">
      <p className="text-xs font-bold text-[#9A7B2E] uppercase tracking-wider mb-2">💰 Estimativa parcial</p>

      {cardapioTotal > 0 && (
        <p className="text-sm text-[#1B2A41] leading-relaxed">
          <strong>Cardápio:</strong> {formatBRL(e.porPessoa)} × {e.pessoas} ={" "}
          <strong>{formatBRL(cardapioTotal)}</strong>
        </p>
      )}

      {tachoLinhas.map((l) => (
        <p key={l.nome} className="text-sm text-[#1B2A41] leading-relaxed">
          <strong>Tacho ({l.nome}):</strong> {formatBRL(l.preco)} × {l.pessoas} ={" "}
          <strong>{formatBRL(l.subtotal)}</strong>
        </p>
      ))}

      {tachoLinhas.length > 0 && cardapioTotal > 0 && (
        <p className="text-[11px] text-gray-500 mt-0.5">
          Soma do cardápio + tacho{tachoLinhas.length > 1 ? "s" : ""}
        </p>
      )}

      <p className="text-base text-[#1B2A41] mt-2 pt-2 border-t border-[#C9A24B]/30">
        <strong>Total estimado:</strong>{" "}
        <strong className="text-lg">{formatBRL(e.total)}</strong>
      </p>

      {e.incluiLoucas && (
        <p className="text-xs text-gray-500 mt-1.5">
          Inclui um <strong>adicional básico de louças e talheres</strong> (a partir de R$ 10/pessoa) — pode
          variar conforme os pratos escolhidos.
        </p>
      )}
      {e.temItemSemPreco && (
        <p className="text-xs text-gray-500 mt-1.5">
          Há itens selecionados ainda sem valor cadastrado — o total pode aumentar.
        </p>
      )}
      <p className="text-[11px] text-gray-400 mt-1 italic">
        Valor de referência dos pratos já precificados. Não é a proposta final — a Aurum confirma o orçamento.
      </p>
    </div>
  );
}
