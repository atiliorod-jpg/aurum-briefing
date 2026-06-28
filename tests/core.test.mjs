// Testes leves das funções puras críticas (sem framework — roda com `npm test`).
// Executa com tsx para entender os imports .ts.
import assert from "node:assert/strict";
import { formatDate, formatPhone, isPhoneComplete, isEmailValid, shiftHour, sugestaoRSVP, buildWhatsAppMessage, buildWhatsAppLinkText } from "../lib/utils.ts";
import { resolveInvitation, getConector, getTipoFrase, getCardapioName } from "../lib/invitation.ts";
import { estimar, formatBRL, multiplicadorPessoas, calcCustoOperacional, calcCustoLogistica } from "../lib/orcamento.ts";

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ✓", name); }
  catch (e) { console.error("  ✗", name, "\n   ", e.message); process.exitCode = 1; }
}

const base = {
  tipo: "Aniversário", tipoOutro: "", data: "2026-12-12", horaInicio: "19:00", horaFim: "23:00",
  obsHorario: "", cep: "", endereco: "Rua 51", distanciaKm: null,
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
  cozinha: "Sim, completa", mesas: "Local fornece", bebidas: "Bar do local",
  bebidasKit: null, faixa: null,
  nome: "João", whatsapp: "(81)99818-4489", email: "", prazo: "", obs: "",
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
test("base (25 pax) → ×1.00", () => assert.equal(multiplicadorPessoas(25), 1.0));
test("10 pax → ×1.30 (acréscimo +30%, no cap)", () => assert.equal(multiplicadorPessoas(10), 1.30));
test("5 pax → ×1.30 (cap máximo +30%)", () => assert.equal(multiplicadorPessoas(5), 1.30));
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
test("10 km → R$13 (10×2/10×6.50)", () => assert.equal(calcCustoLogistica(10), 13));
test("20 km → R$26 (20×2/10×6.50)", () => assert.equal(calcCustoLogistica(20), 26));

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

test("estimar cardápio completo no empratado (10 pax, mult×1.30)", () => {
  // 10 pax, 50+75+30=155/pax: foodTotal=1550, mult=1.30, op=0, total=2015
  const e = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    estilo: ["Serviço franco-americano (empratado)"],
    entradas: ["Salada Parmese"], principais: ["Lasanha com Fonduta de Queijo"], sobremesas: ["Panna Cotta"] });
  assert.equal(e.porPessoa, 50 + 75 + 30); // 155
  assert.equal(e.multiplicador, 1.30);
  assert.equal(e.custoOperacional, 0);
  assert.equal(e.total, Math.round(1550 * 1.30)); // 2015
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

test("estimar soma adicional de louças (20 pax, mult×1.10)", () => {
  // 20 pax, Galinhada R$45 + louças R$10 = 55/pax: foodTotal=1100, mult=1.10, total=1210
  const e = estimar({ ...base, adultos: "20", mesas: "Incluir Aurum", tacho: ["Galinhada"] });
  assert.equal(e.porPessoa, 45 + 10);
  assert.ok(e.incluiLoucas);
  assert.equal(e.multiplicador, 1.10);
  assert.equal(e.total, Math.round(1100 * 1.10)); // 1210
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

test("estimar Coffee Break Simples + 10 pax (mult×1.30)", () => {
  // porPessoa=55, foodTotal=550, mult=1.30, op=0, total=715
  const e = estimar({ ...base, adultos: "10", coffeeBreak: "Coffee Break Simples",
    estilo: ["Coffee Break"], mesas: "Local fornece" });
  assert.equal(e.porPessoa, 55);
  assert.equal(e.multiplicador, 1.30);
  assert.equal(e.total, Math.round(550 * 1.30)); // 715
});

test("estimar kit de bebidas espumante + 25 pax (mult×1.0)", () => {
  // porPessoa=28, foodTotal=700, mult=1.0, op=0, total=700
  const e = estimar({ ...base, adultos: "25", bebidas: "Incluir Aurum", bebidasKit: "espumante" });
  assert.equal(e.porPessoa, 28);
  assert.equal(e.multiplicador, 1.0);
  assert.equal(e.total, 700);
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

console.log(`\n${passed} testes passaram.`);
