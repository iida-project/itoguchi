-- 開発用の最小シード（交渉用デモの 2 団体・ダミー内容）。
-- §10: 推測情報は is_provisional=true、写真は使わない（hero_image_url は null）。
-- craft #1（遠山ふじ糸）は published + 公開翻訳、craft #2（阿島傘）は draft のまま
-- として、匿名では #1 のみ見えることを検証できるようにする。
-- 本番の公開制御（noindex/robots/status 切替）はデプロイ側の別チケット。

-- 冪等化のため既存のシードを一旦削除（slug ベース）
delete from public.crafts where slug in ('toyama-fuji-ito', 'ajima-gasa');
delete from public.groups where slug in ('toyama-fuji-ito-kai');

-- =====================================================================
-- craft #1: 遠山ふじ糸（published・公開）
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional)
  values ('toyama-fuji-ito', 'published', '飯田市南信濃（遠山郷）', true)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, is_published, is_provisional)
select id, 'ja',
  '遠山ふじ糸',
  '山藤の蔓から糸を紡ぐ',
  '遠山郷に伝わる、山藤（ヤマフジ）の蔓の繊維から糸を績（う）む手仕事。※内容は確認中の仮テキストです。',
  true, true
from c
union all
select id, 'en',
  'Tōyama Fuji-ito (wisteria-vine thread)',
  'Thread spun from mountain wisteria vines',
  'A handcraft of the Tōyama region: fiber drawn from the vines of mountain wisteria and spun into thread. (Provisional text pending confirmation.)',
  true, true
from c;

-- 担い手（遠山ふじ糸伝承の会）＋ 公開翻訳
with g as (
  insert into public.groups (slug, address, contact, is_provisional)
  values ('toyama-fuji-ito-kai', '長野県飯田市南信濃', null, true)
  returning id
)
insert into public.group_translations (group_id, locale, name, description, is_published, is_provisional)
select id, 'ja', '遠山ふじ糸伝承の会', '遠山ふじ糸の技術を受け継ぐ会。※確認中', true, true from g
union all
select id, 'en', 'Tōyama Fuji-ito Preservation Society', 'A group carrying on the craft of Tōyama fuji-ito. (Provisional)', true, true from g;

-- 体験（随時受付）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'request', '2,000円（※確認中）', '約90分（※確認中）', '電話またはメールで要予約', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸づくり体験', '山藤の蔓から糸を績む工程を体験できます。※確認中', true, true from e
union all
select id, 'en', 'Fuji-ito thread-making experience', 'Try spinning thread from mountain wisteria vines. (Provisional)', true, true from e;

-- イベント（未来日・published）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, time_note, venue, address, fee_note, apply_note, is_provisional)
  select cr.id, g.id, 'fuji-ito-workshop-2026-08', 'published',
    date '2026-08-23', '10時頃〜', '遠山郷 和田会館', '長野県飯田市南信濃和田',
    '2,000円（※確認中）', '電話で申し込み（※確認中）', true
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸づくり体験ワークショップ', '遠山ふじ糸の糸づくりを体験できるワークショップ。※確認中', true, true from ev
union all
select id, 'en', 'Fuji-ito thread-making workshop', 'A workshop to try making Tōyama fuji-ito thread. (Provisional)', true, true from ev;

-- =====================================================================
-- craft #2: 阿島傘（draft・非公開）→ 匿名からは見えないことの確認用
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional)
  values ('ajima-gasa', 'draft', '下伊那郡喬木村阿島', true)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, is_published, is_provisional)
select id, 'ja', '阿島傘', '喬木村阿島に伝わる和傘', '阿島に伝わる和傘づくり。※内容は確認中の仮テキストです。', true, true
from c
union all
select id, 'en', 'Ajima-gasa (Japanese umbrella)', 'Traditional umbrellas of Ajima, Takagi', 'Traditional Japanese umbrella-making handed down in Ajima. (Provisional text pending confirmation.)', true, true
from c;
