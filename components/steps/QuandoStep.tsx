"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function QuandoStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">2 / 10</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Quando será o evento?</h1>
      <p className="text-gray-500 text-sm mb-5">Data e horários previstos.</p>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Data</label>
        <input type="date" value={state.data} onChange={e => onChange({ data: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Início</label>
          <input type="time" value={state.horaInicio} onChange={e => onChange({ horaInicio: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Término</label>
          <input type="time" value={state.horaFim} onChange={e => onChange({ horaFim: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      </div>
    </div>
  );
}
