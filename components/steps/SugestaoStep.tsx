"use client";
import { FormState } from "@/lib/types";
import OptionCard from "@/components/ui/OptionCard";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

const PERFIS = [
  { value: "Sofisticado e requintado", desc: "Apresentação elegante, ingredientes nobres." },
  { value: "Regional / nordestino", desc: "Sabores e ingredientes da nossa terra." },
  { value: "Contemporâneo / autoral", desc: "Releituras criativas e modernas." },
  { value: "Aconchegante / comfort food", desc: "Pratos afetivos e generosos." },
  { value: "Internacional", desc: "Influências italianas, francesas, etc." },
  { value: "Foco em frutos do mar", desc: "Peixes, camarões e mariscos em destaque." },
  { value: "Vegetariano / plant-based", desc: "Cardápio sem carnes ou com forte presença vegetal." },
];

export default function SugestaoStep({ state, onChange }: Props) {
  const togglePerfil = (value: string) => {
    const list = state.cardapioPerfil;
    onChange({
      cardapioPerfil: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  };

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CARDÁPIO SOB MEDIDA</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Vamos criar um cardápio só para o seu evento.</h1>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">
        Você escolheu deixar a criação com a Aurum. Em vez de selecionar pratos de uma lista,
        nos conte o <strong className="text-[#1B2A41]">estilo que você imagina</strong> — e o chef monta
        uma proposta exclusiva, pensada do zero para a sua ocasião.
      </p>

      <label className="block text-sm font-semibold text-[#1B2A41] mb-2">
        Qual o clima do cardápio? <span className="font-normal text-gray-500">(pode marcar mais de um)</span>
      </label>
      <div className="flex flex-col gap-2.5 mb-5">
        {PERFIS.map((o) => (
          <OptionCard
            key={o.value}
            label={o.value}
            description={o.desc}
            selected={state.cardapioPerfil.includes(o.value)}
            onClick={() => togglePerfil(o.value)}
            variant="multi"
          />
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B2A41] mb-0.5">O que não pode faltar?</label>
        <p className="text-xs text-gray-500 mb-1.5">Pratos, ingredientes ou referências que você adoraria ver. (opcional)</p>
        <textarea rows={2} placeholder="Ex: um prato com camarão, uma boa carne, doces nordestinos..."
          value={state.cardapioNaoPodeFaltar} onChange={(e) => onChange({ cardapioNaoPodeFaltar: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A41] mb-0.5">Algo que devemos evitar?</label>
        <p className="text-xs text-gray-500 mb-1.5">Ingredientes, sabores ou pratos que você não quer. (opcional)</p>
        <textarea rows={2} placeholder="Ex: evitar frutos do mar, nada muito apimentado..."
          value={state.cardapioEvitar} onChange={(e) => onChange({ cardapioEvitar: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
      </div>
    </div>
  );
}
