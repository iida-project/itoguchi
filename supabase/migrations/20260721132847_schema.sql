-- いとぐち コアスキーマ（REQUIREMENTS.md §7）
-- 翻訳は「本体 + *_translations（locale, is_published を保持）」方式で統一する。

-- updated_at を自動更新するトリガ関数（拡張に依存しない）
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =====================================================================
-- crafts（工芸＝正本エンティティ）
-- =====================================================================
create table public.crafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  hero_image_url text,
  region text,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index crafts_status_idx on public.crafts (status);

create table public.craft_translations (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid not null references public.crafts (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  name text not null,
  tagline text,
  overview text,
  history text,
  hero_image_alt text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (craft_id, locale)
);
create index craft_translations_craft_id_idx on public.craft_translations (craft_id);

-- =====================================================================
-- craft_steps（工程）
-- =====================================================================
create table public.craft_steps (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid not null references public.crafts (id) on delete cascade,
  position integer not null,
  image_url text,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index craft_steps_craft_id_position_idx on public.craft_steps (craft_id, position);

create table public.craft_step_translations (
  id uuid primary key default gen_random_uuid(),
  craft_step_id uuid not null references public.craft_steps (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  title text,
  description text,
  image_alt text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (craft_step_id, locale)
);
create index craft_step_translations_step_id_idx on public.craft_step_translations (craft_step_id);

-- =====================================================================
-- groups（担い手＝会・工房）
-- =====================================================================
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  address text,
  lat double precision,
  lng double precision,
  contact text,
  sns_urls text[] not null default '{}',
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_translations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  name text not null,
  description text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, locale)
);
create index group_translations_group_id_idx on public.group_translations (group_id);

-- =====================================================================
-- experiences（随時受付の体験プログラム）
-- =====================================================================
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid not null references public.crafts (id) on delete cascade,
  group_id uuid references public.groups (id) on delete set null,
  availability text not null check (availability in ('anytime', 'seasonal', 'request')),
  price_note text,
  duration_note text,
  season_note text,
  apply_method text,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index experiences_craft_id_idx on public.experiences (craft_id);
create index experiences_group_id_idx on public.experiences (group_id);

create table public.experience_translations (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  title text,
  description text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_id, locale)
);
create index experience_translations_experience_id_idx on public.experience_translations (experience_id);

-- =====================================================================
-- events（日付が決まったイベント）★MVP に含める
-- 終了判定はクエリ側で COALESCE(end_date, start_date) < current_date を用い、
-- レコードは status='published' のまま残す（§7: 削除せずアーカイブ）。
-- =====================================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid references public.crafts (id) on delete set null,
  group_id uuid references public.groups (id) on delete set null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'ended')),
  start_date date not null,
  end_date date,
  time_note text,
  venue text,
  address text,
  lat double precision,
  lng double precision,
  fee_note text,
  capacity_note text,
  apply_url text,
  apply_note text,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_craft_id_idx on public.events (craft_id);
create index events_group_id_idx on public.events (group_id);
create index events_status_start_date_idx on public.events (status, start_date);
create index events_start_date_idx on public.events (start_date);

create table public.event_translations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  title text not null,
  description text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, locale)
);
create index event_translations_event_id_idx on public.event_translations (event_id);

-- =====================================================================
-- spots（見られる・買える場所）
-- =====================================================================
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid not null references public.crafts (id) on delete cascade,
  name text,
  type text not null check (type in ('shop', 'museum', 'other')),
  address text,
  lat double precision,
  lng double precision,
  url text,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index spots_craft_id_idx on public.spots (craft_id);

create table public.spot_translations (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  name text,
  description text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (spot_id, locale)
);
create index spot_translations_spot_id_idx on public.spot_translations (spot_id);

-- =====================================================================
-- articles（取材記事）
-- =====================================================================
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  craft_id uuid references public.crafts (id) on delete set null,
  slug text not null unique,
  thumbnail text,
  published_at timestamptz,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index articles_craft_id_idx on public.articles (craft_id);
create index articles_published_at_idx on public.articles (published_at);

create table public.article_translations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  locale text not null check (locale in ('ja', 'en')),
  title text not null,
  content text,
  excerpt text,
  thumbnail_alt text,
  is_published boolean not null default false,
  is_provisional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, locale)
);
create index article_translations_article_id_idx on public.article_translations (article_id);

-- =====================================================================
-- glossary（工芸用語の対訳集）※管理パネル専用・公開読み取りなし
-- =====================================================================
create table public.glossary (
  id uuid primary key default gen_random_uuid(),
  ja text not null unique,
  en text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- updated_at トリガ（全テーブル）
-- =====================================================================
create trigger set_updated_at before update on public.crafts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.craft_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.craft_steps
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.craft_step_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.groups
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.group_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.experiences
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.experience_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.event_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.spots
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.spot_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.article_translations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.glossary
  for each row execute function public.set_updated_at();
