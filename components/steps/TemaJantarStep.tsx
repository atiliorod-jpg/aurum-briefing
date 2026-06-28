"use client";
import { FormState } from "@/lib/types";
import { TEMAS_JANTAR } from "@/lib/menu";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function TemaJantarStep({ state, onChange }: Props) {
  const temaSelecionado = TEMAS_JANTAR.find((t) => t.value === state.temaJantar);

  const togglePrato = (prato: string) => {
    const atual = state.temaJantarProbs;
    const next = atual.includes(prato) ? atual.filter((p) => p !== prato) : [...atual, prato];
    onChange({ temaJantarProbs: next });
  };

  const selecionarTema = (value: string) => {
    onChange({ temaJantar: value, temaJantarProbs: [] });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">JANTAR TEMÁTICO</div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Escolha a culinária.</h1>
        <p className="text-gray-500 text-sm mb-4">
          Qual é o tema do jantar? Selecione a culinária e marque os pratos clássicos que te interessam —
          a Aurum monta o cardápio completo a partir das suas preferências.
        </p>
      </div>

      {/* Seleção de culinária */}
      <div className="grid grid-cols-3 gap-2">
        {TEMAS_JANTAR.map((tema) => (
          <button
            key={tema.value}
            type="button"
            onClick={() => selecionarTema(tema.value)}
            className={`flex flex-col items-center justify-center border-2 rounded-xl px-2 py-3 transition-all text-center ${
              state.temaJantar === tema.value
                ? "border-[#C9A24B] bg-[#FBF7EE]"
                : "border-gray-200 bg-white hover:border-[#C9A24B]/50"
            }`}
          >
            <span className="text-2xl mb-1">{tema.bandeira}</span>
            <span className="text-xs font-semibold text-[#1B2A41] leading-tight">{tema.label.replace("Culinária ", "")}</span>
          </button>
        ))}
      </div>

      {/* Pratos clássicos do tema selecionado */}
      {temaSelecionado && (() => {
        const renderPrato = (prato: string) => {
          const sel = state.temaJantarProbs.includes(prato);
          return (
            <button
              key={prato}
              type="button"
              onClick={() => togglePrato(prato)}
              className={`w-full text-left flex items-center gap-3 border-2 rounded-xl px-4 py-2.5 transition-all ${
                sel ? "border-[#C9A24B] bg-[#FBF7EE]" : "border-gray-200 bg-white hover:border-[#C9A24B]/40"
              }`}
            >
              <span className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center text-xs transition-colors ${
                sel ? "border-[#C9A24B] bg-[#C9A24B] text-white" : "border-gray-300"
              }`}>
                {sel && "✓"}
              </span>
              <span className="text-sm text-[#1B2A41]">{prato}</span>
            </button>
          );
        };

        return (
          <div>
            <p className="text-sm font-semibold text-[#1B2A41] mb-1">
              Pratos clássicos da <strong>{temaSelecionado.label}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-3">Marque os que te interessam (opcional — dá para deixar tudo com o chef).</p>

            {temaSelecionado.grupos ? (
              <div className="space-y-5">
                {temaSelecionado.grupos.map((grupo) => (
                  <div key={grupo.titulo}>
                    <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2">{grupo.titulo}</h3>
                    <div className="space-y-2">{grupo.itens.map(renderPrato)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">{temaSelecionado.classicos.map(renderPrato)}</div>
            )}
          </div>
        );
      })()}

      {/* Campos livres */}
      <div>
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
          Tem algum prato que não pode faltar?
        </label>
        <textarea
          rows={2}
          placeholder="Ex: risotto, paella, tempura…"
          value={state.temaJantarNaoPodeFaltar}
          onChange={e => onChange({ temaJantarNaoPodeFaltar: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
          Algum prato para evitar ou substituir?
        </label>
        <textarea
          rows={2}
          placeholder="Ex: sem frutos do mar, sem glúten, sem pimenta forte…"
          value={state.temaJantarEvitar}
          onChange={e => onChange({ temaJantarEvitar: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
        />
      </div>

      {/* Aviso */}
      <div className="bg-[#1B2A41] rounded-xl px-4 py-3 text-sm text-white leading-relaxed">
        <strong className="text-[#C9A24B]">Sob consulta.</strong>{" "}
        Cardápio final e proposta de valor definidos pela Aurum após contato —
        suas preferências acima orientam a criação do menu temático.
      </div>
    </div>
  );
}
