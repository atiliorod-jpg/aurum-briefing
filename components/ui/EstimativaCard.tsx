"use client";
import { FormState } from "@/lib/types";
import { estimar, formatBRL } from "@/lib/orcamento";

export default function EstimativaCard({ state }: { state: FormState }) {
  const e = estimar(state);
  if (e.porPessoa <= 0 || e.pessoas <= 0) return null;

  return (
    <div className="bg-[#FBF7EE] border border-[#C9A24B]/50 rounded-xl p-4 text-left">
      <p className="text-xs font-bold text-[#9A7B2E] uppercase tracking-wider mb-1">💰 Estimativa parcial</p>
      <p className="text-sm text-[#1B2A41] leading-relaxed">
        <strong>{formatBRL(e.porPessoa)}</strong> por pessoa × <strong>{e.pessoas}</strong> convidados ={" "}
        <strong className="text-lg text-[#1B2A41]">{formatBRL(e.total)}</strong>
      </p>
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
