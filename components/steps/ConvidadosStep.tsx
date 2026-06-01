"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function ConvidadosStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">4 / 10</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Quantos convidados?</h1>
      <p className="text-gray-500 text-sm mb-5">Mesmo uma estimativa já ajuda.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Adultos</label>
          <input type="number" min="0" placeholder="Ex: 40" value={state.adultos}
            onChange={e => onChange({ adultos: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Crianças (até 10)</label>
          <input type="number" min="0" placeholder="Ex: 5" value={state.criancas}
            onChange={e => onChange({ criancas: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      </div>
      <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Restrições alimentares ou alergias?</label>
      <textarea rows={3} placeholder="Vegetariano, sem glúten, alergias, etc. (opcional)"
        value={state.restricoes} onChange={e => onChange({ restricoes: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
    </div>
  );
}
