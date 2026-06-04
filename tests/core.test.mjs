// Testes leves das funções puras críticas (sem framework — roda com `npm test`).
// Executa com tsx para entender os imports .ts.
import assert from "node:assert/strict";
import { formatDate, formatPhone, isPhoneComplete, isEmailValid, shiftHour, sugestaoRSVP, buildWhatsAppMessage, buildWhatsAppLinkText } from "../lib/utils.ts";
import { resolveInvitation, getConector, getTipoFrase, getCardapioName } from "../lib/invitation.ts";
import { estimar, formatBRL } from "../lib/orcamento.ts";

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ✓", name); }
  catch (e) { console.error("  ✗", name, "\n   ", e.message); process.exitCode = 1; }
}

const base = {
  tipo: "Aniversário", tipoOutro: "", data: "2026-12-12", horaInicio: "19:00", horaFim: "23:00",
  obsHorario: "", endereco: "Rua 51", adultos: "50", criancas: "0", restricoes: "",
  estilo: ["Serviço à americana (buffet)"], entradas: [], sugestaoEntradas: "", principais: [],
  sugestaoPrincipais: "", tacho: [], sobremesas: [], sugestaoSobremesas: "",
  cardapioPerfil: [], cardapioNaoPodeFaltar: "", cardapioEvitar: "",
  feijoada: null, coffeeBreak: null, coffeeBreakObs: "", cozinha: "Sim, completa",
  mesas: "Local fornece", bebidas: "Bar do local", faixa: null,
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
  // sem textos longos, o link é igual à mensagem completa
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

console.log("orçamento:");
test("formatBRL", () => assert.equal(formatBRL(2250).replace(/ /g, " "), "R$ 2.250,00"));
test("estimar tacho × pessoas", () => {
  const e = estimar({ ...base, adultos: "50", criancas: "0", mesas: "Local fornece", tacho: ["Galinhada"] });
  assert.equal(e.porPessoa, 45);
  assert.equal(e.pessoas, 50);
  assert.equal(e.total, 2250);
});
test("estimar cardápio completo (entrada+principal+sobremesa)", () => {
  const e = estimar({ ...base, adultos: "10", mesas: "Local fornece",
    entradas: ["Salada Parmese"], principais: ["Lasanha com Fonduta de Queijo"], sobremesas: ["Panna Cotta"] });
  assert.equal(e.porPessoa, 50 + 75 + 30); // 155
  assert.equal(e.total, 1550);
  assert.ok(!e.temItemSemPreco);
});
test("estimar feijoada premium", () => {
  const e = estimar({ ...base, adultos: "30", mesas: "Local fornece", feijoada: "Premium" });
  assert.equal(e.porPessoa, 110);
  assert.equal(e.total, 3300);
});
test("estimar soma adicional de louças (Incluir Aurum)", () => {
  const e = estimar({ ...base, adultos: "20", mesas: "Incluir Aurum", tacho: ["Galinhada"] });
  assert.equal(e.porPessoa, 45 + 10); // prato + louças
  assert.ok(e.incluiLoucas);
  assert.equal(e.total, 1100);
});

console.log(`\n${passed} testes passaram.`);
