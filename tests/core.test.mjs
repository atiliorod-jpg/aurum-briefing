// Testes leves das funções puras críticas (sem framework — roda com `npm test`).
// Executa com tsx para entender os imports .ts.
import assert from "node:assert/strict";
import { formatDate, formatPhone, isPhoneComplete, isEmailValid, shiftHour, sugestaoRSVP, buildWhatsAppMessage, buildWhatsAppLinkText } from "../lib/utils.ts";
import { resolveInvitation, getConector, getTipoFrase, getCardapioName } from "../lib/invitation.ts";
import { estimar, formatBRL, multiplicadorPessoas, calcCustoOperacional, calcCustoLogistica, entradasPessoasCobranca } from "../lib/orcamento.ts";

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ✓", name); }
  catch (e) { console.error("  ✗", name, "\n   ", e.message); process.exitCode = 1; }
}

const base = {
  tipo: "Aniversário", tipoOutro: "", data: "2026-12-12", horaInicio: "19:00", horaFim: "23:00",
  obsHorario: "", cep: "", cepDesconhecido: false, endereco: "Rua 51", distanciaKm: null,
  adultos: "50", criancas: "0", restricoes: "",
  estilo: ["Serviço à americana (buffet)"], entradas: [], sugestaoEntradas: "", principais: [],
  sugestaoPrincipais: "", tacho: [], tachoPessoas: {}, sobremesas: [], sugestaoSobremesas: "",
  cardapioPerfil: [], cardapioNaoPodeFaltar: "", cardapioEvitar: "",
  feijoada: null, coffeeBreak: null, coffeeBreakObs: "",
  harmonizadoCursos: null, harmonizadoVinhos: null, harmonizadoObs: "",
  temaJantar: null, temaJantarProbs: [], temaJantarNaoPodeFaltar: "", temaJantarEvitar: "",
  entradasBuffet: [], sugestaoEntradasBuffet: "",
  principaisBuffet: [], sugestaoPrincipaisBuffet: "",
  sobremesasBuffet: [], sugestaoSobremesasBuffet: "",
  sobremesasRegionais: [], sugestaoSobremesasRegionais: "",
  cozinha: "Sim, completa", cozinhaDesc: "", mesas: "Local fornece", bebidas: "Bar do local",
  bebidasItens: [], entradasPessoas: {},
  nome: "João", whatsapp: "(81)99818-4489", email: "", obs: "",
  cartaHomenageado: "", cartaDataLimite: "", cartaAssinatura: "",
};

console.log("utils:");
test("formatDate", () => assert.equal(formatDate("2026-12-12"), "12/12/2026"));
test("formatPhone celular", () => assert.equal(formatPhone("81998184489"), "(81)99818-4489"));
test("formatPhone fixo", () => assert.equal(formatPhone("8133334444"), "(81)3333-4444"));
test("isPhoneComplete", () => { assert.ok(isPhoneComplete("(81)99818-4489")); assert.ok(!isPhoneComplete("8199")); });
test("isEmailValid", () => { assert.ok(isEmailValid("a@b.com")); assert.ok(!isEmailValid("a@b")); });
test("shiftHour -1", () => assert.equal(shiftHour("19:00", -1), "18:00"));
test("shiftHour vira meia-noite", () => assert.equal(shiftHour("00:30", -1), "23:30"));

console.log("invitation:");
test("getConector empresa fem", () => assert.equal(getConector("Confraternização / Corporativo", "Construtora Anfíbio"), " da "));
test("getConector grupo masc", () => assert.equal(getConector("Confraternização / Corporativo", "Grupo Solar"), " do "));
test("getConector pessoa", () => assert.equal(getConector("Aniversário", "Maria Helena"), " de "));
test("getConector almoço pela", () => assert.equal(getConector("Almoço ou Jantar Privado", "Família Lima"), " promovida pela "));
test("getTipoFrase Outro artigo", () => assert.equal(getTipoFrase("Outro", "Jantar de Noivado"), "o Jantar de Noivado"));
test("getCardapioName feijoada", () => assert.equal(getCardapioName({ ...base, estilo: ["Feijoada Completa"], feijoada: "Premium" }), "Feijoada"));
test("getCardapioName buffet", () => assert.equal(getCardapioName(base), "Cardápio Aurum Especial"));
test("getCardapioName sugestão", () => assert.equal(getCardapioName({ ...base, estilo: ["Sugestão da Aurum"] }), "Cardápio Autoral Aurum"));

console.log("resolveInvitation:");
test("incompleta por padrão", () => assert.equal(resolveInvitation(base).completa, false));
test("completa com 3 campos", () => {
  const c = resolveInvitation({ ...base, cartaHomenageado: "Ana", cartaDataLimite: "8 de junho", cartaAssinatura: "Família X" });
  assert.equal(c.completa, true);
  assert.ok(!c.nome.includes("["));
});
test("Outro completa", () => {
  const c = resolveInvitation({ ...base, tipo: "Outro", tipoOutro: "Chá de Bebê", cartaHomenageado: "Lima", cartaDataLimite: "8 de junho", cartaAssinatura: "Família" });
  assert.equal(c.completa, true);
});

console.log("whatsapp:");
test("mensagem contém seções", () => {
  const m = buildWhatsAppMessage(base);
  assert.ok(m.includes("BRIEFING DE EVENTO"));
  assert.ok(m.includes("CARDÁPIO"));
  assert.ok(m.includes("Louças e talheres"));
});
test("link curto: evento normal usa versão completa", () => {
  assert.equal(buildWhatsAppLinkText(base), buildWhatsAppMessage(base));
});
test("link curto: briefing enorme compacta e mantém restrições", () => {
  const grande = "x".repeat(600);
  const cheio = {
    ...base, restricoes: "Alergia a frutos do mar",
    sugestaoEntradas: grande, sugestaoPrincipais: grande, sugestaoSobremesas: grande, obs: grande,
    entradas: ["Carpaccio de Polvo"], principais: ["Spaghetti au Mare"], sobremesas: ["Tiramisù"],
  };
  const link = buildWhatsAppLinkText(cheio);
  const full = buildWhatsAppMessage(cheio);
  assert.ok(link.length < full.length, "link deve ser menor que a versão completa");
  assert.ok(!link.includes(grande), "não deve conter o texto livre gigante");
  assert.ok(link.includes("Alergia a frutos do mar"), "deve manter restrições alimentares");
  assert.ok(link.includes("completas no resumo"), "deve avisar que o resto está no PDF/Word");
});

console.log("multiplicadorPessoas:");
test("25 pax → ×1.00", () => assert.equal(multiplicadorPessoas(25), 1.0));
test("10 pax → ×1.00 (grupo pequeno tratado por faturamento mínimo, não %)", () => assert.equal(multiplicadorPessoas(10), 1.0));
test("5 pax → ×1.00 (sem acréscimo percentual)", () => assert.equal(multiplicadorPessoas(5), 1.0));
test("30 pax → ×1.00 (sem desconto antes de 70)", () => assert.equal(multiplicadorPessoas(30), 1.0));
test("70 pax → ×1.00 (limiar do desconto)", () => assert.equal(multiplicadorPessoas(70), 1.0));
test("100 pax → ×0.94 (−6%)", () => assert.equal(multiplicadorPessoas(100), 0.94));
test("130 pax → ×0.88 (cap mínimo −12%)", () => assert.equal(multiplicadorPessoas(130), 0.88));

console.log("calcCustoOperacional:");
test("25 pax → R$0 (menos de 30)", () => assert.equal(calcCustoOperacional(25), 0));
test("30 pax → R$200 (1 bloco)", () => assert.equal(calcCustoOperacional(30), 200));
test("59 pax → R$200 (ainda 1 bloco)", () => assert.equal(calcCustoOperacional(59), 200));
test("60 pax → R$400 (2 blocos)", () => assert.equal(calcCustoOperacional(60), 400));
test("90 pax → R$600 (3 blocos)", () => assert.equal(calcCustoOperacional(90), 600));

console.log("calcCustoLogistica:");
test("null → R$0", () => assert.equal(calcCustoLogistica(null), 0));
test("3 km → R$0 (abaixo do mínimo de 5 km)", () => assert.equal(calcCustoLogistica(3), 0));
test("10 km → R$30 (transporte 20 × 1,35 = 27, ceil p/ cima p/ 30)", () => assert.equal(calcCustoLogistica(10), 30));
test("20 km → R$55 (transporte 40 × 1,35 = 54, ceil p/ cima p/ 55)", () => assert.equal(calcCustoLogistica(20), 55));
test("8 km → R$25 (transporte 16 × 1,35 = 21,6, ceil p/ cima p/ 25)", () => assert.equal(calcCustoLogistica(8), 25));

console.log("orçamento:");
test("formatBRL", () => assert.equal(formatBRL(2250).replace(/[\s  ]/g, " "), "R$ 2.250,00"));

test("estimar tacho × pessoas (50 pax, mult×1.0 + R$200 operacional)", () => {
  // 50 pax, Galinhada R$45: foodTotal=2250, mult=1.0, op=200, total=2450
  const e = estimar({ ...base, adultos: "50", criancas: "0", mesas: "Local fornece", tacho: ["Galinhada"] });
  assert.equal(e.porPessoa, 45);
  assert.equal(e.pessoas, 50);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.custoOperacional, 200);
  assert.equal(e.total, 2450);
});

test("estimar cardápio completo no empratado (10 pax → faturado como 20)", () => {
  // 10 pax, 50+75+30=155/pax, faturado por 20: foodTotal=3100, mult=1.0, op=0, total=3100
  const e = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Salada Parmese"], principais: ["Lasanha com Fonduta de Queijo"], sobremesas: ["Panna Cotta"] });
  assert.equal(e.porPessoa, 50 + 75 + 30); // 155
  assert.equal(e.pessoas, 10);
  assert.equal(e.pessoasFaturaveis, 20);
  assert.ok(e.aplicouMinimo);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.custoOperacional, 0);
  assert.equal(e.total, 155 * 20); // 3100
  assert.ok(!e.temItemSemPreco);
});

test("sem empratado, cardápio não é precificado ainda", () => {
  const e = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    estilo: ["Serviço à americana (buffet)"],
    entradas: ["Salada Parmese"], principais: ["Lasanha com Fonduta de Queijo"] });
  assert.equal(e.porPessoa, 0);
});

test("estimar feijoada premium (30 pax, mult×1.0 + R$200 operacional)", () => {
  // 30 pax, R$110/pax: foodTotal=3300, mult=1.0, op=200, total=3500
  const e = estimar({ ...base, adultos: "30", mesas: "Local fornece", feijoada: "Premium" });
  assert.equal(e.porPessoa, 110);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.custoOperacional, 200);
  assert.equal(e.total, 3500);
});

test("estimar soma adicional de louças (20 pax, mult×1.00)", () => {
  // 20 pax (no piso mínimo), Galinhada R$45 + louças R$10 = 55/pax: foodTotal=1100, mult=1.0, total=1100
  const e = estimar({ ...base, adultos: "20", mesas: "Incluir Aurum", tacho: ["Galinhada"] });
  assert.equal(e.porPessoa, 45 + 10);
  assert.ok(e.incluiLoucas);
  assert.ok(!e.aplicouMinimo);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.total, 1100);
});

test("estimar 2 tachos com distribuicao por convidados (70 pax, mult×1.0 + R$400 operacional)", () => {
  // 70 pax, Galinhada(30)×45 + Arroz(40)×55 = 1350+2200 = 3550 tacho, op=400, total=3950
  const e = estimar({
    ...base, adultos: "70", criancas: "0", mesas: "Local fornece",
    tacho: ["Galinhada", "Arroz de Costela Caldoso"],
    tachoPessoas: { "Galinhada": "30", "Arroz de Costela Caldoso": "40" },
  });
  assert.equal(e.pessoas, 70);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.custoOperacional, 400);
  assert.equal(e.total, 3950);
  assert.equal(e.porPessoa, 0);
});

test("estimar 2 tachos + loucas (70 pax)", () => {
  // foodTotal = louças×70 + tacho3550 = 700+3550=4250, mult=1.0, op=400, total=4650
  const e = estimar({
    ...base, adultos: "70", criancas: "0", mesas: "Incluir Aurum",
    tacho: ["Galinhada", "Arroz de Costela Caldoso"],
    tachoPessoas: { "Galinhada": "30", "Arroz de Costela Caldoso": "40" },
  });
  assert.equal(e.total, 4650);
  assert.equal(e.porPessoa, 10);
  assert.ok(e.incluiLoucas);
});

test("estimar Coffee Break Simples + 10 pax (faturado como 20)", () => {
  // porPessoa=55, faturado por 20: foodTotal=1100, mult=1.0, op=0, total=1100
  const e = estimar({ ...base, adultos: "10", coffeeBreak: "Coffee Break Simples",
    estilo: ["Coffee Break"], mesas: "Local fornece" });
  assert.equal(e.porPessoa, 55);
  assert.equal(e.pessoasFaturaveis, 20);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.total, 1100);
});

test("estimar bebidas individuais (água R$3 + suco R$5 = R$8) + 25 pax", () => {
  // custoBebidas = (3+5) * 25 = 200; foodTotal=0, total=200
  const e = estimar({ ...base, adultos: "25", bebidas: "Incluir Aurum", bebidasItens: ["agua", "suco"] });
  assert.equal(e.custoBebidas, 200);
  assert.equal(e.porPessoa, 0);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.total, 200);
});

test("estimar desconto grande grupo (100 pax, mult×0.94)", () => {
  // Galinhada R$45 × 100 pax, foodTotal=4500, mult=0.94, op=600, total=4830
  const e = estimar({ ...base, adultos: "100", tacho: ["Galinhada"] });
  assert.equal(e.multiplicador, 0.94);
  assert.equal(e.custoOperacional, 600);
  assert.equal(e.total, Math.round(4500 * 0.94) + 600); // 4230+600=4830
});

test("estimar buffet: entradas + principal + sobremesa (25 pax, mult×1.00)", () => {
  // Tábua R$35 + Picanha R$58 + Mini Bolo R$22 = 115/pax, foodTotal=2875, mult=1.0, op=0
  const e = estimar({ ...base, adultos: "25", mesas: "Local fornece",
    estilo: ["Serviço à americana (buffet)"],
    entradasBuffet: ["Tábua de Queijo Coalho"],
    principaisBuffet: ["Picanha na Brasa com Farofa de Rapadura"],
    sobremesasBuffet: ["Mini Bolo de Rolo com Chantilly"] });
  assert.equal(e.porPessoa, 35 + 58 + 22); // 115
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.total, 2875);
  assert.ok(!e.temItemSemPreco);
});

test("buffet usa MÉDIA por categoria (2 entradas + 2 principais + 2 sobremesas)", () => {
  // entradas média (35+40)/2=37.5; principais (58+42)/2=50; sobremesas (22+18)/2=20 → 107.5/pax
  const e = estimar({ ...base, adultos: "50", mesas: "Local fornece",
    estilo: ["Serviço à americana (buffet)"],
    entradasBuffet: ["Tábua de Queijo Coalho", "Bolinho de Aratu"],
    principaisBuffet: ["Picanha na Brasa com Farofa de Rapadura", "Frango Caipira ao Coco e Dendê"],
    sobremesasBuffet: ["Mini Bolo de Rolo com Chantilly", "Brigadeiro Gourmet de Rapadura"] });
  assert.equal(e.porPessoa, 37.5 + 50 + 20); // 107.5 (não 215 da soma)
  assert.ok(!e.aplicouMinimo);
});

test("faturamento mínimo: 7 pax cobrados como 20", () => {
  const e = estimar({ ...base, adultos: "7", criancas: "0", mesas: "Local fornece", tacho: ["Galinhada"] });
  assert.equal(e.pessoas, 7);
  assert.equal(e.pessoasFaturaveis, 20);
  assert.ok(e.aplicouMinimo);
  assert.equal(e.total, 45 * 20); // 900
});

test("estimar sobremesas regionais com feijoada (30 pax, mult×1.00)", () => {
  // Feijoada Premium R$110 + Cartola R$24 = 134/pax, foodTotal=4020, mult=1.0, op=200
  const e = estimar({ ...base, adultos: "30", mesas: "Local fornece",
    estilo: ["Feijoada Completa"],
    feijoada: "Premium",
    sobremesasRegionais: ["Cartola"] });
  assert.equal(e.porPessoa, 110 + 24); // 134
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.custoOperacional, 200);
  assert.equal(e.total, Math.round(4020 * 1.0) + 200); // 4220
});

test('"Sem sobremesa regional" não entra no cálculo', () => {
  const e = estimar({ ...base, adultos: "30", mesas: "Local fornece",
    estilo: ["Feijoada Completa"], feijoada: "Tradicional",
    sobremesasRegionais: ["Sem sobremesa regional"] });
  assert.equal(e.porPessoa, 80); // só a feijoada
  assert.ok(!e.temItemSemPreco);
});

console.log("entradas distribuídas + mínimo faturável:");
test("distribuição de cobrança escala para o mínimo (10 pax 5/5 → 10/10)", () => {
  const c = entradasPessoasCobranca({ ...base, adultos: "10",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Carpaccio de Polvo", "Caponata de Polvo"],
    entradasPessoas: { "Carpaccio de Polvo": "5", "Caponata de Polvo": "5" } });
  assert.equal(c["Carpaccio de Polvo"], 10);
  assert.equal(c["Caponata de Polvo"], 10);
});

test("distribuição de cobrança soma exatamente o mínimo (7 pax 4/3 → 11/9)", () => {
  const c = entradasPessoasCobranca({ ...base, adultos: "7",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Carpaccio de Polvo", "Caponata de Polvo"],
    entradasPessoas: { "Carpaccio de Polvo": "4", "Caponata de Polvo": "3" } });
  assert.equal(c["Carpaccio de Polvo"] + c["Caponata de Polvo"], 20);
  assert.equal(c["Carpaccio de Polvo"], 11); // 4×20/7=11,43 → 11
  assert.equal(c["Caponata de Polvo"], 9);   // 3×20/7=8,57 → 9 (maior resto)
});

test("distribuição de cobrança = real quando grupo ≥ 20 (30 pax 15/15)", () => {
  const c = entradasPessoasCobranca({ ...base, adultos: "30",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Carpaccio de Polvo", "Caponata de Polvo"],
    entradasPessoas: { "Carpaccio de Polvo": "15", "Caponata de Polvo": "15" } });
  assert.equal(c["Carpaccio de Polvo"], 15);
  assert.equal(c["Caponata de Polvo"], 15);
});

test("2 entradas em grupo pequeno respeitam o mínimo faturável (sem furo de preço)", () => {
  // 10 pax, Carpaccio R$80 (5) + Caponata R$70 (5) → cobrado 80×10 + 70×10 = 1500
  // (antes do fix: 80×5 + 70×5 = 750 — metade do preço de 1 entrada sozinha)
  const e = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Carpaccio de Polvo", "Caponata de Polvo"],
    entradasPessoas: { "Carpaccio de Polvo": "5", "Caponata de Polvo": "5" } });
  assert.equal(e.entradasSubtotal, 80 * 10 + 70 * 10); // 1500
  assert.ok(e.aplicouMinimo);
  assert.equal(e.total, 1500);
  // Coerência: 1 entrada sozinha (80×20=1600) não pode ser mais cara que 2 distribuídas + margem
  const umaEntrada = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Carpaccio de Polvo"] });
  assert.equal(umaEntrada.total, 80 * 20); // 1600
  assert.ok(e.total >= umaEntrada.total * 0.9, "2 entradas não podem custar menos que ~1 entrada");
});

console.log(`\n${passed} testes passaram.`);
