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

// Ajusta os minutos para apenas :00 ou :30 (facilita a organização do horário)
function snap30(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h)) return "";
  let hour = h;
  let min = 0;
  if (m >= 45) { hour = (h + 1) % 24; min = 0; }
  else if (m >= 15) { min = 30; }
  else { min = 0; }
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export default function QuandoStep({ state, onChange }: Props) {
  const handleInicio = (v: string) => {
    const inicio = snap30(v);
    // Sempre recalcula o término para manter os 4 h padrão ao alterar o início.
    onChange({ horaInicio: inicio, horaFim: addHours(inicio, 4) });
  };

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">DATA E HORÁRIO</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Quando será o evento?</h1>
      <p className="text-gray-500 text-sm mb-5">Os horários abaixo são o <strong className="text-[#1B2A41]">início</strong> e o <strong className="text-[#1B2A41]">término do serviço da Aurum</strong> no local.</p>
      <div className="mb-4">
        <label htmlFor="ev-data" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Data <span className="text-[#9A7B2E]">• obrigatório</span></label>
        <input id="ev-data" type="date" value={state.data} min={new Date().toLocaleDateString("en-CA")} onChange={e => onChange({ data: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label htmlFor="ev-inicio" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Início do serviço</label>
          <input id="ev-inicio" type="time" step={1800} value={state.horaInicio} onChange={e => handleInicio(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
        <div>
          <label htmlFor="ev-fim" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Término do serviço</label>
          <input id="ev-fim" type="time" step={1800} value={state.horaFim} onChange={e => onChange({ horaFim: snap30(e.target.value) })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      </div>
      <p className="text-xs text-gray-400 italic mb-5">Duração padrão: 4 horas de serviço. Horários em intervalos de 30 minutos (ex: 19:00 ou 19:30). O término é ajustado automaticamente ao informar o início.</p>
      <div>
        <label htmlFor="ev-obshorario" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Observações sobre o horário <span className="font-normal text-gray-400">(opcional)</span></label>
        <input id="ev-obshorario" type="text" placeholder="Ex: evento pode se estender até meia-noite"
          value={state.obsHorario || ""}
          onChange={e => onChange({ obsHorario: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
      </div>
    </div>
  );
}
