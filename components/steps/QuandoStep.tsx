"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

function addHours(time: string, hours: number): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export default function QuandoStep({ state, onChange }: Props) {
  const handleInicio = (v: string) => {
    const fim = state.horaFim || addHours(v, 4);
    onChange({ horaInicio: v, horaFim: fim });
  };

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
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Início</label>
          <input type="time" value={state.horaInicio} onChange={e => handleInicio(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Término</label>
          <input type="time" value={state.horaFim} onChange={e => onChange({ horaFim: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      </div>
      <p className="text-xs text-gray-400 italic mb-5">Duração padrão: 4 horas. O término é ajustado automaticamente ao informar o início.</p>
      <div>
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Observações sobre o horário <span className="font-normal text-gray-400">(opcional)</span></label>
        <input type="text" placeholder="Ex: evento pode se estender até meia-noite"
          value={state.obsHorario || ""}
          onChange={e => onChange({ obsHorario: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
      </div>
    </div>
  );
}
