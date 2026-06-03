"use client";
import { FormState } from "@/lib/types";
import { formatPhone, isPhoneComplete, isEmailValid } from "@/lib/utils";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function ContatoStep({ state, onChange }: Props) {
  const whatsErro = state.whatsapp.trim() !== "" && !isPhoneComplete(state.whatsapp);
  const emailErro = state.email.trim() !== "" && !isEmailValid(state.email);
  const hoje = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD no fuso local
  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">CONTATO</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Seu contato.</h1>
      <p className="text-gray-500 text-sm mb-5">Para enviarmos a proposta.</p>
      {[
        { label: "Nome", req: true, key: "nome", type: "text", placeholder: "Seu nome" },
        { label: "WhatsApp", req: true, key: "whatsapp", type: "tel", placeholder: "(81)99818-4489" },
        { label: "E-mail", req: false, key: "email", type: "email", placeholder: "seu@email.com" },
      ].map(({ label, req, key, type, placeholder }) => {
        const erro = (key === "whatsapp" && whatsErro) || (key === "email" && emailErro);
        return (
        <div key={key} className="mb-4">
          <label htmlFor={`ct-${key}`} className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
            {label} {req ? <span className="text-[#9A7B2E]">• obrigatório</span> : <span className="font-normal text-gray-400">(opcional)</span>}
          </label>
          <input id={`ct-${key}`} type={type} placeholder={placeholder} inputMode={key === "whatsapp" ? "numeric" : undefined}
            value={state[key as keyof FormState] as string}
            onChange={e => onChange({ [key]: key === "whatsapp" ? formatPhone(e.target.value) : e.target.value })}
            className={`w-full border-2 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none ${erro ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#C9A24B]"}`} />
          {key === "whatsapp" && whatsErro && <p className="text-xs text-red-500 mt-1">Número incompleto — inclua o DDD e todos os dígitos.</p>}
          {key === "email" && emailErro && <p className="text-xs text-red-500 mt-1">E-mail inválido — confira o endereço.</p>}
        </div>
        );
      })}

      <div className="mb-4">
        <label htmlFor="ct-prazo" className="block text-sm font-semibold text-[#1B2A41] mb-0.5">
          Para quando você precisa da proposta? <span className="font-normal text-gray-400">(opcional)</span>
        </label>
        <p className="text-xs text-gray-400 mb-1.5">
          Data limite para você receber nosso orçamento — não pode ser no passado{state.data ? " nem após a data do evento" : ""}.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Até dia</span>
          <input
            id="ct-prazo"
            type="date"
            value={state.prazo}
            min={hoje}
            max={state.data || undefined}
            onChange={e => {
              let v = e.target.value;
              if (v && v < hoje) v = hoje;                       // não permite passado
              if (v && state.data && v > state.data) v = state.data; // não permite após o evento
              onChange({ prazo: v });
            }}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
          />
        </div>
        {!state.data && (
          <p className="text-xs text-[#C9A24B] mt-1.5">Defina a data do evento (passo “Data e horário”) para limitar este prazo.</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="ct-obs" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Observações <span className="font-normal text-gray-400">(opcional)</span></label>
        <textarea id="ct-obs" rows={3} placeholder="Referências, fotos do local, ideias..."
          value={state.obs} onChange={e => onChange({ obs: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none" />
      </div>
    </div>
  );
}
