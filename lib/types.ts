export interface FormState {
  tipo: string | null;
  tipoOutro: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  obsHorario: string;
  endereco: string;
  adultos: string;
  criancas: string;
  restricoes: string;
  estilo: string[];
  entradas: string[];
  principais: string[];
  tacho: string[];
  sobremesas: string[];
  feijoada: string | null;
  coffeeBreak: string | null;
  coffeeBreakObs: string;
  cozinha: string | null;
  mesas: string | null;
  bebidas: string | null;
  faixa: string | null;
  nome: string;
  whatsapp: string;
  prazo: string;
  obs: string;
}

export const initialState: FormState = {
  tipo: null,
  tipoOutro: "",
  data: "",
  horaInicio: "",
  horaFim: "",
  obsHorario: "",
  endereco: "",
  adultos: "",
  criancas: "",
  restricoes: "",
  estilo: [],
  entradas: [],
  principais: [],
  tacho: [],
  sobremesas: [],
  feijoada: null,
  coffeeBreak: null,
  coffeeBreakObs: "",
  cozinha: null,
  mesas: null,
  bebidas: null,
  faixa: null,
  nome: "",
  whatsapp: "",
  prazo: "",
  obs: "",
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
  | "feijoada"
  | "coffeeBreak"
  | "estrutura"
  | "mesas"
  | "bebidas"
  | "faixa"
  | "contato"
  | "final";

export const FLUXO_PADRAO: StepName[] = [
  "welcome","tipo","quando","local","convidados",
  "estilo","entradas","principais","tacho","sobremesas",
  "estrutura","mesas","bebidas","faixa","contato","final",
];

export const FLUXO_SEM_PRINCIPAIS: StepName[] = [
  "welcome","tipo","quando","local","convidados",
  "estilo","entradas","tacho","sobremesas",
  "estrutura","mesas","bebidas","faixa","contato","final",
];

// Feijoada: sem entradas (a feijoada já é completa)
export const FLUXO_FEIJOADA: StepName[] = [
  "welcome","tipo","quando","local","convidados",
  "estilo","feijoada","sobremesas",
  "estrutura","mesas","bebidas","faixa","contato","final",
];

// Coffee Break: cardápio único, sem estilo/entradas/principais/tacho/sobremesas
export const FLUXO_COFFEE: StepName[] = [
  "welcome","tipo","quando","local","convidados",
  "coffeeBreak",
  "estrutura","mesas","bebidas","faixa","contato","final",
];
