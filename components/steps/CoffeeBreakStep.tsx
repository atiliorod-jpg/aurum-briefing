"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

interface CoffeeOption {
  value: string;
  label: string;
  hint: string;
  bebidas: string;
  salgados: string;
  doces: string;
}

const OPTIONS: CoffeeOption[] = [
  {
    value: "Coffee Break Simples",
    label: "Coffee Break Simples",
    hint: "Ideal para reuniões rápidas, treinamentos curtos e momentos de pausa com uma seleção prática, leve e bem apresentada.",
    bebidas: "Café filtrado; leite quente; água mineral; suco de polpa selecionada — 1 opção.",
    salgados: "Mini sanduíche natural de frango ou queijo; mini pão de queijo; torta salgada; torradinhas com patês; cuscuz nordestino recheado.",
    doces: "Bolos caseiros; mungunzá; salada de frutas.",
  },
  {
    value: "Coffee Break Tradicional",
    label: "Coffee Break Tradicional",
    hint: "Indicado para eventos corporativos, cursos, palestras, treinamentos e recepções que pedem maior variedade de itens doces, salgados e bebidas.",
    bebidas: "Café filtrado; leite quente; chá; água mineral; suco de polpa selecionada — 2 opções; achocolatado.",
    salgados: "Mini croissant; croque monsieur; pão de queijo; quiche; torta salgada; pães com ovos mexidos à francesa; cuscuz nordestino recheado.",
    doces: "Bolos caseiros; petit four; mungunzá; waffles; frutas ou salada de frutas.",
  },
  {
    value: "Coffee Break Premium",
    label: "Coffee Break Premium",
    hint: "Pensado para eventos mais sofisticados, recepções especiais e experiências personalizadas, com itens artesanais, regionais e apresentação refinada.",
    bebidas: "Café arábico filtrado; leite quente com opção zero lactose; chocolate quente; chás variados; água mineral com e sem gás; sucos naturais variados — 2 opções; água aromatizada com frutas e ervas.",
    salgados: "Mini croissant; mini sanduíche artesanal; quiches a escolha — Lorraine, gorgonzola, tomate seco ou alho-poró; pão de queijo; torradinhas com patês; cuscuz recheado; beiju recheado com queijo; croque monsieur; pães francês, integral e brioche com ovos mexidos à francesa.",
    doces: "Bolos caseiros; waffles; tortas; frutas selecionadas ou salada de frutas; petit four; bolo de rolo; mungunzá.",
  },
];

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
            Quer alterar ou trocar algum item? <span className="font-normal text-gray-400">(opcional)</span>
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
