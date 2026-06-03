"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

function labelHomenageado(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "Nome do aniversariante";
    case "Casamento": return "Nomes dos noivos";
    case "Confraternização / Corporativo": return "Nome da empresa ou anfitrião";
    case "Almoço ou Jantar Privado": return "Nome do anfitrião";
    default: return "Nome do anfitrião / homenageado";
  }
}

function placeholderHomenageado(tipo: string | null): string {
  switch (tipo) {
    case "Aniversário": return "Ex: Maria Helena";
    case "Casamento": return "Ex: Ana e Pedro";
    case "Confraternização / Corporativo": return "Ex: Construtora Silva";
    default: return "Ex: Família Ribeiro";
  }
}

export default function CartaStep({ state, onChange }: Props) {
  const field = (label: string, key: keyof FormState, placeholder: string) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={state[key] as string}
        onChange={(e) => onChange({ [key]: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
      />
    </div>
  );

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CARTA-CONVITE</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Deixe o convite 100% pronto.</h1>
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">
        Estes três dados deixam a carta-convite finalizada — e você recebe o
        <strong className="text-[#1B2A41]"> convite pronto em PDF</strong> para enviar aos convidados.
        Se preferir preencher depois, <strong>pule este passo</strong> e baixe a carta em Word para editar à mão.
      </p>

      {field(labelHomenageado(state.tipo), "cartaHomenageado", placeholderHomenageado(state.tipo))}
      {field("Data limite para confirmação (RSVP)", "cartaDataLimite", "Ex: 10 de junho")}
      {field("Quem assina o convite?", "cartaAssinatura", "Ex: Família Ribeiro / Os noivos")}

      <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-4 text-xs text-gray-600 leading-relaxed mt-1">
        💡 Estes campos preenchem os espaços que ficariam em branco na carta
        (nome do homenageado, prazo de confirmação e assinatura).
      </div>
    </div>
  );
}
