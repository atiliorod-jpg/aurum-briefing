// ────────────────────────────────────────────────────────────────────────────
// CARDÁPIOS DA AURUM
// Edite aqui para incluir, remover ou alterar pratos/descrições. As telas do
// briefing leem destes arrays automaticamente.
//   value → identificador usado internamente e no resumo/WhatsApp (mantenha único)
//   label → texto que aparece no card
//   desc  → descrição mostrada abaixo do nome (pode ficar vazia "")
// ────────────────────────────────────────────────────────────────────────────

export interface MenuOption {
  value: string;
  label: string;
  desc?: string;
}

// ── Feijoada ────────────────────────────────────────────────────────────────
export const FEIJOADA_OPTIONS: MenuOption[] = [
  { value: "Tradicional", label: "Feijoada Tradicional", desc: "Feijão preto encorpado com cortes selecionados — costelinha, paio, linguiças, bacon e carne seca — servidos no tacho, como a tradição manda." },
  { value: "Premium", label: "Feijoada Premium", desc: "Cada proteína apresentada em travessa individual. Apresentação refinada que valoriza cada ingrediente e permite ao convidado montar o seu prato." },
];

// ── Coffee Break (bebidas / salgados / doces de cada nível) ─────────────────
export const COFFEE_DETAILS: Record<string, { hint: string; bebidas: string; salgados: string; doces: string }> = {
  "Coffee Break Simples": {
    hint: "Ideal para reuniões rápidas, treinamentos curtos e momentos de pausa com uma seleção prática, leve e bem apresentada.",
    bebidas: "Café filtrado; leite quente; água mineral; suco de polpa selecionada — 1 opção.",
    salgados: "Mini sanduíche natural de frango ou queijo; mini pão de queijo; torta salgada; torradinhas com patês; cuscuz nordestino recheado.",
    doces: "Bolos caseiros; mungunzá; salada de frutas.",
  },
  "Coffee Break Tradicional": {
    hint: "Indicado para eventos corporativos, cursos, palestras, treinamentos e recepções que pedem maior variedade de itens doces, salgados e bebidas.",
    bebidas: "Café filtrado; leite quente; chá; água mineral; suco de polpa selecionada — 2 opções; achocolatado.",
    salgados: "Mini croissant; croque monsieur; pão de queijo; quiche; torta salgada; pães com ovos mexidos à francesa; cuscuz nordestino recheado.",
    doces: "Bolos caseiros; petit four; mungunzá; waffles; frutas ou salada de frutas.",
  },
  "Coffee Break Premium": {
    hint: "Pensado para eventos mais sofisticados, recepções especiais e experiências personalizadas, com itens artesanais, regionais e apresentação refinada.",
    bebidas: "Café arábico filtrado; leite quente com opção zero lactose; chocolate quente; chás variados; água mineral com e sem gás; sucos naturais variados — 2 opções; água aromatizada com frutas e ervas.",
    salgados: "Mini croissant; mini sanduíche artesanal; quiches a escolha — Lorraine, gorgonzola, tomate seco ou alho-poró; pão de queijo; torradinhas com patês; cuscuz recheado; beiju recheado com queijo; croque monsieur; pães francês, integral e brioche com ovos mexidos à francesa.",
    doces: "Bolos caseiros; waffles; tortas; frutas selecionadas ou salada de frutas; petit four; bolo de rolo; mungunzá.",
  },
};

// ── Estilos de serviço ──────────────────────────────────────────────────────
export const ESTILO_OPTIONS: MenuOption[] = [
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
export const ENTRADAS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef seleciona as entradas ideais conforme o perfil e o estilo do seu evento." },
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
];

// ── Pratos principais ───────────────────────────────────────────────────────
export const PRINCIPAIS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef define o prato principal ideal conforme o perfil e o estilo do seu evento." },
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
];

// ── Tacho / Paellera ────────────────────────────────────────────────────────
export const TACHO_OPTIONS: MenuOption[] = [
  { value: "Galinhada", label: "Galinhada", desc: "Arroz caldoso com frango caipira, temperos nordestinos e açafrão da terra." },
  { value: "Arroz de Costela Caldoso", label: "Arroz de Costela Caldoso", desc: "Arroz cozido junto à costela bovina, absorvendo colágeno e temperos rústicos." },
  { value: "Arroz Ossobuco à Bourguignon", label: "Arroz Ossobuco à Bourguignon", desc: "Ossobuco braseado em vinho tinto com cenoura, cebola pérola e ervas provençais." },
  { value: "Arroz de Frutos do Mar", label: "Arroz de Frutos do Mar", desc: "Marisco, peixe, camarão e lula em caldo aromático com açafrão e azeite." },
  { value: "Baião de Dois Cremoso", label: "Baião de Dois Cremoso", desc: "Clássico nordestino de feijão verde com arroz, queijo coalho e manteiga de garrafa." },
  { value: "Penne ao Ragù de Pernil", label: "Penne ao Ragù de Pernil", desc: "Molho cremoso de queijo com ragù de pernil desfiado em vinho e ervas aromáticas." },
  { value: "Penne com Paçoca de Carne de Sol", label: "Penne com Paçoca de Carne de Sol", desc: "Creme de queijo coalho e manteiga de garrafa, com carne de sol desfiada e crocante." },
  { value: "Fettuccine com Camarões e Mexilhões", label: "Fettuccine com Camarões e Mexilhões", desc: "Manteiga de ervas frescas com toque de limão siciliano, camarões e mexilhões salteados." },
];

// ── Sobremesas ──────────────────────────────────────────────────────────────
export const SOBREMESAS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef define as sobremesas ideais conforme o perfil e o estilo do seu evento." },
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
];

// Busca a descrição de uma preparação pelo seu "value" (em qualquer categoria).
const TODAS_OPCOES: MenuOption[] = [
  ...ENTRADAS_OPTIONS, ...PRINCIPAIS_OPTIONS, ...TACHO_OPTIONS, ...SOBREMESAS_OPTIONS, ...FEIJOADA_OPTIONS,
];
export function getDescricao(value: string): string {
  return TODAS_OPCOES.find((o) => o.value === value)?.desc || "";
}

// Nome de exibição da feijoada (Tradicional/Premium → "Feijoada Tradicional"...)
export function getFeijoadaLabel(value: string): string {
  return FEIJOADA_OPTIONS.find((o) => o.value === value)?.label || value;
}
