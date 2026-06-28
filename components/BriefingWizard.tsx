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
import TachoDistribuicao from "@/components/steps/TachoDistribuicao";
import EstruturaStep from "@/components/steps/EstruturaStep";
import HarmonizadoStep from "@/components/steps/HarmonizadoStep";
import TemaJantarStep from "@/components/steps/TemaJantarStep";
import EstimativaCard from "@/components/ui/EstimativaCard";
import {
  ESTILO_OPTIONS, ENTRADAS_OPTIONS, PRINCIPAIS_OPTIONS, TACHO_OPTIONS, SOBREMESAS_OPTIONS,
  FEIJOADA_OPTIONS,
  ENTRADAS_BUFFET_OPTIONS, PRINCIPAIS_BUFFET_OPTIONS, SOBREMESAS_BUFFET_OPTIONS,
  SOBREMESAS_REGIONAIS_OPTIONS,
} from "@/lib/menu";
import { mostrarPrecoCardapio } from "@/lib/orcamento";

// ── Lógica de fluxo ─────────────────────────────────────────────────────────
// Apenas Empratado usa o picker clássico (entradas/principais/sobremesas europeias).
// Buffet e Volante têm cardápio próprio (entradasBuffet/principaisBuffet/sobremesasBuffet).
// Tacho e Feijoada usam sobremesasRegionais em vez das sobremesas europeias.
const ESTILOS_PICKER = ["Serviço franco-americano (empratado)"];
const ESTILOS_BUFFET_VOLANTE = ["Serviço à americana (buffet)", "Volante"];

function resolveFluxo(state: FormState): StepName[] {
  const e = state.estilo;
  const hasEmpratado     = e.includes("Serviço franco-americano (empratado)");
  const hasBuffetVolante = e.some((x) => ESTILOS_BUFFET_VOLANTE.includes(x));
  const hasTacho         = e.includes("Tacho / Paellera");
  const hasFeijoada      = e.includes("Feijoada Completa");
  const hasCoffee        = e.includes("Coffee Break");
  const hasSugestao      = e.includes("Sugestão da Aurum");
  const hasHarmonizado   = e.includes("Jantar Harmonizado");
  const hasTematico      = e.includes("Jantar Temático");

  const inicio: StepName[] = ["welcome", "tipo", "quando", "local", "convidados", "estilo"];

  const menu: StepName[] = [];

  // Entradas e principais clássicos (empratado + tacho)
  if (hasEmpratado || hasTacho) menu.push("entradas");
  if (hasEmpratado) menu.push("principais");

  // Cardápio exclusivo buffet / volante
  if (hasBuffetVolante) menu.push("entradasBuffet");
  if (hasBuffetVolante) menu.push("principaisBuffet");

  // Tacho e Feijoada
  if (hasTacho) menu.push("tacho");
  if (hasFeijoada) menu.push("feijoada");

  // Coffee Break
  if (hasCoffee) menu.push("coffeeBreak");

  // Sobremesas: um único step por evento (prioridade: empratado > buffet > regional)
  if (hasEmpratado) {
    menu.push("sobremesas");              // europeias/refinadas
  } else if (hasBuffetVolante) {
    menu.push("sobremesasBuffet");        // visuais/elaboradas
  } else if (hasTacho || hasFeijoada) {
    menu.push("sobremesasRegionais");     // regionais nordestinas
  }

  // Estilos exclusivos
  if (hasSugestao) menu.push("sugestao");
  if (hasHarmonizado) menu.push("harmonizado");
  if (hasTematico) menu.push("temaJantar");

  // Estrutura combina cozinha + louças + bebidas numa única tela. O bloco de
  // bebidas é ocultado quando o ÚNICO estilo é Coffee Break (já inclui bebidas).
  const fim: StepName[] = ["estrutura", "contato", "carta", "final"];

  return [...inicio, ...menu, ...fim];
}

// Coffee Break já inclui bebidas — quando é o único estilo, dispensamos o bloco de bebidas.
const ehCoffeeOnly = (state: FormState): boolean =>
  state.estilo.length > 0 && state.estilo.every((x) => x === "Coffee Break");

function canAdvance(step: StepName, state: FormState): boolean {
  switch (step) {
    case "tipo": return !!state.tipo && (state.tipo !== "Outro" || state.tipoOutro.trim().length > 0);
    case "quando": return !!state.data;
    case "local": {
      const cepOk = state.cep.replace(/\D/g, "").length === 8 || state.cepDesconhecido;
      return cepOk && state.endereco.trim().length > 3;
    }
    case "convidados": return Number(state.adultos) >= 1;
    case "estilo": return state.estilo.length > 0;
    case "entradas": return state.entradas.length > 0;
    case "principais": return state.principais.length > 0;
    case "entradasBuffet": return state.entradasBuffet.length > 0;
    case "principaisBuffet": return state.principaisBuffet.length > 0;
    case "sobremesasBuffet": return state.sobremesasBuffet.length > 0;
    case "sobremesasRegionais": return state.sobremesasRegionais.length > 0;
    case "tacho": {
      if (state.tacho.length === 0) return false;
      if (state.tacho.length === 2) {
        const total = (Number(state.adultos) || 0) + (Number(state.criancas) || 0);
        const soma = state.tacho.reduce((s, v) => s + (Number(state.tachoPessoas[v]) || 0), 0);
        if (total > 0 && soma !== total) return false;
      }
      return true;
    }
    case "sobremesas": return state.sobremesas.length > 0;
    case "sugestao": return true;
    case "feijoada": return !!state.feijoada;
    case "coffeeBreak": return !!state.coffeeBreak;
    case "harmonizado": return true; // opcional — sob consulta
    case "temaJantar": return !!state.temaJantar;
    case "estrutura":
      return !!state.cozinha && !!state.mesas && (ehCoffeeOnly(state) || !!state.bebidas);
    case "contato":
      return state.nome.trim().length > 0
        && isPhoneComplete(state.whatsapp)
        && (state.email.trim() === "" || isEmailValid(state.email));
    case "carta": return true;
    default: return true;
  }
}

function requiredHint(step: StepName, state: FormState): string | null {
  if (canAdvance(step, state)) return null;
  switch (step) {
    case "tipo": return "Escolha o tipo de evento para continuar.";
    case "quando": return "Selecione a data do evento para continuar.";
    case "local":
      if (state.cep.replace(/\D/g, "").length !== 8 && !state.cepDesconhecido)
        return 'Informe o CEP (8 dígitos) ou marque "Não sei o CEP" para continuar.';
      return "Informe o endereço do evento para continuar.";
    case "convidados": return "Informe ao menos 1 adulto para continuar.";
    case "estilo": return "Escolha ao menos um estilo de serviço.";
    case "entradas": return 'Selecione uma opção (ou "Sem entradas") para continuar.';
    case "principais": return "Selecione ao menos um prato principal.";
    case "entradasBuffet": return 'Selecione uma opção (ou "Sem entradas") para continuar.';
    case "principaisBuffet": return "Selecione ao menos um prato principal.";
    case "sobremesasBuffet": return 'Selecione uma opção (ou "Sem sobremesa") para continuar.';
    case "sobremesasRegionais": return "Selecione uma sobremesa para continuar.";
    case "tacho":
      if (state.tacho.length === 0) return "Selecione ao menos um prato de tacho/paellera.";
      return "Distribua todos os convidados entre os dois tachos (a soma precisa bater).";
    case "sobremesas": return 'Selecione uma opção (ou "Sem sobremesa") para continuar.';
    case "feijoada": return "Escolha o formato da feijoada.";
    case "temaJantar": return "Escolha a culinária temática para continuar.";
    case "estrutura":
      if (!state.cozinha) return "Diga se o local tem cozinha equipada.";
      if (!state.mesas) return "Escolha como ficam as louças e talheres.";
      return "Escolha como ficam as bebidas.";
    case "contato":
      if (state.email.trim() !== "" && !isEmailValid(state.email)) return "O e-mail informado parece inválido.";
      return "Preencha o nome e um WhatsApp completo (com DDD).";
    default: return "Preencha os campos obrigatórios para continuar.";
  }
}

function balancearTacho(
  tacho: string[],
  total: number,
  atual: Record<string, string>,
): Record<string, string> {
  if (tacho.length === 0) return {};
  if (tacho.length === 1) return { [tacho[0]]: String(total) };
  const [a, b] = tacho;
  const va = Number(atual[a]);
  const vb = Number(atual[b]);
  const ambosValidos = Number.isFinite(va) && Number.isFinite(vb) && va >= 0 && vb >= 0;
  if (ambosValidos && va + vb === total) return { [a]: String(va), [b]: String(vb) };
  if (Number.isFinite(va) && va >= 0 && va <= total) return { [a]: String(va), [b]: String(total - va) };
  const metade = Math.floor(total / 2);
  return { [a]: String(metade), [b]: String(total - metade) };
}

const STORAGE_KEY = "aurum-briefing-v1";
const STORAGE_TTL = 7 * 24 * 60 * 60 * 1000;

export default function BriefingWizard() {
  const [state, setState] = useState<FormState>(initialState);
  const [idx, setIdx] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [direcao, setDirecao] = useState<"fwd" | "back">("fwd");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { state?: Partial<FormState>; idx?: number; savedAt?: number };
        if (saved.savedAt && Date.now() - saved.savedAt > STORAGE_TTL) {
          localStorage.removeItem(STORAGE_KEY);
        } else if (saved.state) {
          const restored = { ...initialState, ...saved.state };
          setState(restored);
          const flow = resolveFluxo(restored);
          const safeIdx = Math.min(Math.max(saved.idx ?? 0, 0), flow.length - 1);
          setIdx(safeIdx);
        }
      }
    } catch { /* ignora dados corrompidos */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, idx, savedAt: Date.now() }));
    } catch { /* ignora */ }
  }, [state, idx, hydrated]);

  const patch = useCallback((p: Partial<FormState>) => setState(s => ({ ...s, ...p })), []);

  const patchConvidados = useCallback((p: Partial<FormState>) => {
    setState((s) => {
      const next = { ...s, ...p };
      const total = (Number(next.adultos) || 0) + (Number(next.criancas) || 0);
      if (total <= 40 && next.tacho.length > 1) next.tacho = next.tacho.slice(0, 1);
      next.tachoPessoas = balancearTacho(next.tacho, total, next.tachoPessoas);
      return next;
    });
  }, []);

  const setTacho = useCallback((tacho: string[]) => {
    setState((s) => {
      const total = (Number(s.adultos) || 0) + (Number(s.criancas) || 0);
      return { ...s, tacho, tachoPessoas: balancearTacho(tacho, total, s.tachoPessoas) };
    });
  }, []);

  const setEstilo = useCallback((estilo: string[]) => {
    setState((s) => {
      const next: FormState = { ...s, estilo };
      const has = (v: string) => estilo.includes(v);
      const hasEmpratado     = has("Serviço franco-americano (empratado)");
      const hasBuffetVolante = estilo.some((x) => ESTILOS_BUFFET_VOLANTE.includes(x));
      const hasTacho         = has("Tacho / Paellera");
      const hasFeijoada      = has("Feijoada Completa");

      if (!has("Sugestão da Aurum")) { next.cardapioPerfil = []; next.cardapioNaoPodeFaltar = ""; next.cardapioEvitar = ""; }
      if (!hasTacho) { next.tacho = []; next.tachoPessoas = {}; }
      if (!hasFeijoada) next.feijoada = null;
      if (!has("Coffee Break")) { next.coffeeBreak = null; next.coffeeBreakObs = ""; }
      if (!has("Jantar Harmonizado")) { next.harmonizadoCursos = null; next.harmonizadoVinhos = null; next.harmonizadoObs = ""; }
      if (!has("Jantar Temático")) { next.temaJantar = null; next.temaJantarProbs = []; next.temaJantarNaoPodeFaltar = ""; next.temaJantarEvitar = ""; }

      // Cardápio clássico (empratado)
      if (!hasEmpratado) { next.principais = []; next.sugestaoPrincipais = ""; next.sobremesas = []; next.sugestaoSobremesas = ""; }
      if (!hasEmpratado && !hasTacho) { next.entradas = []; next.sugestaoEntradas = ""; }

      // Cardápio buffet / volante
      if (!hasBuffetVolante) {
        next.entradasBuffet = []; next.sugestaoEntradasBuffet = "";
        next.principaisBuffet = []; next.sugestaoPrincipaisBuffet = "";
        next.sobremesasBuffet = []; next.sugestaoSobremesasBuffet = "";
      }

      // Sobremesas regionais (só quando Tacho ou Feijoada presentes e sem Empratado/Buffet)
      if (hasEmpratado || hasBuffetVolante || (!hasTacho && !hasFeijoada)) {
        next.sobremesasRegionais = []; next.sugestaoSobremesasRegionais = "";
      }

      return next;
    });
  }, []);

  const fluxo = resolveFluxo(state);
  const currentStep = fluxo[idx];
  const total = fluxo.length - 1;
  const isSkippable = currentStep === "carta";
  const isLast = fluxo[idx + 1] === "final";

  const goNext = () => { if (idx < fluxo.length - 1) { setDirecao("fwd"); setIdx(i => i + 1); } };
  const goBack = () => { if (idx > 0) { setDirecao("back"); setIdx(i => i - 1); } };
  const restart = () => {
    if (!window.confirm("Tem certeza que deseja apagar tudo e preencher um novo briefing?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setState(initialState); setIdx(0); setReviewMode(false);
  };

  const goToStep = (step: StepName) => {
    const i = fluxo.indexOf(step);
    if (i >= 0) { setDirecao("back"); setIdx(i); setReviewMode(true); }
  };
  const goToResumo = () => {
    const i = fluxo.indexOf("final");
    if (i >= 0) { setDirecao("fwd"); setIdx(i); }
    setReviewMode(false);
  };

  const empratado = mostrarPrecoCardapio(state);
  const comPreco = (opts: typeof ENTRADAS_OPTIONS, mostrar: boolean) =>
    mostrar ? opts : opts.map((o) => ({ ...o, preco: undefined }));

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
          hint="Como prefere que o evento seja servido? Pode combinar até 2 opções. Jantar Harmonizado, Jantar Temático e Sugestão da Aurum são exclusivos (escolha única)."
          options={ESTILO_OPTIONS}
          selected={state.estilo}
          max={2}
          exclusiveValues={["Jantar Harmonizado", "Jantar Temático", "Sugestão da Aurum"]}
          onChange={setEstilo}
        />
      );

      case "entradas": return (
        <MultiSelectStep
          stepNumber="ENTRADAS"
          title="Entradas."
          hint={empratado ? "No serviço empratado, selecione até 2 opções." : "Selecione até 3 opções."}
          options={comPreco(ENTRADAS_OPTIONS, empratado)}
          selected={state.entradas}
          max={empratado ? 2 : 3}
          onChange={v => patch({ entradas: v })}
          suggestion={state.sugestaoEntradas}
          onSuggestionChange={v => patch({ sugestaoEntradas: v })}
          exclusiveValues={["Sem entradas", "Sugestão do chef"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "principais": return (
        <MultiSelectStep
          stepNumber="PRATO PRINCIPAL"
          title="Prato principal."
          hint={empratado ? "No serviço empratado, selecione até 2 opções." : "Selecione até 3 opções."}
          options={comPreco(PRINCIPAIS_OPTIONS, empratado)}
          selected={state.principais}
          max={empratado ? 2 : 3}
          onChange={v => patch({ principais: v })}
          suggestion={state.sugestaoPrincipais}
          onSuggestionChange={v => patch({ sugestaoPrincipais: v })}
          exclusiveValues={["Sugestão do chef"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "entradasBuffet": return (
        <MultiSelectStep
          stepNumber="ENTRADAS"
          title="Entradas."
          hint="Seleção especial para buffet e volante — até 2 opções. No buffet, o valor por pessoa considera a média dos pratos escolhidos."
          options={ENTRADAS_BUFFET_OPTIONS}
          selected={state.entradasBuffet}
          max={2}
          onChange={v => patch({ entradasBuffet: v })}
          suggestion={state.sugestaoEntradasBuffet}
          onSuggestionChange={v => patch({ sugestaoEntradasBuffet: v })}
          exclusiveValues={["Sem entradas buffet"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "principaisBuffet": return (
        <MultiSelectStep
          stepNumber="PRATO PRINCIPAL"
          title="Prato principal."
          hint="Seleção especial para buffet e volante — até 2 opções. No buffet, o valor por pessoa considera a média dos pratos escolhidos."
          options={PRINCIPAIS_BUFFET_OPTIONS}
          selected={state.principaisBuffet}
          max={2}
          onChange={v => patch({ principaisBuffet: v })}
          suggestion={state.sugestaoPrincipaisBuffet}
          onSuggestionChange={v => patch({ sugestaoPrincipaisBuffet: v })}
          exclusiveValues={["Sugestão do chef buffet"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "sobremesasBuffet": return (
        <MultiSelectStep
          stepNumber="SOBREMESAS"
          title="Sobremesas."
          hint="Seleção especial para buffet e volante — até 2 opções. No buffet, o valor por pessoa considera a média dos pratos escolhidos."
          options={SOBREMESAS_BUFFET_OPTIONS}
          selected={state.sobremesasBuffet}
          max={2}
          onChange={v => patch({ sobremesasBuffet: v })}
          suggestion={state.sugestaoSobremesasBuffet}
          onSuggestionChange={v => patch({ sugestaoSobremesasBuffet: v })}
          exclusiveValues={["Sem sobremesa buffet"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "sobremesasRegionais": return (
        <MultiSelectStep
          stepNumber="SOBREMESAS"
          title="Sobremesas."
          hint="Selecione até 2 opções — sabores regionais nordestinos."
          options={SOBREMESAS_REGIONAIS_OPTIONS}
          selected={state.sobremesasRegionais}
          max={2}
          onChange={v => patch({ sobremesasRegionais: v })}
          suggestion={state.sugestaoSobremesasRegionais}
          onSuggestionChange={v => patch({ sugestaoSobremesasRegionais: v })}
          exclusiveValues={["Sem sobremesa"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
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
              ? "Pratos servidos diretamente do tacho, ao centro da mesa. Selecione até 2 — você distribui os convidados entre eles."
              : "Pratos servidos diretamente do tacho, ao centro da mesa. Selecione 1 (a 2ª opção fica disponível para eventos com mais de 40 convidados)."}
            options={TACHO_OPTIONS}
            selected={state.tacho}
            max={podeDois ? 2 : 1}
            onChange={setTacho}
            footer={
              <div className="space-y-4">
                <TachoDistribuicao state={state} onChange={patch} />
                <EstimativaCard state={state} colapsavel />
              </div>
            }
          />
        );
      }

      case "sobremesas": return (
        <MultiSelectStep
          stepNumber="SOBREMESAS"
          title="Sobremesas."
          hint="Selecione até 2 opções."
          options={comPreco(SOBREMESAS_OPTIONS, empratado)}
          selected={state.sobremesas}
          max={2}
          onChange={v => patch({ sobremesas: v })}
          suggestion={state.sugestaoSobremesas}
          onSuggestionChange={v => patch({ sugestaoSobremesas: v })}
          exclusiveValues={["Sem sobremesa", "Sugestão do chef"]}
          priceNote
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "feijoada": return (
        <SingleSelectStep
          stepNumber="FEIJOADA"
          title="Formato da Feijoada."
          hint="Ambas as opções incluem todos os acompanhamentos clássicos: arroz, couve refogada, farofa de manteiga, laranja, abacaxi e vinagrete."
          options={FEIJOADA_OPTIONS}
          selected={state.feijoada}
          onChange={v => patch({ feijoada: v })}
          footer={<EstimativaCard state={state} colapsavel />}
        />
      );

      case "coffeeBreak": return <CoffeeBreakStep state={state} onChange={patch} />;
      case "sugestao": return <SugestaoStep state={state} onChange={patch} />;
      case "harmonizado": return <HarmonizadoStep state={state} onChange={patch} />;
      case "temaJantar": return <TemaJantarStep state={state} onChange={patch} />;

      case "estrutura": return (
        <EstruturaStep state={state} onChange={patch} mostrarBebidas={!ehCoffeeOnly(state)} />
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
