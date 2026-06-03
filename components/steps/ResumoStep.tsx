"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";
import { buildWhatsAppMessage, formatDate } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import { resolveInvitation } from "@/lib/invitation";
import { StepName } from "@/lib/types";

// Geradores pesados (jspdf/jszip/docx) carregados sob demanda, só ao clicar em baixar.
const loadBriefingPDF = () => import("@/lib/pdf").then(m => m.generateBriefingPDF);
const loadLetterDOCX = () => import("@/lib/letter").then(m => m.generateLetterDOCX);
const loadInvitationPDF = () => import("@/lib/invitation-pdf").then(m => m.generateInvitationPDF);

interface Props { state: FormState; onRestart: () => void; onEdit?: (step: StepName) => void; }

export default function ResumoStep({ state, onRestart, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const fileBase = () => {
    const safe = (state.nome || "cliente").trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");
    const date = state.data ? state.data.replace(/-/g, "") : new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${safe}_${date}`;
  };

  const handleWhatsApp = () => {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5581998184489";
    const text = encodeURIComponent(buildWhatsAppMessage(state));
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  };

  const handleCopy = async () => {
    const text = buildWhatsAppMessage(state);
    if (navigator.clipboard) await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      setBusy("pdf");
      const generateBriefingPDF = await loadBriefingPDF();
      const blob = await generateBriefingPDF(state);
      downloadBlob(blob, `Briefing_Aurum_${fileBase()}.pdf`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar o PDF." });
    } finally { setBusy(null); }
  };

  const handleDownloadLetter = async () => {
    try {
      setBusy("docx");
      const generateLetterDOCX = await loadLetterDOCX();
      const blob = await generateLetterDOCX(state);
      downloadBlob(blob, `Carta_Aurum_${fileBase()}.docx`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar a carta em Word." });
    } finally { setBusy(null); }
  };

  const handleInvitationPDF = async () => {
    try {
      setBusy("convitepdf");
      const generateInvitationPDF = await loadInvitationPDF();
      const blob = await generateInvitationPDF(state);
      downloadBlob(blob, `Convite_Aurum_${fileBase()}.pdf`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar o convite em PDF. Tente a versão em Word." });
    } finally { setBusy(null); }
  };

  const cartaCompleta = resolveInvitation(state).completa;

  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

  const cardapioRows: Array<{ label: string; value: string }> = [
    { label: "Estilo", value: state.estilo.join(", ") },
    ...(state.entradas.length ? [{ label: "Entradas", value: state.entradas.join(", ") }] : []),
    ...(state.sugestaoEntradas ? [{ label: "Sugestão entrada", value: state.sugestaoEntradas }] : []),
    ...(state.principais.length ? [{ label: "Principais", value: state.principais.join(", ") }] : []),
    ...(state.sugestaoPrincipais ? [{ label: "Sugestão principal", value: state.sugestaoPrincipais }] : []),
    ...(state.tacho.length ? [{ label: "Tacho", value: state.tacho.join(", ") }] : []),
    ...(state.feijoada ? [{ label: "Feijoada", value: state.feijoada }] : []),
    ...(state.coffeeBreak ? [{ label: "Coffee Break", value: state.coffeeBreak }] : []),
    ...(state.sobremesas.length ? [{ label: "Sobremesas", value: state.sobremesas.join(", ") }] : []),
    ...(state.sugestaoSobremesas ? [{ label: "Sugestão sobremesa", value: state.sugestaoSobremesas }] : []),
    ...(state.cardapioPerfil.length ? [{ label: "Cardápio sob medida", value: state.cardapioPerfil.join(", ") }] : []),
  ];

  const rows: Array<{ label: string; value: string }> = [
    { label: "Tipo", value: state.tipo === "Outro" ? state.tipoOutro : state.tipo || "" },
    { label: "Data", value: `${formatDate(state.data)}${state.horaInicio ? " • " + state.horaInicio : ""}` },
    { label: "Local", value: state.endereco },
    { label: "Convidados", value: `${state.adultos} adultos${state.criancas ? " + " + state.criancas + " crianças" : ""}` },
    ...cardapioRows,
    { label: "Cozinha", value: state.cozinha || "" },
    ...(isCoffeeOnly ? [] : [{ label: "Bebidas", value: state.bebidas || "" }]),
    ...(state.faixa ? [{ label: "Faixa", value: state.faixa }] : []),
    { label: "Contato", value: `${state.nome} • ${state.whatsapp}${state.email ? " • " + state.email : ""}` },
  ];

  return (
    <div className="text-center">
      <div className="rounded-full bg-[#C9A24B] flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ width: 72, height: 72 }}>
        <span className="text-[#1B2A41] text-4xl font-bold">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-[#1B2A41] mb-2">Briefing pronto!</h2>
      <p className="text-gray-500 text-sm mb-4">
        Confira o resumo abaixo e <strong className="text-[#1B2A41]">envie para a nossa equipe</strong> pelo
        WhatsApp (ou copie e nos mande). Assim retornamos com a sua proposta.
      </p>

      <div className="bg-white rounded-2xl p-5 text-left shadow-sm mb-3 max-h-72 overflow-y-auto">
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

      {onEdit && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Precisa corrigir algo? Toque para editar sem recomeçar:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {([
              ["Evento", "tipo"],
              ["Data e local", "quando"],
              ["Convidados", "convidados"],
              ["Cardápio", "estilo"],
              ["Estrutura", "estrutura"],
              ["Contato", "contato"],
              ["Carta-convite", "carta"],
            ] as [string, StepName][]).map(([label, step]) => (
              <button
                key={step}
                onClick={() => onEdit(step)}
                className="text-xs font-medium text-[#1B2A41] border border-gray-200 rounded-full px-3 py-1.5 active:scale-[0.97] transition-all hover:border-[#C9A24B]"
              >
                ✏️ {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <div className={`text-sm rounded-xl px-4 py-3 mb-3 text-left ${
          feedback.kind === "ok" ? "bg-[#FBF7EE] text-[#1B2A41] border border-[#C9A24B]" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {feedback.msg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={handleWhatsApp} disabled={!!busy}
          className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white py-4 rounded-xl font-semibold text-base shadow-md active:scale-[0.98] transition-all disabled:opacity-50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
          </svg>
          Enviar pelo WhatsApp
        </button>

        <button onClick={handleDownloadPDF} disabled={!!busy}
          className="border-2 border-[#1B2A41] text-[#1B2A41] py-3.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50 mt-1">
          {busy === "pdf" ? "Gerando…" : "📄  Baixar briefing em PDF"}
        </button>

        {/* ── Convite para os convidados ── */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-left">
          <p className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2">🎁 Convite para os convidados</p>
          {cartaCompleta ? (
            <>
              <button onClick={handleInvitationPDF} disabled={!!busy}
                className="w-full bg-[#C9A24B] text-[#1B2A41] py-4 rounded-xl font-semibold text-base shadow-md active:scale-[0.98] transition-all disabled:opacity-50">
                {busy === "convitepdf" ? "Gerando convite…" : "✨  Baixar convite pronto (PDF)"}
              </button>
              <button onClick={handleDownloadLetter} disabled={!!busy}
                className="w-full mt-2 border-2 border-[#C9A24B] text-[#1B2A41] py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50">
                {busy === "docx" ? "Gerando…" : "📝  Ou baixar em Word (editável)"}
              </button>
              <p className="text-xs text-gray-400 italic mt-2">
                Carta completa com os dados que você preencheu — pronta para enviar aos convidados.
              </p>
            </>
          ) : (
            <>
              <button onClick={handleDownloadLetter} disabled={!!busy}
                className="w-full border-2 border-[#C9A24B] text-[#1B2A41] py-3.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50">
                {busy === "docx" ? "Gerando…" : "📝  Baixar carta-convite (Word)"}
              </button>
              <p className="text-xs text-gray-400 italic mt-2">
                Carta editável — alguns campos ficarão em branco para você preencher.
                💡 Volte ao passo <strong>“Carta-convite”</strong> e preencha os 3 dados para
                receber o <strong>convite pronto em PDF</strong>.
              </p>
            </>
          )}
        </div>

        <button onClick={handleCopy}
          className="text-gray-500 text-sm py-2 underline mt-1">
          {copied ? "✓ Copiado!" : "Copiar resumo em texto"}
        </button>

        <button onClick={onRestart} className="text-gray-400 text-sm underline py-1">Preencher novamente</button>
      </div>
    </div>
  );
}
