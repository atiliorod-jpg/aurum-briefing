"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

// Mantém só dígitos e limita a um teto sensato (evita valores absurdos)
function clamp(v: string): string {
  const d = v.replace(/\D/g, "");
  if (d === "") return "";
  return String(Math.min(parseInt(d, 10), 5000));
}

export default function ConvidadosStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CONVIDADOS</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Quantos convidados?</h1>
      <p className="text-gray-500 text-sm mb-5">Mesmo uma estimativa já ajuda.</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label htmlFor="ev-adultos" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Adultos <span className="text-[#9A7B2E]">• obrigatório</span></label>
          <input id="ev-adultos" type="number" min="1" max="5000" inputMode="numeric" placeholder="Ex: 40" value={state.adultos}
            onChange={e => onChange({ adultos: clamp(e.target.value) })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
        <div>
          <label htmlFor="ev-criancas" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Crianças (até 10)</label>
          <input id="ev-criancas" type="number" min="0" max="5000" inputMode="numeric" placeholder="Ex: 5" value={state.criancas}
            onChange={e => onChange({ criancas: clamp(e.target.value) })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      </div>
      <label htmlFor="ev-restricoes" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Restrições alimentares ou alergias?</label>
      <textarea id="ev-restricoes" rows={3} placeholder="Vegetariano, sem glúten, alergias, etc. (opcional)"
        value={state.restricoes} onChange={e => onChange({ restricoes: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />

      <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-4 text-xs text-gray-600 leading-relaxed mt-3">
        ℹ️ Grupos com menos de <strong>20 convidados</strong> são calculados pelo mínimo de 20 pessoas
        (custos fixos da operação) — a estimativa já mostra isso.
      </div>
    </div>
  );
}
