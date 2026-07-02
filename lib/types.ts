export interface FormState {
  tipo: string | null;
  tipoOutro: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  obsHorario: string;
  cep: string;
  cepDesconhecido: boolean; // cliente marcou "não sei o CEP" — libera só com endereço
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
  // Cardápio Buffet / Volante
  entradasBuffet: string[];
  sugestaoEntradasBuffet: string;
  principaisBuffet: string[];
  sugestaoPrincipaisBuffet: string;
  sobremesasBuffet: string[];
  sugestaoSobremesasBuffet: string;
  // Sobremesas Regionais (Feijoada + Tacho)
  sobremesasRegionais: string[];
  sugestaoSobremesasRegionais: string;
  cozinha: string | null;
  cozinhaDesc: string;       // descrição da estrutura quando cozinha === "Parcial"
  mesas: string | null;
  bebidas: string | null;
  bebidasItens: string[];    // itens individuais selecionados quando bebidas === "Incluir Aurum"
  entradasPessoas: Record<string, string>; // distribuição de convidados por entrada (empratado c/ 2 entradas)
  nome: string;
  whatsapp: string;
  email: string;
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
  cepDesconhecido: false,
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
  entradasBuffet: [],
  sugestaoEntradasBuffet: "",
  principaisBuffet: [],
  sugestaoPrincipaisBuffet: "",
  sobremesasBuffet: [],
  sugestaoSobremesasBuffet: "",
  sobremesasRegionais: [],
  sugestaoSobremesasRegionais: "",
  cozinha: null,
  cozinhaDesc: "",
  mesas: null,
  bebidas: null,
  bebidasItens: [],
  entradasPessoas: {},
  nome: "",
  whatsapp: "",
  email: "",
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
  | "entradasBuffet"
  | "principaisBuffet"
  | "sobremesasBuffet"
  | "sobremesasRegionais"
  | "tacho"
  | "sobremesas"
  | "sugestao"
  | "feijoada"
  | "coffeeBreak"
  | "harmonizado"
  | "temaJantar"
  | "estrutura"
  | "contato"
  | "carta"
  | "final";

// O fluxo real de passos é montado dinamicamente por resolveFluxo() em
// components/BriefingWizard.tsx, conforme os estilos de serviço escolhidos.
