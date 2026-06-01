"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";
import { buildWhatsAppMessage, formatDate } from "@/lib/utils";

interface Props { state: FormState; onRestart: () => void; }

export default function ResumoStep({ state, onRestart }: Props) {
  const [copied, setCopied] = useState(false);

  const handleWhatsApp = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5581998184489";
    const text = encodeURIComponent(buildWhatsAppMessage(state));
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  };

  const handleCopy = async () => {
    const text = buildWhatsAppMessage(state);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFeijoada = state.tipo === "Evento de Feijoada";

  const rows: Array<{ label: string; value: string }> = [
    { label: "Tipo", value: state.tipo === "Outro" ? state.tipoOutro : state.tipo || "" },
    { label: "Data", value: `${formatDate(state.data)}${state.horaInicio ? " • " + state.horaInicio : ""}` },
    { label: "Local", value: state.endereco },
    { label: "Convidados", value: `${state.adultos} adultos${state.criancas ? " + " + state.criancas + " crianças" : ""}` },
    ...(isFeijoada
      ? [{ label: "Feijoada", value: state.feijoada || "" }]
      : [
          { label: "Estilo", value: state.estilo.join(", ") },
          { label: "Entradas", value: state.entradas.join(", ") },
          { label: "Principais", value: state.principais.join(", ") },
          ...(state.tacho.length ? [{ label: "Tacho", value: state.tacho.join(", ") }] : []),
          { label: "Sobremesas", value: state.sobremesas.join(", ") },
        ]),
    { label: "Cozinha", value: state.cozinha || "" },
    { label: "Bebidas", value: state.bebidas || "" },
    ...(state.faixa ? [{ label: "Faixa", value: state.faixa }] : []),
    { label: "Contato", value: `${state.nome} • ${state.whatsapp}` },
  ];

  return (
    <div className="text-center">
      <div className="w-18 h-18 rounded-full bg-[#C9A24B] flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ width: 72, height: 72 }}>
        <span className="text-[#1B2A41] text-4xl font-bold">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-[#1B2A41] mb-2">Briefing pronto!</h2>
      <p className="text-gray-500 text-sm mb-6">Confira o resumo e envie pelo WhatsApp.</p>

      <div className="bg-white rounded-2xl p-5 text-left shadow-sm mb-4 max-h-72 overflow-y-auto">
        <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-3">Resumo do evento</h3>
        <div className="space-y-2">
          {rows.map(({ label, value }) => value ? (
            <div key={label} className="text-sm leading-snug">
              <strong className="text-[#1B2A41]">{label}:</strong>{" "}
              <span className="text-gray-500">{value}</span>
            </div>
          ) : null)}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white py-4 rounded-xl font-semibold text-base shadow-md active:scale-[0.98] transition-all">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
          </svg>
          Enviar pelo WhatsApp da Aurum
        </button>
        <button onClick={handleCopy}
          className="border-2 border-[#1B2A41] text-[#1B2A41] py-4 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all">
          {copied ? "✓ Copiado!" : "📋  Copiar resumo"}
        </button>
        <button onClick={onRestart} className="text-gray-400 text-sm underline py-2">Preencher novamente</button>
      </div>
    </div>
  );
}
