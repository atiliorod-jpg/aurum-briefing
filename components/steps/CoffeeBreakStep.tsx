"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";
import { COFFEE_DETAILS } from "@/lib/menu";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

// Fonte única: lib/menu.ts (mesmos textos usados no PDF do briefing)
const OPTIONS = Object.entries(COFFEE_DETAILS).map(([value, d]) => ({
  value, label: value, ...d,
}));

export default function CoffeeBreakStep({ state, onChange }: Props) {
  const [openDetail, setOpenDetail] = useState(false);
  const selected = OPTIONS.find((o) => o.value === state.coffeeBreak);

  if (openDetail && selected) {
    return (
      <div>
        <button
          onClick={() => setOpenDetail(false)}
          className="text-sm text-[#1B2A41] mb-4 flex items-center gap-1.5 font-medium"
        >
          ← Trocar opção
        </button>
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">
          CARDÁPIO SELECIONADO
        </div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-2">{selected.label}</h1>
        <p className="text-gray-500 text-sm mb-5 italic">{selected.hint}</p>

        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2">Bebidas</h3>
            <p className="text-sm text-[#1B2A41] leading-relaxed">{selected.bebidas}</p>
          </div>
          <div className="border-t border-gray-100" />
          <div>
            <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2">Salgados</h3>
            <p className="text-sm text-[#1B2A41] leading-relaxed">{selected.salgados}</p>
          </div>
          <div className="border-t border-gray-100" />
          <div>
            <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2">Doces</h3>
            <p className="text-sm text-[#1B2A41] leading-relaxed">{selected.doces}</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
            Quer alterar ou trocar algum item? <span className="font-normal text-gray-500">(opcional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Ex: trocar suco de polpa por suco natural; adicionar tapioca recheada; remover achocolatado."
            value={state.coffeeBreakObs}
            onChange={(e) => onChange({ coffeeBreakObs: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CARDÁPIO</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Qual estilo de Coffee Break?</h1>
      <p className="text-gray-500 text-sm mb-5">
        Opções pensadas para reuniões, treinamentos, cursos, recepções e momentos de pausa.
      </p>
      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => {
              onChange({ coffeeBreak: o.value });
              setOpenDetail(true);
            }}
            className={`text-left rounded-xl border-2 px-4 py-4 transition-all active:scale-[0.98] ${
              state.coffeeBreak === o.value
                ? "border-[#C9A24B] bg-[#FBF7EE] shadow-sm"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-base font-semibold text-[#1B2A41] mb-1">{o.label}</div>
                <div className="text-sm text-gray-500 leading-snug">{o.hint}</div>
              </div>
              <span className="text-[#C9A24B] text-xs font-bold mt-1 whitespace-nowrap">Ver →</span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <button
          onClick={() => setOpenDetail(true)}
          className="mt-4 w-full py-3 text-sm font-semibold text-[#1B2A41] underline"
        >
          Ver cardápio completo do {selected.label}
        </button>
      )}
    </div>
  );
}
