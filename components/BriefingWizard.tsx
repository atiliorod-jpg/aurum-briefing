"use client";
import { useState, useCallback } from "react";
import { FormState, initialState, StepName, FLUXO_PADRAO, FLUXO_FEIJOADA } from "@/lib/types";
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

const ESTILO_OPTIONS = [
  { value: "Buffet livre", label: "Buffet livre\nself-service" },
  { value: "Volante (bandeja)", label: "Volante\nbandeja" },
  { value: "Empratado", label: "Empratado\nservido à mesa" },
  { value: "Tacho / Paellera", label: "Tacho/Paellera" },
  { value: "Sugestão da Aurum", label: "Sugestão\nda Aurum" },
];
const ENTRADAS_OPTIONS = [
  { value: "Carpaccio de Vitelo / Filé", label: "Carpaccio de Vitelo / Filé" },
  { value: "Carpaccio de Polvo", label: "Carpaccio de Polvo" },
  { value: "Caponata de Polvo", label: "Caponata de Polvo" },
  { value: "Gravlax de Salmão", label: "Gravlax de Salmão" },
  { value: "Terrine de Salmão", label: "Terrine de Salmão" },
  { value: "Burrata c/ Tomate Confit", label: "Burrata c/ Tomate Confit" },
  { value: "Salada Parmese", label: "Salada Parmese" },
  { value: "Steak Tartare", label: "Steak Tartare" },
  { value: "Croqueta de Cupim", label: "Croqueta de Cupim" },
  { value: "Ceviche Nordestino", label: "Ceviche Nordestino" },
  { value: "Sem entradas", label: "Sem entradas" },
  { value: "Sugestão do chef", label: "Sugestão do chef" },
];
const PRINCIPAIS_OPTIONS = [
  { value: "Filé Mignon ao Vinho Tinto", label: "Filé Mignon\nVinho Tinto" },
  { value: "Filé au Poivre c/ Fettuccine", label: "Filé au Poivre\nFettuccine" },
  { value: "Paillard ao Rôti c/ Linguini", label: "Paillard\nao Rôti" },
  { value: "Magret de Pato ao Laranja", label: "Magret de Pato\nao Laranja" },
  { value: "Codorna Confitada", label: "Codorna\nConfitada" },
  { value: "Salmão c/ Risoto de Limão Siciliano", label: "Salmão\nRisoto Limão" },
  { value: "Moqueca de Camarão c/ Pirão", label: "Moqueca de Camarão" },
  { value: "Spaghetti au Mare", label: "Spaghetti\nau Mare" },
  { value: "Pappardelle c/ Ragù de Ossobuco", label: "Pappardelle\nRagù Ossobuco" },
  { value: "Polpetone c/ Polenta", label: "Polpetone\nc/ Polenta" },
  { value: "Lasanha c/ Fonduta de Queijo", label: "Lasanha\nc/ Fonduta" },
  { value: "Sugestão do chef", label: "Sugestão\ndo chef" },
];
const TACHO_OPTIONS = [
  { value: "Galinhada", label: "Galinhada" },
  { value: "Arroz de Costela Caldoso", label: "Arroz\nde Costela" },
  { value: "Arroz Ossobuco à Bourguignon", label: "Arroz\nOssobuco" },
  { value: "Arroz de Frutos do Mar", label: "Arroz\nFrutos do Mar" },
  { value: "Baião de Dois Cremoso", label: "Baião\nde Dois" },
  { value: "Penne c/ Ragù de Pernil", label: "Penne\nRagù Pernil" },
  { value: "Penne c/ Paçoca de Carne de Sol", label: "Penne\nCarne de Sol" },
  { value: "Fettuccine c/ Camarões e Mexilhões", label: "Fettuccine\nFrutos do Mar" },
  { value: "Sem tacho", label: "Sem tacho" },
];
const SOBREMESAS_OPTIONS = [
  { value: "Crème Brûlée", label: "Crème Brûlée" },
  { value: "Tiramisù", label: "Tiramisù" },
  { value: "Petit Gâteau c/ Sorvete", label: "Petit Gâteau\nc/ Sorvete" },
  { value: "Bolo de Rolo c/ Sorvete", label: "Bolo de Rolo\nc/ Sorvete" },
  { value: "Cheesecake Basque", label: "Cheesecake Basque" },
  { value: "Banoffee", label: "Banoffee" },
  { value: "Panna Cotta", label: "Panna Cotta" },
  { value: "Tarte Tatin c/ Chantilly", label: "Tarte Tatin\nc/ Chantilly" },
  { value: "Crêpe Suzette", label: "Crêpe Suzette" },
  { value: "Mousse", label: "Mousse" },
  { value: "Sem sobremesa", label: "Sem sobremesa" },
  { value: "Sugestão do chef", label: "Sugestão do chef" },
];

function canAdvance(step: StepName, state: FormState): boolean {
  switch (step) {
    case "tipo": return !!state.tipo && (state.tipo !== "Outro" || state.tipoOutro.trim().length > 0);
    case "quando": return !!state.data;
    case "local": return state.endereco.trim().length > 3;
    case "convidados": return !!state.adultos;
    case "estilo": return state.estilo.length > 0;
    case "entradas": return state.entradas.length > 0;
    case "principais": return state.principais.length > 0;
    case "tacho": return true;
    case "sobremesas": return state.sobremesas.length > 0;
    case "feijoada": return !!state.feijoada;
    case "estrutura": return !!state.cozinha;
    case "mesas": return !!state.mesas;
    case "bebidas": return !!state.bebidas;
    case "faixa": return true;
    case "contato": return state.nome.trim().length > 0 && state.whatsapp.trim().length > 0;
    default: return true;
  }
}

export default function BriefingWizard() {
  const [state, setState] = useState<FormState>(initialState);
  const [fluxo, setFluxo] = useState<StepName[]>(FLUXO_PADRAO);
  const [idx, setIdx] = useState(0);

  const patch = useCallback((p: Partial<FormState>) => setState(s => ({ ...s, ...p })), []);
  const currentStep = fluxo[idx];
  const total = fluxo.length - 1;
  const isSkippable = currentStep === "tacho" || currentStep === "faixa";
  const isLast = fluxo[idx + 1] === "final";

  const goNext = () => {
    if (currentStep === "tipo") {
      setFluxo(state.tipo === "Evento de Feijoada" ? FLUXO_FEIJOADA : FLUXO_PADRAO);
    }
    if (idx < fluxo.length - 1) setIdx(i => i + 1);
  };
  const goBack = () => { if (idx > 0) setIdx(i => i - 1); };
  const restart = () => { setState(initialState); setFluxo(FLUXO_PADRAO); setIdx(0); };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome": return <WelcomeStep />;
      case "tipo": return <TipoStep state={state} onChange={patch} />;
      case "quando": return <QuandoStep state={state} onChange={patch} />;
      case "local": return <LocalStep state={state} onChange={patch} />;
      case "convidados": return <ConvidadosStep state={state} onChange={patch} />;
      case "estilo": return <MultiSelectStep stepNumber="5 / 10" title="Estilo de serviço." hint="Pode marcar mais de 1 ou combinar." options={ESTILO_OPTIONS} selected={state.estilo} max={3} onChange={v => patch({ estilo: v })} />;
      case "entradas": return <MultiSelectStep stepNumber="6 / 10" title="Entradas." hint="Escolha até 3." options={ENTRADAS_OPTIONS} selected={state.entradas} max={3} onChange={v => patch({ entradas: v })} />;
      case "principais": return <MultiSelectStep stepNumber="7 / 10" title="Prato principal." hint="Escolha até 3." options={PRINCIPAIS_OPTIONS} selected={state.principais} max={3} onChange={v => patch({ principais: v })} />;
      case "tacho": return <MultiSelectStep stepNumber="8 / 10" title="Tacho / Paellera." hint="Opcional. Pratos servidos diretamente do tacho. Escolha até 2." options={TACHO_OPTIONS} selected={state.tacho} max={2} onChange={v => patch({ tacho: v })} />;
      case "sobremesas": return <MultiSelectStep stepNumber="9 / 10" title="Sobremesas." hint="Escolha até 2." options={SOBREMESAS_OPTIONS} selected={state.sobremesas} max={2} onChange={v => patch({ sobremesas: v })} />;
      case "feijoada": return <SingleSelectStep stepNumber="5 / 6" title="Qual o estilo da Feijoada?" hint="Ambas incluem todos os acompanhamentos clássicos: arroz, couve, farofa, laranja, vinagrete." options={[{ value: "Tradicional", label: "Tradicional", desc: "Carnes misturadas no tacho único. Generosa e aromática." },{ value: "Premium", label: "Premium", desc: "Proteínas em travessas separadas. Apresentação elegante." }]} selected={state.feijoada} onChange={v => patch({ feijoada: v })} />;
      case "estrutura": return <SingleSelectStep stepNumber="10 / 10" title="Estrutura no local." hint="O local tem cozinha equipada para produção?" options={[{ value: "Sim, completa", label: "Sim, cozinha completa", desc: "Fogão, forno, geladeira, bancadas." },{ value: "Parcial", label: "Parcialmente equipada" },{ value: "Não tem", label: "Não tem — levaremos toda a estrutura" },{ value: "Não sei", label: "Não tenho certeza", desc: "Vamos verificar juntos." }]} selected={state.cozinha} onChange={v => patch({ cozinha: v })} />;
      case "mesas": return <SingleSelectStep stepNumber="" title="Mesas, cadeiras, louças e talheres." hint="Como prefere?" options={[{ value: "Local fornece", label: "O local fornece tudo" },{ value: "Eu providencio", label: "Vou providenciar" },{ value: "Incluir Aurum", label: "Quero incluir na proposta Aurum" }]} selected={state.mesas} onChange={v => patch({ mesas: v })} />;
      case "bebidas": return <SingleSelectStep stepNumber="" title="Bebidas." hint="Como prefere conduzir as bebidas?" options={[{ value: "Bar do local", label: "Bar do local" },{ value: "Compra separada", label: "Eu cuido (compra separada)" },{ value: "Incluir Aurum", label: "Incluir na proposta Aurum" }]} selected={state.bebidas} onChange={v => patch({ bebidas: v })} />;
      case "faixa": return <SingleSelectStep stepNumber="" title="Faixa de investimento." hint="Opcional. Ajuda a calibrar a proposta." options={[{ value: "Até R$ 5 mil", label: "Até R$ 5 mil" },{ value: "R$ 5 mil a R$ 15 mil", label: "R$ 5 mil a R$ 15 mil" },{ value: "R$ 15 mil a R$ 30 mil", label: "R$ 15 mil a R$ 30 mil" },{ value: "Acima de R$ 30 mil", label: "Acima de R$ 30 mil" },{ value: "Prefiro sugestões", label: "Prefiro receber sugestões" }]} selected={state.faixa} onChange={v => patch({ faixa: v })} />;
      case "contato": return <ContatoStep state={state} onChange={patch} />;
      case "final": return <ResumoStep state={state} onRestart={restart} />;
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6]">
      <ProgressBar current={idx} total={total} />
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-36">
        <div key={currentStep} className="animate-fade-in">
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
        />
      )}
    </div>
  );
}
