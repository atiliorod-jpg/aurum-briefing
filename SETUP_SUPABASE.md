# Painel de preços (Supabase) — guia de ativação

O app já está preparado para ler os preços do Supabase. **Enquanto o banco não
estiver populado, ele usa os preços embutidos no código** — ou seja, nada quebra
e dá pra ativar com calma.

Projeto usado: **"estoque controle aurum"** (`lifiyldinefisedmkayz`).
As tabelas têm prefixo `aurum_` e ficam isoladas das outras por RLS.

## Passo 1 — Criar as tabelas (você faz uma vez)

1. Abra o Supabase → projeto **estoque controle aurum** → **SQL Editor** → **New query**.
2. Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique **Run**.
3. Pronto: cria `aurum_precos` e `aurum_briefings` com segurança (RLS) ativada.

## Passo 2 — Variáveis de ambiente

No **`.env.local`** (já preenchido localmente) e na **Vercel**
(Project → Settings → Environment Variables) garanta:

| Variável | Onde | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | local + Vercel | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | local + Vercel | pública |
| `SUPABASE_SERVICE_ROLE_KEY` | **só Vercel** | **secreta** — Settings → API → service_role |
| `ADMIN_PASSWORD` | **só Vercel** | senha do painel `/admin` |

> ⚠️ A `service_role` e a `ADMIN_PASSWORD` **nunca** levam o prefixo `NEXT_PUBLIC`
> e **nunca** vão para o navegador — ficam só no servidor.

## Passo 3 — Ativar o painel `/admin`

O painel de edição (próxima entrega) lê e grava em `aurum_precos`. Assim que as
tabelas existirem e a `SUPABASE_SERVICE_ROLE_KEY` + `ADMIN_PASSWORD` estiverem na
Vercel, o `/admin` funciona: você edita qualquer preço/parâmetro, salva, e o
formulário público passa a usar o novo valor (com fallback para o padrão).

## Como funciona a segurança

- **Leitura de preços:** pública (o formulário precisa), via RLS `select` liberado.
- **Escrita de preços:** bloqueada para o público; só acontece pela rota
  server-side do `/admin`, autenticada por senha, usando a `service_role`.
- **Briefings recebidos:** o cliente só pode **inserir** o próprio; ninguém lê os
  dados dos leads com a chave pública — só você, pelo painel.
- **Fallback:** se o Supabase estiver fora do ar, o app usa os preços do código.
