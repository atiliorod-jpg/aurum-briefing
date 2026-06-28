"use client";
import { FormState } from "@/lib/types";
import OptionCard from "@/components/ui/OptionCard";
import EstimativaCard from "@/components/ui/EstimativaCard";
import { BEBIDAS_KITS } from "@/lib/menu";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
  mostrarBebidas: boolean;
}

const COZINHA_OPTS = [
  { value: "Sim, completa", label: "Sim, cozinha completa", desc: "Fogão/cooktop, forno, geladeira, pia e bancadas prontos para uso." },
  { value: "Parcial", label: "Parcialmente equipada", desc: "Tem alguns itens (ex.: só bancada e pia), mas faltam equipamentos." },
  { value: "Não tem", label: "Sem cozinha — a Aurum leva tudo", desc: "Levamos fogões, bancadas, refrigeração e apoio. Orçado à parte, conforme o local." },
  { value: "Não sei", label: "Não tenho certeza", desc: "Sem problema — confirmamos juntos antes do evento." },
];

const LOUCAS_OPTS = [
  { value: "Local fornece", label: "O local fornece tudo" },
  { value: "Eu providencio", label: "Vou providenciar" },
  { value: "Incluir Aurum", label: "Incluir na proposta Aurum", desc: "Adicional básico a partir de R$ 10/pessoa (pode variar conforme os pratos)." },
];

const BEBIDAS_OPTS = [
  { value: "Bar do local", label: "Bar do local" },
  { value: "Compra separada", label: "Fico responsável pela compra" },
  { value: "Incluir Aurum", label: "Incluir na proposta Aurum" },
];

// Subtítulo de cada bloco dentro da tela combinada
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold text-[#1B2A41] mb-2.5">{titulo}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

export default function EstruturaStep({ state, onChange, mostrarBebidas }: Props) {
  return (
    <div className="space-y-7">
      <div>
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">ESTRUTURA</div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Estrutura do evento.</h1>
        <p className="text-gray-500 text-sm">Três escolhas rápidas para fecharmos os detalhes operacionais.</p>
      </div>

      <Bloco titulo="O local tem cozinha equipada?">
        {COZINHA_OPTS.map((o) => (
          <OptionCard key={o.value} label={o.label} description={o.desc}
            selected={state.cozinha === o.value} onClick={() => onChange({ cozinha: o.value })} />
        ))}
        {(state.cozinha === "Não tem" || state.cozinha === "Parcial") && (
          <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-3.5 text-xs text-gray-600 leading-relaxed">
            ℹ️ Sem cozinha completa, a estrutura é avaliada caso a caso e entra na proposta final
            (não está na estimativa parcial).
          </div>
        )}
      </Bloco>

      <Bloco titulo="Louças e talheres">
        {LOUCAS_OPTS.map((o) => (
          <OptionCard key={o.value} label={o.label} description={o.desc}
            selected={state.mesas === o.value} onClick={() => onChange({ mesas: o.value })} />
        ))}
      </Bloco>

      {mostrarBebidas && (
        <Bloco titulo="Bebidas">
          {BEBIDAS_OPTS.map((o) => (
            <OptionCard key={o.value} label={o.label}
              selected={state.bebidas === o.value} onClick={() => onChange({ bebidas: o.value, bebidasKit: null })} />
          ))}
          {state.bebidas === "Incluir Aurum" && (
            <div className="mt-1">
              <p className="text-sm font-semibold text-[#1B2A41] mb-2">Escolha o kit de bebidas:</p>
              <div className="space-y-2">
                {BEBIDAS_KITS.map((kit) => (
                  <button key={kit.value} type="button" onClick={() => onChange({ bebidasKit: kit.value })}
                    className={`w-full text-left border-2 rounded-xl px-4 py-3 transition-all ${
                      state.bebidasKit === kit.value
                        ? "border-[#C9A24B] bg-[#FBF7EE]"
                        : "border-gray-200 bg-white hover:border-[#C9A24B]/50"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#1B2A41] text-sm">{kit.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{kit.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-[#C9A24B] ml-3 flex-shrink-0">R$ {kit.preco}/pessoa</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Bloco>
      )}

      <EstimativaCard state={state} />
    </div>
  );
}
