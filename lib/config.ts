// Configurações centrais da Aurum — altere aqui e vale em todo o app.
// O número pode vir de variável de ambiente (Vercel) ou usa o padrão abaixo.
export const AURUM_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5581998184489";
export const AURUM_EMAIL = "aurumbuffet.eventos@gmail.com";
export const AURUM_NOME = "Aurum Serviços Gastronômicos";

// ── Base de operações (Candeias, Jaboatão dos Guararapes/PE) ────────────────
export const AURUM_CEP = "54430350";
export const AURUM_LAT = -8.1960289;
export const AURUM_LNG = -34.9291341;

// ── Logística (custo de transporte por distância) ────────────────────────────
export const LOGISTICA_CONSUMO_KM_L   = 10;    // km por litro (van/furgão)
export const LOGISTICA_COMBUSTIVEL_RL = 6.50;  // R$ por litro (atualize quando necessário)
export const LOGISTICA_MIN_KM         = 5;     // distâncias abaixo disso não têm cobrança

// ── Fórmula de headcount (ajuste de preço por número de convidados) ──────────
export const FORMULA_BASE_PESSOAS    = 25;     // abaixo disso o preço sobe, acima permanece ou cai
export const FORMULA_TAXA_ACRESCIMO  = 0.02;   // +2% por pessoa abaixo da base
export const FORMULA_CAP_ACRESCIMO   = 0.30;   // máximo de acréscimo: +30%
export const FORMULA_INICIO_DESCONTO = 70;     // a partir daqui o preço começa a cair
export const FORMULA_TAXA_DESCONTO   = 0.002;  // 0,2% por pessoa acima de 70
export const FORMULA_CAP_DESCONTO    = 0.12;   // máximo de desconto: -12%

// ── Custo operacional (equipe adicional de apoio) ─────────────────────────────
export const CUSTO_OP_POR_BLOCO  = 200; // R$ adicionado a cada bloco
export const CUSTO_OP_BLOCO_QTDE = 30;  // tamanho do bloco (pessoas)

// ── Louças e talheres ─────────────────────────────────────────────────────────
// Adicional por pessoa quando a Aurum inclui louças na proposta (pode variar 10–15).
export const ADICIONAL_LOUCAS = 10;
