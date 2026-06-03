"use client";
import OptionCard from "@/components/ui/OptionCard";
import { FormState } from "@/lib/types";

const OPTIONS: Array<{ value: string; label: string; desc?: string }> = [
  { value: "Casamento", label: "Casamento" },
  { value: "Aniversário", label: "Aniversário" },
  { value: "Confraternização / Corporativo", label: "Confraternização ou Evento Corporativo" },
  { value: "Almoço ou Jantar Privado", label: "Almoço ou Jantar Privado" },
  { value: "Outro", label: "Outro" },
];

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

export default function TipoStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">EVENTO</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Qual o tipo do seu evento?</h1>
      <p className="text-gray-500 text-sm mb-5">Selecione a opção que melhor descreve a ocasião.</p>
      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label}
            description={o.desc}
            selected={state.tipo === o.value}
            onClick={() => onChange({ tipo: o.value })}
          />
        ))}
      </div>
      {state.tipo === "Outro" && (
        <div className="mt-4">
          <input
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
            placeholder="Ex: Jantar de Noivado, Chá de Bebê, Bodas de Prata..."
            value={state.tipoOutro}
            onChange={(e) => onChange({ tipoOutro: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
