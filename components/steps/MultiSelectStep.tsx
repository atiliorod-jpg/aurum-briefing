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
}

export default function MultiSelectStep({ stepNumber, title, hint, options, selected, max, onChange }: MultiSelectStepProps) {
  const toggle = (value: string) => {
    const idx = selected.indexOf(value);
    if (idx >= 0) {
      onChange(selected.filter((v) => v !== value));
    } else {
      const next = selected.length >= max ? selected.slice(1) : selected;
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
      <p className={`text-xs text-right mt-3 italic ${selected.length === max ? "text-[#C9A24B] font-semibold" : "text-gray-400"}`}>
        {selected.length} de {max} selecionados
      </p>
    </div>
  );
}
