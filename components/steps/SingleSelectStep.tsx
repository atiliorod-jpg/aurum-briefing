"use client";
import { ReactNode } from "react";
import OptionCard from "@/components/ui/OptionCard";
import { formatBRL } from "@/lib/orcamento";

interface Option { value: string; label: string; desc?: string; preco?: number; }

interface SingleSelectStepProps {
  stepNumber: string;
  title: string;
  hint?: string;
  options: Option[];
  selected: string | null;
  onChange: (value: string) => void;
  footer?: ReactNode;
}

export default function SingleSelectStep({ stepNumber, title, hint, options, selected, onChange, footer }: SingleSelectStepProps) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">{stepNumber}</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">{title}</h1>
      {hint && <p className="text-gray-500 text-sm mb-5">{hint}</p>}
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label}
            description={o.desc}
            price={o.preco != null ? formatBRL(o.preco) : undefined}
            selected={selected === o.value}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}
