"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

const CURSOS = [
  { value: "4 cursos", label: "4 Cursos", desc: "Entrada · Intermediário · Principal · Sobremesa" },
  { value: "6 cursos", label: "6 Cursos", desc: "Amuse-bouche · Entrada · Pré-prato · Principal · Pré-sobremesa · Sobremesa" },
  { value: "8 cursos (Grand Menu)", label: "Grand Menu — 8 Cursos", desc: "Experiência degustação completa: aperitivo, 2 entradas, pré-prato, principal, queijos, pré-sobremesa e sobremesa" },
];

const VINHOS = [
  { value: "Vinhos nacionais", label: "Vinhos Nacionais", desc: "Rótulos brasileiros selecionados para cada etapa" },
  { value: "Vinhos importados", label: "Vinhos Importados", desc: "Rótulos internacionais (França, Itália, Argentina, Chile)" },
  { value: "Misto", label: "Harmonização Mista", desc: "Combinação de vinhos nacionais e importados conforme o curso" },
];

export default function HarmonizadoStep({ state, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">JANTAR HARMONIZADO</div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Menu Degustação</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">
          O Jantar Harmonizado é uma experiência sensorial completa: cada curso do menu é pensado para complementar
          a harmonização de vinhos — do aperitivo à sobremesa. O cardápio é criado pela Aurum conforme o perfil
          do evento e confirmado após contato.
        </p>
      </div>

      {/* Número de cursos */}
      <div>
        <p className="text-sm font-semibold text-[#1B2A41] mb-3">Quantos cursos você imagina?</p>
        <div className="space-y-2">
          {CURSOS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ harmonizadoCursos: c.value })}
              className={`w-full text-left border-2 rounded-xl px-4 py-3 transition-all ${
                state.harmonizadoCursos === c.value
                  ? "border-[#C9A24B] bg-[#FBF7EE]"
                  : "border-gray-200 bg-white hover:border-[#C9A24B]/50"
              }`}
            >
              <p className="font-semibold text-[#1B2A41] text-sm">{c.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Perfil de vinhos */}
      <div>
        <p className="text-sm font-semibold text-[#1B2A41] mb-3">Perfil de harmonização de vinhos:</p>
        <div className="space-y-2">
          {VINHOS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => onChange({ harmonizadoVinhos: v.value })}
              className={`w-full text-left border-2 rounded-xl px-4 py-3 transition-all ${
                state.harmonizadoVinhos === v.value
                  ? "border-[#C9A24B] bg-[#FBF7EE]"
                  : "border-gray-200 bg-white hover:border-[#C9A24B]/50"
              }`}
            >
              <p className="font-semibold text-[#1B2A41] text-sm">{v.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
          Observações ou preferências
        </label>
        <textarea
          rows={3}
          placeholder="Ex: restrições alimentares, ingredientes que evitar, clima do evento…"
          value={state.harmonizadoObs}
          onChange={e => onChange({ harmonizadoObs: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
        />
      </div>

      {/* Aviso sob consulta */}
      <div className="bg-[#1B2A41] rounded-xl px-4 py-3 text-sm text-white leading-relaxed">
        <strong className="text-[#C9A24B]">Sob consulta.</strong>{" "}
        O cardápio completo e a proposta de valor são definidos pela Aurum após o primeiro contato —
        as suas preferências acima orientam a criação.
      </div>
    </div>
  );
}
