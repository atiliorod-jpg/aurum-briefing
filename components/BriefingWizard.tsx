"use client";
import { useState, useCallback } from "react";
import { FormState, initialState, StepName } from "@/lib/types";
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

// ── Estilos de serviço ──────────────────────────────────────────────────────
const ESTILO_OPTIONS = [
  { value: "Serviço à americana (buffet)", label: "Serviço à americana (buffet)", desc: "Pratos dispostos em mesa para servir-se à vontade." },
  { value: "Volante", label: "Volante", desc: "Garçons circulam com bandejas entre os convidados." },
  { value: "Serviço franco-americano (empratado)", label: "Serviço franco-americano (empratado)", desc: "Cada prato montado e servido individualmente à mesa." },
  { value: "Tacho / Paellera", label: "Tacho / Paellera", desc: "Pratos servidos diretamente do tacho, ao centro da mesa." },
  { value: "Feijoada Completa", label: "Feijoada Completa", desc: "Experiência gastronômica completa com todos os acompanhamentos clássicos." },
  { value: "Coffee Break", label: "Coffee Break", desc: "Cardápio dedicado para reuniões, treinamentos, recepções e momentos de pausa." },
  { value: "Jantar Harmonizado", label: "Jantar Harmonizado", desc: "Menu degustação com harmonização de vinhos e bebidas." },
  { value: "Jantar Temático", label: "Jantar Temático", desc: "Cardápio e ambientação criados em torno de um tema." },
  { value: "Sugestão da Aurum", label: "Sugestão da Aurum", desc: "Deixamos o cardápio a nosso cargo, conforme o perfil do evento." },
];

// ── Entradas ────────────────────────────────────────────────────────────────
const ENTRADAS_OPTIONS = [
  { value: "Carpaccio de Vitelo / Filé Mignon", label: "Carpaccio de Vitelo / Filé Mignon", desc: "Finas lâminas com brotos, parmesão, alcaparras e molho djon. Acompanha torradas." },
  { value: "Carpaccio de Polvo", label: "Carpaccio de Polvo", desc: "Lâminas de polvo com azeite, ervas frescas, aioli e molho djon. Acompanha torradas." },
  { value: "Caponata de Polvo", label: "Caponata de Polvo", desc: "Releitura italiana com polvo, berinjela, tomate e ervas agridoces. Acompanha torradas." },
  { value: "Gravlax de Salmão", label: "Gravlax de Salmão", desc: "Salmão curado em sal, beterraba e ervas, com creme azedo e dill. Acompanha torradas." },
  { value: "Terrine de Salmão", label: "Terrine de Salmão", desc: "Terrine em camadas com ricota e creme de leite fresco, servida fria com molho de acerola." },
  { value: "Burrata com Tomate Confit", label: "Burrata com Tomate Confit", desc: "Burrata cremosa sobre tomates confitados, redução de balsâmico e flor de sal." },
  { value: "Salada Parmese", label: "Salada Parmese", desc: "Melão, figo, presunto de Parma, parmesão e amêndoas tostadas com azeite e manjericão roxo." },
  { value: "Steak Tartare", label: "Steak Tartare", desc: "Filé mignon cortado na ponta da faca com mostarda, alcaparras e ovo de codorna. Acompanha torradas." },
  { value: "Croqueta de Cupim", label: "Croqueta de Cupim", desc: "Com vinagrete de melão fresco, redução de açaí e aioli de limão siciliano." },
  { value: "Ceviche de Peixe Branco", label: "Ceviche de Peixe Branco", desc: "Peixe marinado em limão, cebola roxa, coentro e leite de coco. Fusão nordestina com técnica peruana." },
  { value: "Sem entradas", label: "Sem entradas", desc: "" },
  { value: "Sugestão do chef", label: "Sugestão do chef", desc: "Deixamos a seleção de entradas a cargo do chef." },
];

// ── Pratos principais ───────────────────────────────────────────────────────
const PRINCIPAIS_OPTIONS = [
  { value: "Filé Mignon ao Molho de Redução de Vinho Tinto", label: "Filé Mignon ao Molho de Redução de Vinho Tinto", desc: "Filé mignon grelhado com redução de vinho tinto encorpada. Acompanha linguine na manteiga clarificada e ervas, com parmesão ralado na hora (opcional)." },
  { value: "Filé au Poivre com Fettuccine", label: "Filé au Poivre com Fettuccine", desc: "Filé mignon em molho au poivre cremoso, com fettuccine na manteiga clarificada e sálvia fresca." },
  { value: "Paillard ao Molho Rôti com Linguini", label: "Paillard ao Molho Rôti com Linguini", desc: "Filé aberto e grelhado com molho rôti intenso, acompanhado de linguini ao azeite trufado." },
  { value: "Magret de Pato ao Molho de Laranja", label: "Magret de Pato ao Molho de Laranja", desc: "Peito de pato com pele crocante, molho à l'orange e purê de batata-doce ao tomilho." },
  { value: "Codorna Confitada", label: "Codorna Confitada", desc: "Codorna cozida lentamente em gordura, com molho de uvas tintas e aligot ou purê trufado." },
  { value: "Salmão Grelhado com Risoto de Limão Siciliano", label: "Salmão Grelhado com Risoto de Limão Siciliano", desc: "Salmão grelhado sobre risoto cremoso com raspas cítricas e manteiga noisette." },
  { value: "Moqueca de Camarão com Pirão", label: "Moqueca de Camarão com Pirão", desc: "Camarões frescos cozidos em leite de coco e dendê, com pirão cremoso e arroz branco." },
  { value: "Spaghetti au Mare", label: "Spaghetti au Mare", desc: "Massa com lula, polvo, camarão, vongole e mexilhão salteados em azeite, alho e limão siciliano." },
  { value: "Pappardelle com Ragù de Ossobuco", label: "Pappardelle com Ragù de Ossobuco", desc: "Massa grano duro com ragù de ossobuco cozido lentamente, parmesão e ervas frescas." },
  { value: "Polpetone com Polenta", label: "Polpetone com Polenta", desc: "Polpetone recheado com funghi e queijo meia cura, sobre polenta cremosa e molho de tomate rústico." },
  { value: "Lasanha com Fonduta de Queijo", label: "Lasanha com Fonduta de Queijo", desc: "Lasanha bolonhesa em camadas, selada na chapa para crosta dourada e finalizada com fonduta cremosa." },
  { value: "Sugestão do chef", label: "Sugestão do chef", desc: "Deixamos a escolha a cargo do chef, conforme o perfil do evento." },
];

// ── Tacho / Paellera ────────────────────────────────────────────────────────
const TACHO_OPTIONS = [
  { value: "Galinhada", label: "Galinhada", desc: "Arroz caldoso com frango caipira, temperos nordestinos e açafrão da terra." },
  { value: "Arroz de Costela Caldoso", label: "Arroz de Costela Caldoso", desc: "Arroz cozido junto à costela bovina, absorvendo colágeno e temperos rústicos." },
  { value: "Arroz Ossobuco à Bourguignon", label: "Arroz Ossobuco à Bourguignon", desc: "Ossobuco braseado em vinho tinto com cenoura, cebola pérola e ervas provençais." },
  { value: "Arroz de Frutos do Mar", label: "Arroz de Frutos do Mar", desc: "Marisco, peixe, camarão e lula em caldo aromático com açafrão e azeite." },
  { value: "Baião de Dois Cremoso", label: "Baião de Dois Cremoso", desc: "Clássico nordestino de feijão verde com arroz, queijo coalho e manteiga de garrafa." },
  { value: "Penne ao Ragù de Pernil", label: "Penne ao Ragù de Pernil", desc: "Molho cremoso de queijo com ragù de pernil desfiado em vinho e ervas aromáticas." },
  { value: "Penne com Paçoca de Carne de Sol", label: "Penne com Paçoca de Carne de Sol", desc: "Creme de queijo coalho e manteiga de garrafa, com carne de sol desfiada e crocante." },
  { value: "Fettuccine com Camarões e Mexilhões", label: "Fettuccine com Camarões e Mexilhões", desc: "Manteiga de ervas frescas com toque de limão siciliano, camarões e mexilhões salteados." },
  { value: "Sem tacho", label: "Sem tacho", desc: "" },
];

// ── Sobremesas ──────────────────────────────────────────────────────────────
const SOBREMESAS_OPTIONS = [
  { value: "Crème Brûlée", label: "Crème Brûlée", desc: "Creme de baunilha com crosta fina de açúcar caramelizado na hora." },
  { value: "Tiramisù", label: "Tiramisù", desc: "Biscoito embebido em café com creme de mascarpone e toque de cacau." },
  { value: "Petit Gâteau com Sorvete", label: "Petit Gâteau com Sorvete", desc: "Bolinho de chocolate com interior derretido, assado na hora, com sorvete de creme." },
  { value: "Bolo de Rolo com Sorvete", label: "Bolo de Rolo com Sorvete", desc: "Clássico pernambucano com goiabada cremosa, sorvete artesanal e calda de frutas vermelhas." },
  { value: "Cheesecake Basque", label: "Cheesecake Basque", desc: "Interior cremoso com topo caramelizado, servido com frutas vermelhas ou ganache." },
  { value: "Banoffee", label: "Banoffee", desc: "Base crocante com banana, doce de leite cremoso e chantilly." },
  { value: "Panna Cotta", label: "Panna Cotta", desc: "Creme italiano delicado e sedoso com calda de frutas." },
  { value: "Tarte Tatin com Chantilly de Baunilha", label: "Tarte Tatin com Chantilly", desc: "Torta francesa invertida de maçã caramelizada com massa folhada dourada e chantilly de baunilha." },
  { value: "Crêpe Suzette", label: "Crêpe Suzette", desc: "Crêpes flambados em calda de laranja com licor, servidos com sorvete de creme." },
  { value: "Mousse", label: "Mousse", desc: "Mousse leve (chocolate, maracujá ou outro sabor) com chantilly." },
  { value: "Sem sobremesa", label: "Sem sobremesa", desc: "" },
  { value: "Sugestão do chef", label: "Sugestão do chef", desc: "" },
];

// ── Lógica de fluxo ─────────────────────────────────────────────────────────
const ESTILOS_STANDARD = [
  "Serviço à americana (buffet)", "Volante", "Serviço franco-americano (empratado)",
  "Jantar Harmonizado", "Jantar Temático", "Sugestão da Aurum",
];

function resolveFluxo(state: FormState): StepName[] {
  const e = state.estilo;
  const hasStandard = e.some((x) => ESTILOS_STANDARD.includes(x));
  const hasTacho = e.includes("Tacho / Paellera");
  const hasFeijoada = e.includes("Feijoada Completa");
  const hasCoffee = e.includes("Coffee Break");

  const inicio: StepName[] = ["welcome", "tipo", "quando", "local", "convidados", "faixa", "estilo"];

  // Cada estilo adiciona suas etapas de cardápio (compatível com combinações)
  const menu: StepName[] = [];
  if (hasStandard || hasTacho) menu.push("entradas");
  if (hasStandard) menu.push("principais");
  if (hasTacho) menu.push("tacho");                 // tacho aparece sempre que for escolhido
  if (hasFeijoada) menu.push("feijoada");
  if (hasCoffee) menu.push("coffeeBreak");
  if (hasStandard || hasTacho || hasFeijoada) menu.push("sobremesas");

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
    case "convidados": return !!state.adultos;
    case "estilo": return state.estilo.length > 0;
    case "entradas": return state.entradas.length > 0;
    case "principais": return state.principais.length > 0;
    case "tacho": return true;
    case "sobremesas": return state.sobremesas.length > 0;
    case "feijoada": return !!state.feijoada;
    case "coffeeBreak": return !!state.coffeeBreak;
    case "estrutura": return !!state.cozinha;
    case "mesas": return !!state.mesas;
    case "bebidas": return !!state.bebidas;
    case "faixa": return true;
    case "contato": return state.nome.trim().length > 0 && state.whatsapp.trim().length > 0;
    case "carta": return true; // opcional
    default: return true;
  }
}

export default function BriefingWizard() {
  const [state, setState] = useState<FormState>(initialState);
  const [idx, setIdx] = useState(0);

  const patch = useCallback((p: Partial<FormState>) => setState(s => ({ ...s, ...p })), []);

  const fluxo = resolveFluxo(state);
  const currentStep = fluxo[idx];
  const total = fluxo.length - 1;
  const isSkippable = currentStep === "tacho" || currentStep === "faixa" || currentStep === "carta";
  const isLast = fluxo[idx + 1] === "final";

  const goNext = () => { if (idx < fluxo.length - 1) setIdx(i => i + 1); };
  const goBack = () => { if (idx > 0) setIdx(i => i - 1); };
  const restart = () => { setState(initialState); setIdx(0); };

  const renderStep = () => {
    switch (currentStep) {
      case "welcome": return <WelcomeStep />;
      case "tipo": return <TipoStep state={state} onChange={patch} />;
      case "quando": return <QuandoStep state={state} onChange={patch} />;
      case "local": return <LocalStep state={state} onChange={patch} />;
      case "convidados": return <ConvidadosStep state={state} onChange={patch} />;

      case "estilo": return (
        <MultiSelectStep
          stepNumber="ESTILO"
          title="Estilo de serviço."
          hint="Como prefere que o evento seja servido? Pode combinar mais de uma opção (até 3)."
          options={ESTILO_OPTIONS}
          selected={state.estilo}
          max={3}
          onChange={v => patch({ estilo: v })}
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
          priceNote
        />
      );

      case "tacho": return (
        <MultiSelectStep
          stepNumber="TACHO / PAELLERA"
          title="Tacho / Paellera."
          hint="Pratos servidos diretamente do tacho, ao centro da mesa. Opcional — selecione até 2."
          options={TACHO_OPTIONS}
          selected={state.tacho}
          max={2}
          onChange={v => patch({ tacho: v })}
        />
      );

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
          title="Mesas, cadeiras, louças e talheres."
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
      case "final": return <ResumoStep state={state} onRestart={restart} />;
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6]">
      <ProgressBar current={idx} total={total} />
      <main className={`${currentStep === "carta" ? "max-w-4xl" : "max-w-2xl"} mx-auto px-5 pt-6 pb-36`}>
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
