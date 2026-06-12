"use client";
import { FormState } from "@/lib/types";
import { TACHO_OPTIONS } from "@/lib/menu";

interface Props {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}

function labelOf(value: string): string {
  return TACHO_OPTIONS.find((o) => o.value === value)?.label || value;
}

// Quando há 2 tachos, o cliente distribui os convidados entre eles. Os campos são
// vinculados: alterar um ajusta o outro para manter a soma igual ao total.
export default function TachoDistribuicao({ state, onChange }: Props) {
  const total = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
  if (state.tacho.length !== 2 || total <= 0) return null;

  const [t1, t2] = state.tacho;
  const p1 = Number(state.tachoPessoas[t1]) || 0;
  const p2 = Number(state.tachoPessoas[t2]) || 0;
  const soma = p1 + p2;
  const okSum = soma === total;

  const setQtd = (alvo: string, raw: string) => {
    const num = Math.max(0, Math.min(total, Number(raw.replace(/\D/g, "")) || 0));
    const outro = alvo === t1 ? t2 : t1;
    onChange({
      tachoPessoas: {
        ...state.tachoPessoas,
        [alvo]: String(num),
        [outro]: String(total - num),
      },
    });
  };

  return (
    <div
      className="bg-white rounded-xl border-2 border-[#C9A24B]/40 p-4 space-y-3"
      role="group"
      aria-labelledby="tacho-dist-title"
    >
      <div>
        <p id="tacho-dist-title" className="text-sm font-semibold text-[#1B2A41]">
          Quantos convidados vão comer de cada tacho?
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Total: <strong>{total}</strong> convidados. Ao mudar um valor, o outro se ajusta automaticamente.
        </p>
      </div>

      {[t1, t2].map((v) => (
        <div key={v}>
          <label htmlFor={`tacho-pes-${v}`} className="block text-xs font-medium text-[#1B2A41] mb-1 leading-snug">
            {labelOf(v)}
          </label>
          <input
            id={`tacho-pes-${v}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={total}
            value={state.tachoPessoas[v] ?? ""}
            onChange={(e) => setQtd(v, e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
          />
        </div>
      ))}

      {!okSum && (
        <p className="text-xs text-red-500" role="alert">
          A soma ({soma}) precisa ser igual a {total}.
        </p>
      )}
    </div>
  );
}
