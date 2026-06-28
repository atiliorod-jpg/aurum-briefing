export interface FormState {
  tipo: string | null;
  tipoOutro: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  obsHorario: string;
  cep: string;
  endereco: string;
  distanciaKm: number | null; // preenchido automaticamente pelo LocalStep via Nominatim
  adultos: string;
  criancas: string;
  restricoes: string;
  estilo: string[];
  entradas: string[];
  sugestaoEntradas: string;
  principais: string[];
  sugestaoPrincipais: string;
  tacho: string[];
  tachoPessoas: Record<string, string>;
  sobremesas: string[];
  sugestaoSobremesas: string;
  cardapioPerfil: string[];
  cardapioNaoPodeFaltar: string;
  cardapioEvitar: string;
  feijoada: string | null;
  coffeeBreak: string | null;
  coffeeBreakObs: string;
  // Jantar Harmonizado (menu degustação — sob consulta)
  harmonizadoCursos: string | null;
  harmonizadoVinhos: string | null;
  harmonizadoObs: string;
  // Jantar Temático
  temaJantar: string | null;
  temaJantarProbs: string[];
  temaJantarNaoPodeFaltar: string;
  temaJantarEvitar: string;
  cozinha: string | null;
  mesas: string | null;
  bebidas: string | null;
  bebidasKit: string | null; // kit escolhido quando bebidas === "Incluir Aurum"
  faixa: string | null;
  nome: string;
  whatsapp: string;
  email: string;
  prazo: string;
  obs: string;
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
  distanciaKm: null,
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
  harmonizadoCursos: null,
  harmonizadoVinhos: null,
  harmonizadoObs: "",
  temaJantar: null,
  temaJantarProbs: [],
  temaJantarNaoPodeFaltar: "",
  temaJantarEvitar: "",
  cozinha: null,
  mesas: null,
  bebidas: null,
  bebidasKit: null,
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
  | "harmonizado"
  | "temaJantar"
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

// Coffee Break: sem entradas/principais/tacho/sobremesas e sem bebidas
export const FLUXO_COFFEE: StepName[] = [
  "welcome","tipo","quando","local","convidados","faixa",
  "estilo","coffeeBreak",
  "estrutura","mesas","contato","final",
];
