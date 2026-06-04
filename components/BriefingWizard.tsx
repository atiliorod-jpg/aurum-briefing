"use client";
import { useState, useCallback, useEffect } from "react";
import { FormState, initialState, StepName } from "@/lib/types";
import { isPhoneComplete, isEmailValid } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";
import BottomNav from "@/components/ui/BottomNav";
import WelcomeStep from "@/components/steps/WelcomeStep";
import TipoStep from "@/components/steps/TipoStep";
import QuandoStep from "@/components/steps/QuandoStep";
import LocalStep from "@/components/steps/LocalStep";
import ConvidadosStep from "@/components/steps/ConvidadosStep";
import MultiSelectStep from "@/components/steps/MultiSelectStep";
import SingleSelectStep from "@/components/steps/SingleSelectStep";
import ContatoStep from "@/components/steps/ContatoStep";
import ResumoStep from "@/components/steps/ResumoStep";
import CoffeeBreakStep from "@/components/steps/CoffeeBreakStep";
import CartaStep from "@/components/steps/CartaStep";
import SugestaoStep from "@/components/steps/SugestaoStep";
import {
  ESTILO_OPTIONS, ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS,
} from "@/lib/menu";

// ── Lógica de fluxo ─────────────────────────────────────────────────────────
// Estilos cujo cardápio é escolhido item a item (entradas/principais/sobremesas)
const ESTILOS_PICKER = [
  "Serviço à americana (buffet)", "Volante", "Serviço franco-americano (empratado)",
  "Jantar Harmonizado", "Jantar Temático",
];

function resolveFluxo(state: FormState): StepName[] {
  const e = state.estilo;
  const hasPicker = e.some((x) => ESTILOS_PICKER.includes(x));
  const hasTacho = e.includes("Tacho / Paellera");
  const hasFeijoada = e.includes("Feijoada Completa");
  const hasCoffee = e.includes("Coffee Break");
  const hasSugestao = e.includes("Sugestão da Aurum");

  const inicio: StepName[] = ["welcome", "tipo", "quando", "local", "convidados", "faixa", "estilo"];

  // Cada estilo adiciona suas etapas de cardápio (compatível com combinações)
  const menu: StepName[] = [];
  if (hasPicker || hasTacho) menu.push("entradas");
  if (hasPicker) menu.push("principais");
  if (hasTacho) menu.push("tacho");                 // tacho aparece sempre que for escolhido
  if (hasFeijoada) menu.push("feijoada");
  if (hasCoffee) menu.push("coffeeBreak");
  if (hasPicker || hasTacho || hasFeijoada) menu.push("sobremesas");
  if (hasSugestao) menu.push("sugestao");           // direcionamento de cardápio sob medida

  // Bebidas só é dispensado quando o ÚNICO estilo é Coffee Break (já inclui bebidas)
  const includeBebidas = e.length === 0 || e.some((x) => x !== "Coffee Break");
  const fim: StepName[] = [
    "estrutura", "mesas", ...(includeBebidas ? ["bebidas" as StepName] : []),
    "contato", "carta", "final",
  ];

  return [...inicio, ...menu, ...fim];
}

function canAdvance(step: StepName, state: FormState): boolean {
  switch (step) {
    case "tipo": return !!state.tipo && (state.tipo !== "Outro" || state.tipoOutro.trim().length > 0);
    case "quando": return !!state.data;
    case "local": return state.endereco.trim().length > 3;
    case "convidados": return Number(state.adultos) >= 1;
    case "estilo": return state.estilo.length > 0;
    case "entradas": return state.entradas.length > 0;
    case "principais": return state.principais.length > 0;
    case "tacho": return true;
    case "sobremesas": return state.sobremesas.length > 0;
    case "sugestao": return true; // direcionamento opcional
    case "feijoada": return !!state.feijoada;
    case "coffeeBreak": return !!state.coffeeBreak;
    case "estrutura": return !!state.cozinha;
    case "mesas": return !!state.mesas;
    case "bebidas": return !!state.bebidas;
    case "faixa": return true;
    case "contato":
      return state.nome.trim().length > 0
        && isPhoneComplete(state.whatsapp)
        && (state.email.trim() === "" || isEmailValid(state.email));
    case "carta": return true; // opcional
    default: return true;
  }
}

// Mensagem do que falta preencher (mostrada quando "Próximo" está bloqueado)
function requiredHint(step: StepName, state: FormState): string | null {
  if (canAdvance(step, state)) return null;
  switch (step) {
    case "tipo": return "Escolha o tipo de evento para continuar.";
    case "quando": return "Selecione a data do evento para continuar.";
    case "local": return "Informe o endereço do evento para continuar.";
    case "convidados": return "Informe ao menos 1 adulto para continuar.";
    case "estilo": return "Escolha ao menos um estilo de serviço.";
    case "entradas": return "Selecione uma opção (ou “Sem entradas”) para continuar.";
    case "principais": return "Selecione ao menos um prato principal.";
    case "sobremesas": return "Selecione uma opção (ou “Sem sobremesa”) para continuar.";
    case "feijoada": return "Escolha o formato da feijoada.";
    case "estrutura": return "Selecione uma opção para continuar.";
    case "mesas": return "Selecione uma opção para continuar.";
    case "bebidas": return "Selecione uma opção para continuar.";
    case "contato":
      if (state.email.trim() !== "" && !isEmailValid(state.email)) return "O e-mail informado parece inválido.";
      return "Preencha o nome e um WhatsApp completo (com DDD).";
    default: return "Preencha os campos obrigatórios para continuar.";
  }
}

const STORAGE_KEY = "aurum-briefing-v1";

export default function BriefingWizard() {
  const [state, setState] = useState<FormState>(initialState);
  const [idx, setIdx] = useState(0);
  const [reviewMode, setReviewMode] = useState(false); // entrou para editar a partir do resumo
  const [hydrated, setHydrated] = useState(false);
  const [direcao, setDirecao] = useState<"fwd" | "back">("fwd"); // direção da transição

  // Restaura o briefing salvo (continuar de onde parou) — só no cliente, após montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { state?: Partial<FormState>; idx?: number };
        if (saved.state) {
          const restored = { ...initialState, ...saved.state };
          setState(restored);
          const flow = resolveFluxo(restored);
          const safeIdx = Math.min(Math.max(saved.idx ?? 0, 0), flow.length - 1);
          setIdx(safeIdx);
        }
      }
    } catch {
      // ignora dados corrompidos
    }
    setHydrated(true);
  }, []);

  // Salva automaticamente a cada mudança (depois de hidratar, para não sobrescrever com vazio)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, idx }));
    } catch {
      // ignora (modo privado / cota cheia)
    }
  }, [state, idx, hydrated]);

  const patch = useCallback((p: Partial<FormState>) => setState(s => ({ ...s, ...p })), []);

  // Ao alterar convidados, se cair para 40 ou menos, reduz o tacho para no máximo 1
  // (a 2ª opção de tacho só vale para eventos com mais de 40 convidados).
  const patchConvidados = useCallback((p: Partial<FormState>) => {
    setState((s) => {
      const next = { ...s, ...p };
      const total = (Number(next.adultos) || 0) + (Number(next.criancas) || 0);
      if (total <= 40 && next.tacho.length > 1) next.tacho = next.tacho.slice(0, 1);
      return next;
    });
  }, []);

  // Ao mudar o estilo de serviço, limpa os dados de cardápio de estilos que deixaram
  // de estar selecionados (evita "fantasmas" no resumo, ex: cardápio sob medida antigo).
  const setEstilo = useCallback((estilo: string[]) => {
    setState((s) => {
      const next: FormState = { ...s, estilo };
      const has = (v: string) => estilo.includes(v);
      const hasPicker = estilo.some((x) => ESTILOS_PICKER.includes(x));
      if (!has("Sugestão da Aurum")) { next.cardapioPerfil = []; next.cardapioNaoPodeFaltar = ""; next.cardapioEvitar = ""; }
      if (!has("Tacho / Paellera")) next.tacho = [];
      if (!has("Feijoada Completa")) next.feijoada = null;
      if (!has("Coffee Break")) { next.coffeeBreak = null; next.coffeeBreakObs = ""; }
      if (!hasPicker) { next.principais = []; next.sugestaoPrincipais = ""; }
      if (!hasPicker && !has("Tacho / Paellera")) { next.entradas = []; next.sugestaoEntradas = ""; }
      if (!hasPicker && !has("Tacho / Paellera") && !has("Feijoada Completa")) { next.sobremesas = []; next.sugestaoSobremesas = ""; }
      return next;
    });
  }, []);

  const fluxo = resolveFluxo(state);
  const currentStep = fluxo[idx];
  const total = fluxo.length - 1;
  const isSkippable = currentStep === "tacho" || currentStep === "faixa" || currentStep === "carta";
  const isLast = fluxo[idx + 1] === "final";

  const goNext = () => { if (idx < fluxo.length - 1) { setDirecao("fwd"); setIdx(i => i + 1); } };
  const goBack = () => { if (idx > 0) { setDirecao("back"); setIdx(i => i - 1); } };
  const restart = () => {
    if (!window.confirm("Tem certeza que deseja apagar tudo e preencher um novo briefing?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState(initialState); setIdx(0); setReviewMode(false);
  };

  // Pula direto para uma etapa (usado pelos botões "editar" no resumo)
  const goToStep = (step: StepName) => {
    const i = fluxo.indexOf(step);
    if (i >= 0) { setDirecao("back"); setIdx(i); setReviewMode(true); }
  };
  // Volta ao resumo final após editar
  const goToResumo = () => {
    const i = fluxo.indexOf("final");
    if (i >= 0) { setDirecao("fwd"); setIdx(i); }
    setReviewMode(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome": return <WelcomeStep />;
      case "tipo": return <TipoStep state={state} onChange={patch} />;
      case "quando": return <QuandoStep state={state} onChange={patch} />;
      case "local": return <LocalStep state={state} onChange={patch} />;
      case "convidados": return <ConvidadosStep state={state} onChange={patchConvidados} />;

      case "estilo": return (
        <MultiSelectStep
          stepNumber="ESTILO"
          title="Estilo de serviço."
          hint="Como prefere que o evento seja servido? Pode combinar mais de uma opção (até 3)."
          options={ESTILO_OPTIONS}
          selected={state.estilo}
          max={3}
          onChange={setEstilo}
        />
      );

      case "entradas": return (
        <MultiSelectStep
          stepNumber="ENTRADAS"
          title="Entradas."
          hint="Selecione até 3 opções."
          options={ENTRADAS_OPTIONS}
          selected={state.entradas}
          max={3}
          onChange={v => patch({ entradas: v })}
          suggestion={state.sugestaoEntradas}
          onSuggestionChange={v => patch({ sugestaoEntradas: v })}
          exclusiveValues={["Sem entradas", "Sugestão do chef"]}
          priceNote
        />
      );

      case "principais": return (
        <MultiSelectStep
          stepNumber="PRATO PRINCIPAL"
          title="Prato principal."
          hint="Selecione até 3 opções."
          options={PRINCIPAIS_OPTIONS}
          selected={state.principais}
          max={3}
          onChange={v => patch({ principais: v })}
          suggestion={state.sugestaoPrincipais}
          onSuggestionChange={v => patch({ sugestaoPrincipais: v })}
          exclusiveValues={["Sugestão do chef"]}
          priceNote
        />
      );

      case "tacho": {
        const totalConvidados = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
        const podeDois = totalConvidados > 40;
        return (
          <MultiSelectStep
            stepNumber="TACHO / PAELLERA"
            title="Tacho / Paellera."
            hint={podeDois
              ? "Pratos servidos diretamente do tacho, ao centro da mesa. Opcional — selecione até 2."
              : "Pratos servidos diretamente do tacho, ao centro da mesa. Opcional — 1 opção (a 2ª fica disponível para eventos com mais de 40 convidados)."}
            options={TACHO_OPTIONS}
            selected={state.tacho}
            max={podeDois ? 2 : 1}
            onChange={v => patch({ tacho: v })}
            exclusiveValues={["Sem tacho"]}
          />
        );
      }

      case "sobremesas": return (
        <MultiSelectStep
          stepNumber="SOBREMESAS"
          title="Sobremesas."
          hint="Selecione até 2 opções."
          options={SOBREMESAS_OPTIONS}
          selected={state.sobremesas}
          max={2}
          onChange={v => patch({ sobremesas: v })}
          suggestion={state.sugestaoSobremesas}
          onSuggestionChange={v => patch({ sugestaoSobremesas: v })}
          exclusiveValues={["Sem sobremesa", "Sugestão do chef"]}
          priceNote
        />
      );

      case "feijoada": return (
        <SingleSelectStep
          stepNumber="FEIJOADA"
          title="Formato da Feijoada."
          hint="Ambas as opções incluem todos os acompanhamentos clássicos: arroz, couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete."
          options={[
            {
              value: "Tradicional",
              label: "Feijoada Tradicional",
              desc: "Feijão preto encorpado com cortes selecionados — costelinha, paio, linguiças, bacon e carne seca — servidos no tacho, como a tradição manda.",
            },
            {
              value: "Premium",
              label: "Feijoada Premium",
              desc: "Cada proteína apresentada em travessa individual. Apresentação refinada que valoriza cada ingrediente e permite ao convidado montar o seu prato.",
            },
          ]}
          selected={state.feijoada}
          onChange={v => patch({ feijoada: v })}
        />
      );

      case "coffeeBreak": return <CoffeeBreakStep state={state} onChange={patch} />;

      case "sugestao": return <SugestaoStep state={state} onChange={patch} />;

      case "estrutura": return (
        <SingleSelectStep
          stepNumber="ESTRUTURA"
          title="Estrutura no local."
          hint="O local conta com cozinha equipada para produção?"
          options={[
            { value: "Sim, completa", label: "Sim, cozinha completa", desc: "Fogão, forno, geladeira e bancadas disponíveis." },
            { value: "Parcial", label: "Parcialmente equipada", desc: "Alguns equipamentos disponíveis." },
            { value: "Não tem", label: "Sem cozinha — levaremos toda a estrutura", desc: "A Aurum providencia toda a infraestrutura necessária." },
            { value: "Não sei", label: "Não tenho certeza", desc: "Verificamos juntos antes do evento." },
          ]}
          selected={state.cozinha}
          onChange={v => patch({ cozinha: v })}
        />
      );

      case "mesas": return (
        <SingleSelectStep
          stepNumber=""
          title="Louças e talheres."
          hint="Como prefere conduzir este item?"
          options={[
            { value: "Local fornece", label: "O local fornece tudo" },
            { value: "Eu providencio", label: "Vou providenciar" },
            { value: "Incluir Aurum", label: "Incluir na proposta Aurum" },
          ]}
          selected={state.mesas}
          onChange={v => patch({ mesas: v })}
        />
      );

      case "bebidas": return (
        <SingleSelectStep
          stepNumber=""
          title="Bebidas."
          hint="Como prefere conduzir as bebidas?"
          options={[
            { value: "Bar do local", label: "Bar do local" },
            { value: "Compra separada", label: "Fico responsável pela compra" },
            { value: "Incluir Aurum", label: "Incluir na proposta Aurum" },
          ]}
          selected={state.bebidas}
          onChange={v => patch({ bebidas: v })}
        />
      );

      case "faixa": return (
        <SingleSelectStep
          stepNumber=""
          title="Faixa de investimento."
          hint="Totalmente opcional — se preferir, toque em “Pular este passo”. Ajuda a calibrar a proposta ao seu orçamento."
          options={[
            { value: "Até R$ 5 mil", label: "Até R$ 5 mil" },
            { value: "R$ 5 mil a R$ 10 mil", label: "R$ 5 mil a R$ 10 mil" },
            { value: "R$ 10 mil a R$ 15 mil", label: "R$ 10 mil a R$ 15 mil" },
            { value: "R$ 15 mil a R$ 20 mil", label: "R$ 15 mil a R$ 20 mil" },
            { value: "Acima de R$ 20 mil", label: "Acima de R$ 20 mil" },
            { value: "Prefiro receber sugestões", label: "Prefiro receber sugestões" },
          ]}
          selected={state.faixa}
          onChange={v => patch({ faixa: v })}
        />
      );

      case "contato": return <ContatoStep state={state} onChange={patch} />;
      case "carta": return <CartaStep state={state} onChange={patch} />;
      case "final": return <ResumoStep state={state} onRestart={restart} onEdit={goToStep} />;
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6]">
      <ProgressBar current={idx} total={total} />
      <main className={`${currentStep === "carta" ? "max-w-4xl" : "max-w-2xl"} mx-auto px-5 pt-6 pb-36`}>
        <div key={currentStep} className={direcao === "back" ? "animate-slide-left" : "animate-slide-right"}>
          {renderStep()}
        </div>
      </main>
      {currentStep !== "final" && (
        <BottomNav
          onBack={goBack}
          onNext={goNext}
          canGoBack={idx > 0}
          canAdvance={canAdvance(currentStep, state)}
          isLast={isLast}
          isSkippable={isSkippable}
          onSkip={goNext}
          requiredHint={requiredHint(currentStep, state)}
          onReview={reviewMode ? goToResumo : undefined}
        />
      )}
    </div>
  );
}
