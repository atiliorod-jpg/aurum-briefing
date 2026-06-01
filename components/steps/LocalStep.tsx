"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function LocalStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">3 / 10</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Onde acontece?</h1>
      <p className="text-gray-500 text-sm mb-5">Endereço completo do local.</p>
      <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Endereço</label>
      <textarea
        rows={3}
        placeholder="Rua, número, bairro, cidade."
        value={state.endereco}
        onChange={e => onChange({ endereco: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
      />
    </div>
  );
}
