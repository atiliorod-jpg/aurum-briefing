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
  preco?: number;       // valor por pessoa no empratado (R$)
  precoBuffet?: number; // valor por pessoa no buffet (quando definido)
  precoVolante?: number; // valor por pessoa no volante (quando definido)
}

// ── Feijoada ────────────────────────────────────────────────────────────────
export const FEIJOADA_OPTIONS: MenuOption[] = [
  { value: "Tradicional", label: "Feijoada Tradicional", desc: "Feijão preto encorpado com cortes selecionados — costelinha, paio, linguiças, bacon, carne seca, pé de porco e lombo suíno — como a tradição manda.", preco: 80 },
  { value: "Premium", label: "Feijoada Premium", desc: "Cada proteína apresentada em travessa individual. Apresentação refinada que valoriza cada ingrediente e permite ao convidado montar o seu prato.", preco: 110 },
];

// ── Coffee Break ─────────────────────────────────────────────────────────────
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

// Preços por pessoa confirmados pelo cliente
export const COFFEE_PRECOS: Record<string, number> = {
  "Coffee Break Simples":     55,
  "Coffee Break Tradicional": 65,
  "Coffee Break Premium":     75,
};

// ── Bebidas em kits ──────────────────────────────────────────────────────────
export interface BebidasKit { value: string; label: string; desc: string; preco: number; }
export const BEBIDAS_KITS: BebidasKit[] = [
  { value: "hidratacao",    label: "Kit Hidratação",    desc: "Água mineral (com e sem gás)",                            preco: 4  },
  { value: "refresco",      label: "Kit Refresco",      desc: "Água + refrigerante (Coca-Cola, Guaraná, Soda)",          preco: 8  },
  { value: "natural",       label: "Kit Natural",       desc: "Água + suco de polpa (1 sabor)",                          preco: 10 },
  { value: "familia",       label: "Kit Família",       desc: "Água + suco (2 sabores) + refrigerante",                  preco: 15 },
  { value: "chopp",         label: "Kit Chopp",         desc: "Chopp artesanal + água mineral",                          preco: 20 },
  { value: "vinho_mesa",    label: "Kit Vinho Mesa",    desc: "Vinho nacional (tinto ou branco) + água",                 preco: 22 },
  { value: "espumante",     label: "Kit Espumante",     desc: "Espumante Brut + água mineral (com e sem gás)",           preco: 28 },
  { value: "vinho_premium", label: "Kit Vinho Premium", desc: "Vinho importado selecionado + água mineral",              preco: 35 },
  { value: "bar_light",     label: "Kit Bar Light",     desc: "Vodka ou gin + mixers + água + gelo",                     preco: 40 },
  { value: "bar_completo",  label: "Kit Bar Completo",  desc: "Destilados variados + cervejas + mixers + água + gelo",  preco: 55 },
];

// ── Jantar Temático — 9 culinárias temáticas ─────────────────────────────────
export interface TemaJantar { value: string; label: string; bandeira: string; classicos: string[]; }
export const TEMAS_JANTAR: TemaJantar[] = [
  { value: "Francesa", label: "Culinária Francesa", bandeira: "🇫🇷",
    classicos: ["Soupe à l'oignon au gratin", "Coq au Vin", "Boeuf Bourguignon",
                "Peixe meunière", "Crêpes Suzette", "Tarte Tatin", "Crème Brûlée"] },
  { value: "Italiana", label: "Culinária Italiana", bandeira: "🇮🇹",
    classicos: ["Bruschetta al pomodoro", "Risotto ai Funghi Porcini",
                "Pappardelle al Ragù", "Saltimbocca alla Romana",
                "Piccata di Vitello", "Tiramisù", "Panna Cotta"] },
  { value: "Argentina", label: "Culinária Argentina", bandeira: "🇦🇷",
    classicos: ["Empanadas (carne/frango/queijo)", "Costela bovina na brasa (Asado)",
                "Chorizo parrillero", "Provoleta grelhada com ervas",
                "Mollejas grelhadas", "Chimichurri", "Alfajores com dulce de leche"] },
  { value: "Espanhola", label: "Culinária Espanhola", bandeira: "🇪🇸",
    classicos: ["Tapas sortidas (croquetas, patatas bravas, pan con tomate)",
                "Paella de frutos do mar", "Gazpacho andaluz",
                "Jamón serrano / Ibérico", "Tortilla española",
                "Churros com chocolate", "Crema Catalana"] },
  { value: "Alemã", label: "Culinária Alemã", bandeira: "🇩🇪",
    classicos: ["Bretzel artesanal", "Charcuterie alemã (embutidos selecionados)",
                "Joelho de porco (Eisbein)", "Bratwurst e Weisswurst",
                "Chucrute (Sauerkraut)", "Strudel de maçã", "Bolo Floresta Negra"] },
  { value: "Indiana", label: "Culinária Indiana", bandeira: "🇮🇳",
    classicos: ["Samosa frita (carne ou legumes)", "Chicken Tikka Masala",
                "Butter Chicken", "Dal Makhani", "Naan artesanal",
                "Arroz Biryani", "Gulab Jamun"] },
  { value: "Mexicana", label: "Culinária Mexicana", bandeira: "🇲🇽",
    classicos: ["Guacamole com tortillas", "Tacos variados (carne, frango, peixe)",
                "Enchiladas com molho mole", "Fajitas com pico de gallo",
                "Quesadillas", "Churros com caramelo", "Tres Leches"] },
  { value: "Tailandesa", label: "Culinária Tailandesa", bandeira: "🇹🇭",
    classicos: ["Tom Kha Gai (sopa cremosa de coco)", "Tom Yum de frutos do mar",
                "Pad Thai", "Green Curry", "Red Curry",
                "Spring Rolls fritos", "Mango Sticky Rice"] },
  { value: "Árabe", label: "Culinária Árabe", bandeira: "🇱🇧",
    classicos: ["Homus com pão pita artesanal", "Fattoush / Tabule",
                "Kafta grelhada", "Kebab de cordeiro ou frango",
                "Couscous marroquino", "Baklava", "Knafeh"] },
];

// ── Estilos de serviço ──────────────────────────────────────────────────────
export const ESTILO_OPTIONS: MenuOption[] = [
  { value: "Serviço à americana (buffet)", label: "Serviço à americana (buffet)", desc: "Pratos dispostos em mesa para servir-se à vontade." },
  { value: "Volante", label: "Volante", desc: "Garçons circulam com bandejas entre os convidados." },
  { value: "Serviço franco-americano (empratado)", label: "Serviço franco-americano (empratado)", desc: "Cada prato montado e servido individualmente à mesa." },
  { value: "Tacho / Paellera", label: "Tacho / Paellera", desc: "Pratos servidos diretamente do tacho, ao centro da mesa." },
  { value: "Feijoada Completa", label: "Feijoada Completa", desc: "Experiência gastronômica completa com todos os acompanhamentos clássicos." },
  { value: "Coffee Break", label: "Coffee Break", desc: "Cardápio dedicado para reuniões, treinamentos, recepções e momentos de pausa." },
  { value: "Jantar Harmonizado", label: "Jantar Harmonizado", desc: "Menu degustação com harmonização de vinhos e bebidas." },
  { value: "Jantar Temático", label: "Jantar Temático", desc: "Cardápio e ambientação criados em torno de um tema culinário." },
  { value: "Sugestão da Aurum", label: "Sugestão da Aurum", desc: "Deixamos o cardápio a nosso cargo, conforme o perfil do evento." },
];

// ── Entradas ────────────────────────────────────────────────────────────────
export const ENTRADAS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef seleciona as entradas ideais conforme o perfil e o estilo do seu evento." },
  { value: "Carpaccio de Vitelo / Filé Mignon", label: "Carpaccio de Vitelo / Filé Mignon", desc: "Finas lâminas com brotos, parmesão, alcaparras e molho djon. Acompanha torradas.", preco: 60 },
  { value: "Carpaccio de Polvo", label: "Carpaccio de Polvo", desc: "Lâminas de polvo com azeite, ervas frescas, aioli e molho djon. Acompanha torradas.", preco: 80 },
  { value: "Caponata de Polvo", label: "Caponata de Polvo", desc: "Releitura italiana com polvo, berinjela, tomate e ervas agridoces. Acompanha torradas.", preco: 70 },
  { value: "Gravlax de Salmão", label: "Gravlax de Salmão", desc: "Salmão curado em sal, beterraba e ervas, com creme azedo e dill. Acompanha torradas.", preco: 75 },
  { value: "Terrine de Salmão", label: "Terrine de Salmão", desc: "Terrine em camadas com ricota e creme de leite fresco, servida fria com molho de acerola.", preco: 65 },
  { value: "Burrata com Tomate Confit", label: "Burrata com Tomate Confit", desc: "Burrata cremosa sobre tomates confitados, redução de balsâmico e flor de sal.", preco: 65 },
  { value: "Salada Parmese", label: "Salada Parmese", desc: "Melão, figo, presunto de Parma, parmesão e amêndoas tostadas com azeite e manjericão roxo.", preco: 50 },
  { value: "Steak Tartare", label: "Steak Tartare", desc: "Filé mignon cortado na ponta da faca com mostarda, alcaparras e ovo de codorna. Acompanha torradas.", preco: 65 },
  { value: "Croqueta de Cupim", label: "Croqueta de Cupim", desc: "Com vinagrete de melão fresco, redução de açaí e aioli de limão siciliano.", preco: 60 },
  { value: "Ceviche de Peixe Branco", label: "Ceviche de Peixe Branco", desc: "Peixe marinado em limão, cebola roxa, coentro e leite de coco. Fusão nordestina com técnica peruana.", preco: 60 },
  { value: "Sem entradas", label: "Sem entradas", desc: "" },
];

// ── Pratos principais ───────────────────────────────────────────────────────
export const PRINCIPAIS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef define o prato principal ideal conforme o perfil e o estilo do seu evento." },
  { value: "Filé Mignon ao Molho de Redução de Vinho Tinto", label: "Filé Mignon ao Molho de Redução de Vinho Tinto", desc: "Filé mignon grelhado com redução de vinho tinto encorpada. Acompanha linguine na manteiga clarificada e ervas, com parmesão ralado na hora (opcional).", preco: 98 },
  { value: "Filé au Poivre com Fettuccine", label: "Filé au Poivre com Fettuccine", desc: "Filé mignon em molho au poivre cremoso, com fettuccine na manteiga clarificada e sálvia fresca.", preco: 88 },
  { value: "Paillard ao Molho Rôti com Linguini", label: "Paillard ao Molho Rôti com Linguini", desc: "Filé aberto e grelhado com molho rôti intenso, acompanhado de linguini ao azeite trufado.", preco: 78 },
  { value: "Magret de Pato ao Molho de Laranja", label: "Magret de Pato ao Molho de Laranja", desc: "Peito de pato com pele crocante, molho à l'orange e purê de batata-doce ao tomilho.", preco: 110 },
  { value: "Codorna Confitada", label: "Codorna Confitada", desc: "Codorna cozida lentamente em gordura, com molho de uvas tintas e aligot ou purê trufado.", preco: 92 },
  { value: "Salmão Grelhado com Risoto de Limão Siciliano", label: "Salmão Grelhado com Risoto de Limão Siciliano", desc: "Salmão grelhado sobre risoto cremoso com raspas cítricas e manteiga noisette.", preco: 95 },
  { value: "Moqueca de Camarão com Pirão", label: "Moqueca de Camarão com Pirão", desc: "Camarões frescos cozidos em leite de coco e dendê, com pirão cremoso e arroz branco.", preco: 90 },
  { value: "Spaghetti au Mare", label: "Spaghetti au Mare", desc: "Massa com lula, polvo, camarão, vongole e mexilhão salteados em azeite, alho e limão siciliano.", preco: 98 },
  { value: "Pappardelle com Ragù de Ossobuco", label: "Pappardelle com Ragù de Ossobuco", desc: "Massa grano duro com ragù de ossobuco cozido lentamente, parmesão e ervas frescas.", preco: 78 },
  { value: "Polpetone com Polenta", label: "Polpetone com Polenta", desc: "Polpetone recheado com funghi e queijo meia cura, sobre polenta cremosa e molho de tomate rústico.", preco: 88 },
  { value: "Lasanha com Fonduta de Queijo", label: "Lasanha com Fonduta de Queijo", desc: "Lasanha bolonhesa em camadas, selada na chapa para crosta dourada e finalizada com fonduta cremosa.", preco: 75 },
];

// ── Tacho / Paellera ────────────────────────────────────────────────────────
export const TACHO_OPTIONS: MenuOption[] = [
  { value: "Galinhada", label: "Galinhada", desc: "Arroz caldoso com frango caipira, temperos nordestinos e açafrão da terra.", preco: 45 },
  { value: "Penne ao Ragù de Pernil", label: "Penne ao molho de queijo com ragù de pernil", desc: "Molho cremoso de queijo com ragù de pernil desfiado em vinho e ervas aromáticas.", preco: 50 },
  { value: "Arroz de Costela Caldoso", label: "Arroz de Costela Caldoso", desc: "Arroz cozido junto à costela bovina, absorvendo colágeno e temperos rústicos.", preco: 55 },
  { value: "Arroz Ossobuco à Bourguignon", label: "Arroz Ossobuco à Bourguignon", desc: "Ossobuco braseado em vinho tinto com cenoura, cebola pérola e ervas provençais.", preco: 60 },
  { value: "Penne com Paçoca de Carne de Sol", label: "Penne ao creme de queijo regional com paçoca de carne de sol", desc: "Creme de queijo coalho e manteiga de garrafa, com carne de sol desfiada e crocante.", preco: 60 },
  { value: "Baião de dois do mar ao sertão", label: "Baião de dois do mar ao sertão", desc: "Do mar ao sertão: feijão verde, queijo coalho e manteiga de garrafa, com camarão.", preco: 65 },
  { value: "Arroz de Frutos do Mar", label: "Arroz de Frutos do Mar", desc: "Marisco, peixe, camarão e lula em caldo aromático com açafrão e azeite.", preco: 70 },
  { value: "Fettuccine com Camarões e Mexilhões", label: "Fettuccine com camarões e mexilhões", desc: "Camarões e mexilhões salteados na manteiga de ervas frescas com toque de limão siciliano.", preco: 75 },
];

// ── Sobremesas ──────────────────────────────────────────────────────────────
export const SOBREMESAS_OPTIONS: MenuOption[] = [
  { value: "Sugestão do chef", label: "✨ Deixar a sugestão com o chef", desc: "Não precisa escolher: o chef define as sobremesas ideais conforme o perfil e o estilo do seu evento." },
  { value: "Crème Brûlée", label: "Crème Brûlée", desc: "Creme de baunilha com crosta fina de açúcar caramelizado na hora.", preco: 38 },
  { value: "Tiramisù", label: "Tiramisù", desc: "Biscoito embebido em café com creme de mascarpone e toque de cacau.", preco: 45 },
  { value: "Petit Gâteau com Sorvete", label: "Petit Gâteau com Sorvete", desc: "Bolinho de chocolate com interior derretido, assado na hora, com sorvete de creme.", preco: 40 },
  { value: "Bolo de Rolo com Sorvete", label: "Bolo de Rolo com Sorvete", desc: "Clássico pernambucano com goiabada cremosa, sorvete artesanal e calda de frutas vermelhas.", preco: 40 },
  { value: "Cheesecake Basque", label: "Cheesecake Basque", desc: "Interior cremoso com topo caramelizado, servido com frutas vermelhas ou ganache.", preco: 39 },
  { value: "Banoffee", label: "Banoffee", desc: "Base crocante com banana, doce de leite cremoso e chantilly.", preco: 32 },
  { value: "Panna Cotta", label: "Panna Cotta", desc: "Creme italiano delicado e sedoso com calda de frutas.", preco: 30 },
  { value: "Tarte Tatin com Chantilly de Baunilha", label: "Tarte Tatin com Chantilly", desc: "Torta francesa invertida de maçã caramelizada com massa folhada dourada e chantilly de baunilha.", preco: 45 },
  { value: "Crêpe Suzette", label: "Crêpe Suzette", desc: "Crêpes flambados em calda de laranja com licor, servidos com sorvete de creme.", preco: 45 },
  { value: "Mousse", label: "Mousse", desc: "Mousse leve (chocolate, maracujá ou outro sabor) com chantilly.", preco: 35 },
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
