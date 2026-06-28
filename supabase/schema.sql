-- ============================================================================
-- Aurum Briefing — esquema Supabase (projeto compartilhado "estoque controle aurum")
-- Rode este arquivo no Supabase: Dashboard → SQL Editor → New query → Run.
-- Tudo usa prefixo aurum_ para não colidir com as outras tabelas do projeto.
-- ============================================================================

-- ── Tabela de preços/parâmetros editáveis pelo painel /admin ────────────────
-- id segue a convenção do app (lib/overrides.ts):
--   prato/coffee : o próprio "value" (ex: 'Galinhada', 'Coffee Break Simples')
--   kit          : 'kit:<value>' (ex: 'kit:espumante')
--   parâmetro    : 'cfg:<CONSTANTE>' (ex: 'cfg:MINIMO_FATURAVEL_PESSOAS')
create table if not exists public.aurum_precos (
  id          text primary key,
  preco       numeric not null check (preco >= 0),
  rotulo      text,                       -- nome amigável p/ exibir no painel
  categoria   text,                       -- ex: 'tacho', 'kit', 'parametro'
  updated_at  timestamptz not null default now()
);

-- ── Tabela de briefings recebidos (cada conclusão do formulário) ────────────
create table if not exists public.aurum_briefings (
  id          uuid primary key default gen_random_uuid(),
  criado_em   timestamptz not null default now(),
  nome        text,
  whatsapp    text,
  email       text,
  total       numeric,
  pdf_path    text,                        -- caminho no Storage (quando houver)
  dados       jsonb not null               -- FormState completo
);

-- ============================================================================
-- ROW LEVEL SECURITY — protege contra escrita/leitura indevida por terceiros
-- ============================================================================
alter table public.aurum_precos    enable row level security;
alter table public.aurum_briefings enable row level security;

-- Preços: QUALQUER pessoa pode LER (o app público precisa), ninguém pode
-- escrever com a chave pública. Escrita só pela service_role (que ignora RLS),
-- usada exclusivamente na rota server-side do /admin.
drop policy if exists "aurum_precos leitura publica" on public.aurum_precos;
create policy "aurum_precos leitura publica"
  on public.aurum_precos for select
  to anon, authenticated
  using (true);

-- Briefings: o cliente pode INSERIR o próprio briefing, mas NINGUÉM lê com a
-- chave pública (só você, via service_role no painel). Protege dados de leads.
drop policy if exists "aurum_briefings insert publico" on public.aurum_briefings;
create policy "aurum_briefings insert publico"
  on public.aurum_briefings for insert
  to anon, authenticated
  with check (true);

-- (Sem policy de SELECT/UPDATE/DELETE para anon → bloqueado por padrão.)

-- ── Seed opcional dos parâmetros (descomente p/ já aparecerem no painel) ─────
-- Sem seed, o app usa os valores padrão do código — o painel mostra esses
-- padrões e só grava o que você alterar. Seed é só conveniência.
-- insert into public.aurum_precos (id, preco, rotulo, categoria) values
--   ('cfg:MINIMO_FATURAVEL_PESSOAS', 20,   'Mínimo faturável (pessoas)',   'parametro'),
--   ('cfg:ADICIONAL_LOUCAS',         10,   'Adicional de louças (R$/pessoa)', 'parametro'),
--   ('cfg:CUSTO_OP_POR_BLOCO',       200,  'Equipe de apoio (R$/bloco)',   'parametro'),
--   ('cfg:CUSTO_OP_BLOCO_QTDE',      30,   'Tamanho do bloco (pessoas)',   'parametro')
-- on conflict (id) do nothing;
