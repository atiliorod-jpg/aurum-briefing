"use client";
import { FormState } from "@/lib/types";
import OptionCard from "@/components/ui/OptionCard";
import EstimativaCard from "@/components/ui/EstimativaCard";
import { BEBIDAS_ITEMS } from "@/lib/menu";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
  mostrarBebidas: boolean;
}

const COZINHA_OPTS = [
  { value: "Sim, completa", label: "Sim, cozinha completa", desc: "Fogão/cooktop, forno, geladeira, pia e bancadas prontos para uso." },
  { value: "Parcial", label: "Parcialmente equipada", desc: "Tem alguns itens, mas faltam equipamentos — descreva abaixo." },
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

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold text-[#1B2A41] mb-2.5">{titulo}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}

export default function EstruturaStep({ state, onChange, mostrarBebidas }: Props) {
  const toggleBebidaItem = (value: string) => {
    const atual = state.bebidasItens ?? [];
    const next = atual.includes(value)
      ? atual.filter((v) => v !== value)
      : [...atual, value];
    onChange({ bebidasItens: next });
  };

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
        {state.cozinha === "Parcial" && (
          <textarea
            placeholder="Descreva o que tem disponível (ex.: bancada, geladeira, fogão 4 bocas…)"
            value={state.cozinhaDesc ?? ""}
            onChange={(e) => onChange({ cozinhaDesc: e.target.value })}
            rows={2}
            className="w-full border-2 border-[#C9A24B]/50 rounded-xl px-4 py-3 text-sm text-[#1B2A41] bg-white resize-none focus:outline-none focus:border-[#C9A24B]"
          />
        )}
        {(state.cozinha === "Não tem") && (
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
              selected={state.bebidas === o.value}
              onClick={() => onChange({ bebidas: o.value, bebidasItens: [] })} />
          ))}

          {state.bebidas === "Incluir Aurum" && (
            <div className="mt-1 space-y-2">
              <p className="text-xs font-semibold text-[#1B2A41]">Selecione o que deseja incluir:</p>
              <div className="flex flex-wrap gap-2">
                {BEBIDAS_ITEMS.map((item) => {
                  const sel = (state.bebidasItens ?? []).includes(item.value);
                  return (
                    <button key={item.value} type="button"
                      onClick={() => toggleBebidaItem(item.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all active:scale-[0.97] ${
                        sel
                          ? "border-[#C9A24B] bg-[#FBF7EE] text-[#1B2A41]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#C9A24B]/50"
                      }`}>
                      {sel && <span className="text-[#C9A24B]">✓</span>}
                      <span>{item.label}</span>
                      <span className="text-xs text-gray-400">R$ {item.preco}/p</span>
                    </button>
                  );
                })}
              </div>
              {(state.bebidasItens ?? []).length > 0 && (
                <p className="text-xs text-gray-500">
                  Selecionado: {(state.bebidasItens ?? [])
                    .map((v) => BEBIDAS_ITEMS.find((b) => b.value === v)?.label)
                    .filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          )}
        </Bloco>
      )}

      <EstimativaCard state={state} />
    </div>
  );
}
