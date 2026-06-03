"use client";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function ContatoStep({ state, onChange }: Props) {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Seu contato.</h1>
      <p className="text-gray-500 text-sm mb-5">Para enviarmos a proposta.</p>
      {[
        { label: "Nome", key: "nome", type: "text", placeholder: "Seu nome", required: true },
        { label: "WhatsApp", key: "whatsapp", type: "tel", placeholder: "(81) 9 ____-____", required: true },
        { label: "E-mail (opcional)", key: "email", type: "email", placeholder: "seu@email.com", required: false },
        { label: "Quando precisa da proposta?", key: "prazo", type: "text", placeholder: "Ex: até dia 10/06", required: false },
      ].map(({ label, key, type, placeholder }) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">{label}</label>
          <input type={type} placeholder={placeholder}
            value={state[key as keyof FormState] as string}
            onChange={e => onChange({ [key]: e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      ))}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Observações</label>
        <textarea rows={3} placeholder="Referências, fotos do local, ideias... (opcional)"
          value={state.obs} onChange={e => onChange({ obs: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
      </div>
    </div>
  );
}
