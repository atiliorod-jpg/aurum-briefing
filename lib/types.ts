export interface FormState {
  tipo: string | null;
  tipoOutro: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  obsHorario: string;
  cep: string;
  endereco: string;
  adultos: string;
  criancas: string;
  restricoes: string;
  estilo: string[];
  entradas: string[];
  sugestaoEntradas: string;
  principais: string[];
  sugestaoPrincipais: string;
  tacho: string[];
  // Quando há 2 tachos, distribui os convidados entre eles. Chave = value do tacho.
  tachoPessoas: Record<string, string>;
  sobremesas: string[];
  sugestaoSobremesas: string;
  // Direcionamento para cardápio sob medida (estilo "Sugestão da Aurum")
  cardapioPerfil: string[];
  cardapioNaoPodeFaltar: string;
  cardapioEvitar: string;
  feijoada: string | null;
  coffeeBreak: string | null;
  coffeeBreakObs: string;
  cozinha: string | null;
  mesas: string | null;
  bebidas: string | null;
  faixa: string | null;
  nome: string;
  whatsapp: string;
  email: string;
  prazo: string;
  obs: string;
  // Campos opcionais para deixar a carta-convite 100% pronta (gera PDF)
  cartaHomenageado: string;
  cartaDataLimite: string;
  cartaAssinatura: string;
}

export const initialState: FormState = {
  tipo: null,
  tipoOutro: "",
  data: "",
  horaInicio: "",
  horaFim: "",
  obsHorario: "",
  cep: "",
  endereco: "",
  adultos: "",
  criancas: "",
  restricoes: "",
  estilo: [],
  entradas: [],
  sugestaoEntradas: "",
  principais: [],
  sugestaoPrincipais: "",
  tacho: [],
  tachoPessoas: {},
  sobremesas: [],
  sugestaoSobremesas: "",
  cardapioPerfil: [],
  cardapioNaoPodeFaltar: "",
  cardapioEvitar: "",
  feijoada: null,
  coffeeBreak: null,
  coffeeBreakObs: "",
  cozinha: null,
  mesas: null,
  bebidas: null,
  faixa: null,
  nome: "",
  whatsapp: "",
  email: "",
  prazo: "",
  obs: "",
  cartaHomenageado: "",
  cartaDataLimite: "",
  cartaAssinatura: "",
};

export type StepName =
  | "welcome"
  | "tipo"
  | "quando"
  | "local"
  | "convidados"
  | "estilo"
  | "entradas"
  | "principais"
  | "tacho"
  | "sobremesas"
  | "sugestao"
  | "feijoada"
  | "coffeeBreak"
  | "estrutura"
  | "mesas"
  | "bebidas"
  | "faixa"
  | "contato"
  | "carta"
  | "final";

export const FLUXO_PADRAO: StepName[] = [
  "welcome","tipo","quando","local","convidados","faixa",
  "estilo","entradas","principais","tacho","sobremesas",
  "estrutura","mesas","bebidas","contato","final",
];

export const FLUXO_SEM_PRINCIPAIS: StepName[] = [
  "welcome","tipo","quando","local","convidados","faixa",
  "estilo","entradas","tacho","sobremesas",
  "estrutura","mesas","bebidas","contato","final",
];

// Feijoada: sem entradas (a feijoada já é completa)
export const FLUXO_FEIJOADA: StepName[] = [
  "welcome","tipo","quando","local","convidados","faixa",
  "estilo","feijoada","sobremesas",
  "estrutura","mesas","bebidas","contato","final",
];

// Coffee Break: escolhido em "estilo de serviço". Sem entradas/principais/tacho/sobremesas
// e sem passo de bebidas (o coffee break já inclui as bebidas).
export const FLUXO_COFFEE: StepName[] = [
  "welcome","tipo","quando","local","convidados","faixa",
  "estilo","coffeeBreak",
  "estrutura","mesas","contato","final",
];
