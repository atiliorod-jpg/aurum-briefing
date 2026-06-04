"use client";
import OptionCard from "@/components/ui/OptionCard";

interface MultiSelectStepProps {
  stepNumber: string;
  title: string;
  hint: string;
  options: Array<{ value: string; label: string; desc?: string }>;
  selected: string[];
  max: number;
  onChange: (selected: string[]) => void;
  suggestion?: string;
  onSuggestionChange?: (value: string) => void;
  priceNote?: boolean;
  /** Opções exclusivas (ex: "Sem entradas", "Sugestão do chef"): ao marcar uma,
   *  limpa as demais; ao marcar qualquer outra, remove as exclusivas. */
  exclusiveValues?: string[];
}

export default function MultiSelectStep({
  stepNumber, title, hint, options, selected, max, onChange,
  suggestion, onSuggestionChange, priceNote, exclusiveValues = [],
}: MultiSelectStepProps) {
  const isExclusive = (v: string) => exclusiveValues.includes(v);

  const toggle = (value: string) => {
    const has = selected.includes(value);

    // Opção exclusiva: seleciona sozinha (ou desmarca)
    if (isExclusive(value)) {
      onChange(has ? [] : [value]);
      return;
    }

    // Opção normal: primeiro descarta qualquer exclusiva marcada
    const base = selected.filter((v) => !isExclusive(v));
    if (base.includes(value)) {
      onChange(base.filter((v) => v !== value));
    } else {
      const next = base.length >= max ? base.slice(1) : base;
      onChange([...next, value]);
    }
  };

  return (
    <div>
      {stepNumber && (
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">{stepNumber}</div>
      )}
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">{title}</h1>
      <p className="text-gray-500 text-sm mb-5">{hint}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label}
            description={o.desc}
            selected={selected.includes(o.value)}
            onClick={() => toggle(o.value)}
            variant="multi"
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs italic">
        {priceNote && max > 1 ? (
          <span className="text-gray-500">Mais opções podem alterar o valor final da proposta.</span>
        ) : <span />}
        <span className={selected.length === max ? "text-[#C9A24B] font-semibold not-italic" : "text-gray-500"}>
          {selected.length} de {max} selecionados
        </span>
      </div>

      {onSuggestionChange && (
        <div className="mt-5">
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
            Tem uma sugestão fora do cardápio? <span className="font-normal text-gray-500">(opcional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="Descreva um prato ou ideia que gostaria de incluir."
            value={suggestion || ""}
            onChange={(e) => onSuggestionChange(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
          />
        </div>
      )}
    </div>
  );
}
