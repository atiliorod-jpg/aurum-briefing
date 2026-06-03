"use client";
import { FormState } from "@/lib/types";
import { formatPhone } from "@/lib/utils";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function ContatoStep({ state, onChange }: Props) {
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CONTATO</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Seu contato.</h1>
      <p className="text-gray-500 text-sm mb-5">Para enviarmos a proposta.</p>
      {[
        { label: "Nome", req: true, key: "nome", type: "text", placeholder: "Seu nome" },
        { label: "WhatsApp", req: true, key: "whatsapp", type: "tel", placeholder: "(81)99818-4489" },
        { label: "E-mail", req: false, key: "email", type: "email", placeholder: "seu@email.com" },
      ].map(({ label, req, key, type, placeholder }) => (
        <div key={key} className="mb-4">
          <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
            {label} {req ? <span className="text-[#C9A24B]">• obrigatório</span> : <span className="font-normal text-gray-400">(opcional)</span>}
          </label>
          <input type={type} placeholder={placeholder} inputMode={key === "whatsapp" ? "numeric" : undefined}
            value={state[key as keyof FormState] as string}
            onChange={e => onChange({ [key]: key === "whatsapp" ? formatPhone(e.target.value) : e.target.value })}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]" />
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B2A41] mb-0.5">
          Para quando você precisa da proposta? <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <p className="text-xs text-gray-400 mb-1.5">
          Data limite para você receber nosso orçamento{state.data ? " — não pode passar da data do evento" : ""}.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Até dia</span>
          <input
            type="date"
            value={state.prazo}
            max={state.data || undefined}
            onChange={e => {
              const v = e.target.value;
              // Não permite prazo superior à data do evento
              onChange({ prazo: state.data && v > state.data ? state.data : v });
            }}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
          />
        </div>
        {!state.data && (
          <p className="text-xs text-[#C9A24B] mt-1.5">Defina a data do evento (passo “Data e horário”) para limitar este prazo.</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Observações <span className="font-normal text-gray-400">(opcional)</span></label>
        <textarea rows={3} placeholder="Referências, fotos do local, ideias..."
          value={state.obs} onChange={e => onChange({ obs: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
      </div>
    </div>
  );
}
