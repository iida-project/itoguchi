-- RLS（REQUIREMENTS.md §7）
-- 匿名（anon）: published のみ SELECT。認証（authenticated）: 全操作。
-- RLS を有効化した時点でポリシー未定義のロールはデフォルト拒否。
-- 子テーブル・翻訳は親エンティティの公開状態を EXISTS で二重確認し、draft 親の内容が漏れないようにする。

-- 全テーブルで RLS 有効化
alter table public.crafts                  enable row level security;
alter table public.craft_translations      enable row level security;
alter table public.craft_steps             enable row level security;
alter table public.craft_step_translations enable row level security;
alter table public.groups                  enable row level security;
alter table public.group_translations      enable row level security;
alter table public.experiences             enable row level security;
alter table public.experience_translations enable row level security;
alter table public.events                  enable row level security;
alter table public.event_translations      enable row level security;
alter table public.spots                   enable row level security;
alter table public.spot_translations       enable row level security;
alter table public.articles                enable row level security;
alter table public.article_translations    enable row level security;
alter table public.glossary                enable row level security;

-- =====================================================================
-- authenticated: 全テーブル全操作（管理パネル）
-- =====================================================================
create policy authenticated_all on public.crafts                  for all to authenticated using (true) with check (true);
create policy authenticated_all on public.craft_translations      for all to authenticated using (true) with check (true);
create policy authenticated_all on public.craft_steps             for all to authenticated using (true) with check (true);
create policy authenticated_all on public.craft_step_translations for all to authenticated using (true) with check (true);
create policy authenticated_all on public.groups                  for all to authenticated using (true) with check (true);
create policy authenticated_all on public.group_translations      for all to authenticated using (true) with check (true);
create policy authenticated_all on public.experiences             for all to authenticated using (true) with check (true);
create policy authenticated_all on public.experience_translations for all to authenticated using (true) with check (true);
create policy authenticated_all on public.events                  for all to authenticated using (true) with check (true);
create policy authenticated_all on public.event_translations      for all to authenticated using (true) with check (true);
create policy authenticated_all on public.spots                   for all to authenticated using (true) with check (true);
create policy authenticated_all on public.spot_translations       for all to authenticated using (true) with check (true);
create policy authenticated_all on public.articles                for all to authenticated using (true) with check (true);
create policy authenticated_all on public.article_translations    for all to authenticated using (true) with check (true);
create policy authenticated_all on public.glossary                for all to authenticated using (true) with check (true);

-- =====================================================================
-- anon: 公開行のみ SELECT
-- =====================================================================

-- crafts / events / articles: 自身の公開状態で判定
create policy anon_select_published on public.crafts
  for select to anon
  using (status = 'published');

create policy anon_select_published on public.events
  for select to anon
  using (status in ('published', 'ended'));

create policy anon_select_published on public.articles
  for select to anon
  using (published_at is not null and published_at <= now());

-- 工芸配下のベース（craft_steps / experiences / spots）: 親 craft が published
create policy anon_select_published on public.craft_steps
  for select to anon
  using (exists (
    select 1 from public.crafts c
    where c.id = craft_steps.craft_id and c.status = 'published'
  ));

create policy anon_select_published on public.experiences
  for select to anon
  using (exists (
    select 1 from public.crafts c
    where c.id = experiences.craft_id and c.status = 'published'
  ));

create policy anon_select_published on public.spots
  for select to anon
  using (exists (
    select 1 from public.crafts c
    where c.id = spots.craft_id and c.status = 'published'
  ));

-- groups: 公開翻訳を持つ担い手のみ
create policy anon_select_published on public.groups
  for select to anon
  using (exists (
    select 1 from public.group_translations gt
    where gt.group_id = groups.id and gt.is_published
  ));

-- *_translations: is_published かつ 親エンティティが公開
create policy anon_select_published on public.craft_translations
  for select to anon
  using (
    is_published and exists (
      select 1 from public.crafts c
      where c.id = craft_translations.craft_id and c.status = 'published'
    )
  );

create policy anon_select_published on public.craft_step_translations
  for select to anon
  using (
    is_published and exists (
      select 1
      from public.craft_steps s
      join public.crafts c on c.id = s.craft_id
      where s.id = craft_step_translations.craft_step_id and c.status = 'published'
    )
  );

create policy anon_select_published on public.group_translations
  for select to anon
  using (is_published);

create policy anon_select_published on public.experience_translations
  for select to anon
  using (
    is_published and exists (
      select 1
      from public.experiences e
      join public.crafts c on c.id = e.craft_id
      where e.id = experience_translations.experience_id and c.status = 'published'
    )
  );

create policy anon_select_published on public.event_translations
  for select to anon
  using (
    is_published and exists (
      select 1 from public.events ev
      where ev.id = event_translations.event_id and ev.status in ('published', 'ended')
    )
  );

create policy anon_select_published on public.spot_translations
  for select to anon
  using (
    is_published and exists (
      select 1
      from public.spots sp
      join public.crafts c on c.id = sp.craft_id
      where sp.id = spot_translations.spot_id and c.status = 'published'
    )
  );

create policy anon_select_published on public.article_translations
  for select to anon
  using (
    is_published and exists (
      select 1 from public.articles a
      where a.id = article_translations.article_id
        and a.published_at is not null and a.published_at <= now()
    )
  );

-- glossary: anon ポリシーなし（＝匿名は読めない。管理パネル専用）
