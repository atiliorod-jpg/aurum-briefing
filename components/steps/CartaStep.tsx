"use client";
import { FormState } from "@/lib/types";
import { sugestaoRSVP } from "@/lib/utils";
import CartaPreview from "./CartaPreview";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

function dadosHomenageado(tipo: string | null): { label: string; desc: string; placeholder: string } {
  switch (tipo) {
    case "Aniversário":
      return { label: "Quem está fazendo aniversário?", desc: "O nome aparecerá no convite, ex: “o aniversário de Maria Helena”.", placeholder: "Ex: Maria Helena" };
    case "Casamento":
      return { label: "Qual o nome dos noivos?", desc: "Aparecerá no convite, ex: “o casamento de Ana e Pedro”.", placeholder: "Ex: Ana e Pedro" };
    case "Confraternização / Corporativo":
      return { label: "Qual o nome da empresa ou de quem organiza?", desc: "Quem está promovendo o evento. Ex: “a confraternização da Construtora Anfíbio”.", placeholder: "Ex: Construtora Anfíbio" };
    case "Almoço ou Jantar Privado":
      return { label: "Quem está recebendo / promovendo?", desc: "A pessoa ou família anfitriã. Ex: “promovida pela Família Ribeiro”.", placeholder: "Ex: Família Ribeiro" };
    default:
      return { label: "Quem é o anfitrião ou homenageado?", desc: "Nome de quem o evento celebra ou quem está convidando.", placeholder: "Ex: Família Ribeiro" };
  }
}

export default function CartaStep({ state, onChange }: Props) {
  const h = dadosHomenageado(state.tipo);
  const sugestao = sugestaoRSVP(state.data);

  const field = (
    label: string, desc: string, key: keyof FormState, placeholder: string,
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#1B2A41] mb-0.5">{label}</label>
      <p className="text-xs text-gray-400 mb-1.5 leading-snug">{desc}</p>
      <input
        type="text"
        placeholder={placeholder}
        value={state[key] as string}
        onChange={(e) => onChange({ [key]: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
      />
    </div>
  );

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CARTA-CONVITE</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Deixe o convite pronto para enviar.</h1>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">
        Responda abaixo e veja a carta montando-se na hora. Preenchendo tudo, você recebe o
        <strong className="text-[#1B2A41]"> convite pronto em PDF</strong> ao final. Se preferir,
        <strong> pule este passo</strong> e receba a versão em Word para completar depois.
      </p>

      {/* Desktop: formulário à esquerda, prévia à direita. Celular: empilhado. */}
      <div className="flex flex-col lg:flex-row lg:gap-6">
        <div className="lg:flex-1">
          {field(h.label, h.desc, "cartaHomenageado", h.placeholder)}

          {/* Data limite (RSVP) com sugestão automática (50% do tempo até o evento) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1B2A41] mb-0.5">Até quando confirmar presença?</label>
            <p className="text-xs text-gray-400 mb-1.5">Prazo para os convidados avisarem se vão. Aparece no final do convite.</p>
            <input
              type="text"
              placeholder={sugestao ? `Ex: ${sugestao}` : "Ex: 10 de junho"}
              value={state.cartaDataLimite}
              onChange={(e) => onChange({ cartaDataLimite: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
            />
            {sugestao && state.cartaDataLimite.trim() !== sugestao && (
              <button
                type="button"
                onClick={() => onChange({ cartaDataLimite: sugestao })}
                className="mt-2 text-xs font-medium text-[#1B2A41] border border-[#C9A24B]/50 rounded-full px-3 py-1.5 active:scale-[0.97] transition-all"
              >
                💡 Usar sugestão: até {sugestao}
              </button>
            )}
          </div>

          {field(
            "Como o convite será assinado?",
            "Nome de quem está convidando, no fecho do convite (“Com carinho, …”).",
            "cartaAssinatura",
            "Ex: Família Ribeiro / Os noivos",
          )}
        </div>

        <div className="lg:flex-1 lg:sticky lg:top-24 lg:self-start mt-2 lg:mt-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">📄 Prévia da carta</p>
          <CartaPreview state={state} />
          <p className="text-[11px] text-gray-400 italic mt-2 text-center">
            Os trechos em <span className="text-[#C9A24B] font-semibold">dourado</span> ainda
            estão em branco. Preencha para completá-los.
          </p>
        </div>
      </div>
    </div>
  );
}
