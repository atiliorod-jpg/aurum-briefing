"use client";
import { useState, useEffect } from "react";
import { track } from "@vercel/analytics";
import { FormState } from "@/lib/types";
import { buildWhatsAppMessage, buildWhatsAppLinkText, formatDate } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import { resolveInvitation } from "@/lib/invitation";
import { AURUM_WHATSAPP } from "@/lib/config";
import { BEBIDAS_KITS } from "@/lib/menu";
import { comOverride } from "@/lib/overrides";
import { StepName } from "@/lib/types";
import EstimativaCard from "@/components/ui/EstimativaCard";

// Geradores pesados (jspdf/jszip/docx) carregados sob demanda, só ao clicar em baixar.
const loadBriefingPDF = () => import("@/lib/pdf").then(m => m.generateBriefingPDF);
const loadLetterDOCX = () => import("@/lib/letter").then(m => m.generateLetterDOCX);
const loadInvitationPDF = () => import("@/lib/invitation-pdf").then(m => m.generateInvitationPDF);

interface Props { state: FormState; onRestart: () => void; onEdit?: (step: StepName) => void; }

export default function ResumoStep({ state, onRestart, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  // Conversão: o cliente chegou ao resumo final
  useEffect(() => { track("briefing_concluido"); }, []);

  // Limpa um nome para uso em nome de arquivo (mantém acentos e espaços)
  const limpaNome = (raw: string, fallback: string) => {
    const clean = (raw || "").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
    return clean || fallback;
  };
  // Nome do convite = homenageado (aniversariante/noivos/empresa) ou contato
  const nomeConvite = () => limpaNome(state.cartaHomenageado || state.nome, "Convidados");
  const nomeBriefing = () => limpaNome(state.nome, "Cliente");

  const handleWhatsApp = () => {
    track("enviar_whatsapp");
    // Usa versão compacta automaticamente se a mensagem completa for grande demais p/ o link
    const text = encodeURIComponent(buildWhatsAppLinkText(state));
    window.open(`https://wa.me/${AURUM_WHATSAPP}?text=${text}`, "_blank");
  };

  // Gera o PDF e abre a folha de compartilhamento do celular já com o arquivo
  // anexado — o cliente escolhe WhatsApp → Aurum e só toca em enviar.
  // No desktop (sem suporte a anexo), baixa o PDF e abre o WhatsApp com o texto.
  const handleSharePDF = async () => {
    try {
      setBusy("share");
      const generateBriefingPDF = await loadBriefingPDF();
      const blob = await generateBriefingPDF(state);
      const file = new File([blob], `Briefing Aurum - ${nomeBriefing()}.pdf`, { type: "application/pdf" });

      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Briefing Aurum",
          text: "Segue o meu briefing para a Aurum.",
        });
        track("compartilhar_pdf");
      } else {
        // Fallback (desktop): baixa o arquivo e abre o WhatsApp com o texto
        downloadBlob(blob, file.name);
        handleWhatsApp();
        setFeedback({
          kind: "ok",
          msg: "Seu dispositivo não permite anexar o PDF automaticamente. Baixamos o arquivo e abrimos o WhatsApp — é só anexar o PDF (está na pasta de Downloads) e enviar.",
        });
      }
    } catch (e) {
      // Usuário cancelou a folha de compartilhamento → não é erro
      if ((e as Error)?.name !== "AbortError") {
        console.error(e);
        setFeedback({ kind: "err", msg: "Não foi possível abrir o compartilhamento do PDF." });
      }
    } finally {
      setBusy(null);
    }
  };

  const handleCopy = async () => {
    const text = buildWhatsAppMessage(state);
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        // Fallback para navegadores/contextos sem Clipboard API
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      ok = false;
    }
    if (ok) {
      track("copiar_resumo");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFeedback({ kind: "err", msg: "Não foi possível copiar automaticamente. Selecione o texto manualmente ou use o WhatsApp." });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setBusy("pdf");
      track("baixar_briefing_pdf");
      const generateBriefingPDF = await loadBriefingPDF();
      const blob = await generateBriefingPDF(state);
      downloadBlob(blob, `Briefing Aurum - ${nomeBriefing()}.pdf`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar o PDF." });
    } finally { setBusy(null); }
  };

  const handleDownloadLetter = async () => {
    try {
      setBusy("docx");
      track("baixar_carta_word");
      const generateLetterDOCX = await loadLetterDOCX();
      const blob = await generateLetterDOCX(state);
      downloadBlob(blob, `${nomeConvite()} - Convite.docx`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar a carta em Word." });
    } finally { setBusy(null); }
  };

  const handleInvitationPDF = async () => {
    try {
      setBusy("convitepdf");
      track("baixar_convite_pdf");
      const generateInvitationPDF = await loadInvitationPDF();
      const blob = await generateInvitationPDF(state);
      downloadBlob(blob, `${nomeConvite()} - Convite.pdf`);
    } catch (e) {
      console.error(e);
      setFeedback({ kind: "err", msg: "Não foi possível gerar o convite em PDF. Tente a versão em Word." });
    } finally { setBusy(null); }
  };

  const cartaCompleta = resolveInvitation(state).completa;

  const isCoffeeOnly = state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

  const kitBebidas = state.bebidas === "Incluir Aurum" && state.bebidasKit
    ? BEBIDAS_KITS.find((k) => k.value === state.bebidasKit)
    : undefined;

  const cardapioRows: Array<{ label: string; value: string }> = [
    { label: "Estilo", value: state.estilo.join(", ") },
    ...(state.entradas.length ? [{ label: "Entradas", value: state.entradas.join(", ") }] : []),
    ...(state.sugestaoEntradas ? [{ label: "Sugestão entrada", value: state.sugestaoEntradas }] : []),
    ...(state.principais.length ? [{ label: "Principais", value: state.principais.join(", ") }] : []),
    ...(state.sugestaoPrincipais ? [{ label: "Sugestão principal", value: state.sugestaoPrincipais }] : []),
    ...(state.entradasBuffet?.length ? [{ label: "Entradas (buffet)", value: state.entradasBuffet.join(", ") }] : []),
    ...(state.sugestaoEntradasBuffet ? [{ label: "Sugestão entrada", value: state.sugestaoEntradasBuffet }] : []),
    ...(state.principaisBuffet?.length ? [{ label: "Principais (buffet)", value: state.principaisBuffet.join(", ") }] : []),
    ...(state.sugestaoPrincipaisBuffet ? [{ label: "Sugestão principal", value: state.sugestaoPrincipaisBuffet }] : []),
    ...(state.tacho.length ? [{
      label: "Tacho",
      value: state.tacho.length === 2
        ? state.tacho.map((v) => `${v} (${Number(state.tachoPessoas[v]) || 0} pessoas)`).join(" • ")
        : state.tacho.join(", "),
    }] : []),
    ...(state.feijoada ? [{ label: "Feijoada", value: state.feijoada }] : []),
    ...(state.coffeeBreak ? [{ label: "Coffee Break", value: state.coffeeBreak }] : []),
    ...(state.coffeeBreakObs ? [{ label: "Alterações no coffee", value: state.coffeeBreakObs }] : []),
    ...(state.sobremesas.length ? [{ label: "Sobremesas", value: state.sobremesas.join(", ") }] : []),
    ...(state.sugestaoSobremesas ? [{ label: "Sugestão sobremesa", value: state.sugestaoSobremesas }] : []),
    ...(state.sobremesasBuffet?.length ? [{ label: "Sobremesas (buffet)", value: state.sobremesasBuffet.join(", ") }] : []),
    ...(state.sugestaoSobremesasBuffet ? [{ label: "Sugestão sobremesa", value: state.sugestaoSobremesasBuffet }] : []),
    ...(state.sobremesasRegionais?.length ? [{ label: "Sobremesas regionais", value: state.sobremesasRegionais.join(", ") }] : []),
    ...(state.sugestaoSobremesasRegionais ? [{ label: "Sugestão sobremesa", value: state.sugestaoSobremesasRegionais }] : []),
    ...(state.cardapioPerfil.length ? [{ label: "Cardápio sob medida", value: state.cardapioPerfil.join(", ") }] : []),
    ...(state.temaJantar ? [{ label: "Jantar temático", value: state.temaJantar }] : []),
    ...(state.temaJantarProbs?.length ? [{ label: "Pratos de interesse", value: state.temaJantarProbs.join(", ") }] : []),
  ];

  type Row = { label: string; value: string };
  const eventoRows: Row[] = [
    { label: "Tipo", value: state.tipo === "Outro" ? state.tipoOutro : state.tipo || "" },
    { label: "Data", value: `${formatDate(state.data)}${state.horaInicio ? " • " + state.horaInicio : ""}` },
    { label: "Local", value: state.endereco },
    { label: "Convidados", value: `${state.adultos} adultos${state.criancas ? " + " + state.criancas + " crianças" : ""}` },
  ];
  const bebidasValue = kitBebidas
    ? `Incluir Aurum — ${kitBebidas.label}: ${kitBebidas.desc} (R$ ${comOverride("kit:" + kitBebidas.value, kitBebidas.preco)}/pessoa)`
    : state.bebidas || "";
  const estruturaRows: Row[] = [
    { label: "Cozinha", value: state.cozinha || "" },
    ...(isCoffeeOnly ? [] : [{ label: "Bebidas", value: bebidasValue }]),
    { label: "Louças e talheres", value: state.mesas || "" },
    { label: "Contato", value: `${state.nome} • ${state.whatsapp}${state.email ? " • " + state.email : ""}` },
  ];

  const secoes: Array<{ icon: string; titulo: string; rows: Row[] }> = [
    { icon: "📋", titulo: "Evento", rows: eventoRows },
    { icon: "🍽️", titulo: "Cardápio", rows: cardapioRows },
    { icon: "🤝", titulo: "Estrutura e contato", rows: estruturaRows },
  ];

  return (
    <div className="text-center">
      <div className="rounded-full bg-[#C9A24B] flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ width: 72, height: 72 }}>
        <span className="text-[#1B2A41] text-4xl font-bold">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-[#1B2A41] mb-2">Briefing pronto!</h2>
      <p className="text-gray-500 text-sm mb-4">
        Confira o resumo abaixo, <strong className="text-[#1B2A41]">copie</strong> ou
        <strong className="text-[#1B2A41]"> baixe o PDF</strong> e envie para a nossa equipe.
        Assim retornamos com a sua proposta.
      </p>

      <div className="bg-white rounded-2xl p-5 text-left shadow-sm mb-3 space-y-4">
        {secoes.map((sec) => {
          const visiveis = sec.rows.filter((r) => r.value);
          if (visiveis.length === 0) return null;
          return (
            <div key={sec.titulo}>
              <h3 className="text-xs font-bold text-[#C9A24B] tracking-widest uppercase mb-2 flex items-center gap-1.5">
                <span aria-hidden>{sec.icon}</span> {sec.titulo}
              </h3>
              <div className="space-y-1.5 border-l-2 border-[#C9A24B]/25 pl-3">
                {visiveis.map(({ label, value }) => (
                  <div key={label} className="text-sm leading-snug">
                    <strong className="text-[#1B2A41]">{label}:</strong>{" "}
                    <span className="text-gray-500">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-3">
        <EstimativaCard state={state} />
      </div>

      {onEdit && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Precisa corrigir algo? Toque para editar sem recomeçar:</p>
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
        {/* 1) Enviar PDF pelo WhatsApp — ação principal (anexa o PDF no celular) */}
        <button onClick={handleSharePDF} disabled={!!busy}
          className="bg-[#1d9e4f] text-white py-4 rounded-xl font-semibold text-base shadow-md active:scale-[0.98] transition-all disabled:opacity-50">
          {busy === "share" ? "Preparando o PDF…" : "📲  Enviar briefing em PDF pelo WhatsApp"}
        </button>
        <p className="text-xs text-gray-500 -mt-1 text-center">
          No celular, abre o WhatsApp já com o <strong>PDF anexado</strong> — é só escolher a Aurum e enviar.
        </p>

        {/* 2) Copiar resumo (texto) */}
        <button onClick={handleCopy}
          className="bg-[#1B2A41] text-white py-4 rounded-xl font-semibold text-base shadow-md active:scale-[0.98] transition-all">
          {copied ? "✓  Copiado! Agora cole e envie para a Aurum" : "📋  Copiar resumo em texto"}
        </button>

        {/* 3) Baixar briefing em PDF */}
        <button onClick={handleDownloadPDF} disabled={!!busy}
          className="border-2 border-[#1B2A41] text-[#1B2A41] py-4 rounded-xl font-semibold text-base active:scale-[0.97] transition-all disabled:opacity-50">
          {busy === "pdf" ? "Gerando…" : "📄  Só baixar o PDF"}
        </button>

        {/* ── Convite para os convidados (card em destaque) ── */}
        <div className="mt-1 rounded-2xl border-2 border-[#C9A24B] bg-[#FBF7EE] p-4 text-left shadow-md">
          <p className="text-base font-bold text-[#1B2A41] mb-0.5">🎁 Leve o convite dos seus convidados</p>
          <p className="text-xs text-gray-600 mb-3">
            A carta-convite com o seu cardápio, pronta para você enviar a quem vai convidar.
          </p>
          {cartaCompleta ? (
            <>
              <button onClick={handleInvitationPDF} disabled={!!busy}
                className="w-full bg-[#C9A24B] text-[#1B2A41] py-4 rounded-xl font-bold text-base shadow active:scale-[0.98] transition-all disabled:opacity-50">
                {busy === "convitepdf" ? "Gerando convite…" : "✨  Baixar convite pronto (PDF)"}
              </button>
              <button onClick={handleDownloadLetter} disabled={!!busy}
                className="w-full mt-2 border-2 border-[#C9A24B] text-[#1B2A41] py-3 rounded-xl font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50">
                {busy === "docx" ? "Gerando…" : "📝  Ou baixar em Word (editável)"}
              </button>
              <p className="text-xs text-gray-500 italic mt-2">
                Carta completa com os dados que você preencheu — pronta para enviar.
              </p>
            </>
          ) : (
            <>
              <button onClick={handleDownloadLetter} disabled={!!busy}
                className="w-full bg-[#C9A24B] text-[#1B2A41] py-4 rounded-xl font-bold text-base shadow active:scale-[0.98] transition-all disabled:opacity-50">
                {busy === "docx" ? "Gerando…" : "📝  Baixar carta-convite (Word)"}
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Alguns campos ficarão em branco para você preencher. 💡 Para receber o
                <strong> convite pronto em PDF</strong>, toque em <strong>“✏️ Carta-convite”</strong> acima
                e preencha os 3 dados.
              </p>
            </>
          )}
        </div>

        <button onClick={handleWhatsApp}
          className="text-[#1d9e4f] text-sm font-semibold underline py-2 mt-1">
          Ou enviar pelo WhatsApp
        </button>

        <button onClick={onRestart} className="text-gray-500 text-sm underline py-1">Preencher novamente</button>
      </div>
    </div>
  );
}
