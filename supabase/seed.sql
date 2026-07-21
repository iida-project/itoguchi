-- 開発用シード（交渉用デモ）。§10: 推測情報は is_provisional=true、写真は使わない（*_url は null）。
-- 2 工芸（遠山ふじ糸 / 阿島傘）とも published + 全セクション分のダミーを投入し、正本ページ
-- （docs/06）の全 9 セクションと工程タイムラインを実データで確認できるようにする。
-- RLS（匿名=published のみ / 書込=認証）自体は docs/03 のマイグレーションで担保。
-- 冪等: events / articles は slug unique かつ craft 削除で set null のため、明示削除する。
--       crafts 削除で craft_translations / craft_steps / experiences / spots は cascade。

-- =====================================================================
-- 冪等化: 既存シードを slug ベースで削除（子→親の順）
-- =====================================================================
delete from public.articles where slug in ('fuji-ito-monogatari', 'ajima-gasa-monogatari');
delete from public.events where slug in ('fuji-ito-workshop-2026-06', 'fuji-ito-workshop-2026-08', 'ajima-gasa-workshop-2026-09');
delete from public.crafts where slug in ('toyama-fuji-ito', 'ajima-gasa');
delete from public.groups where slug in ('toyama-fuji-ito-kai', 'ajima-gasa-kai');

-- =====================================================================
-- craft #1: 遠山ふじ糸（published）
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional)
  values ('toyama-fuji-ito', 'published', '飯田市南信濃（遠山郷）', true)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, history, is_published, is_provisional)
select id, 'ja',
  '遠山ふじ糸',
  '山藤の蔓から糸を紡ぐ',
  '遠山郷に伝わる、山藤（ヤマフジ）の蔓の繊維から糸を績（う）む手仕事。衣や袋物の素材として、山の暮らしの中で受け継がれてきました。※内容は確認中の仮テキストです。',
  '遠山郷では古くから、山に自生する藤の蔓を利用して糸や布を作ってきたと伝えられます。化学繊維が普及する以前、身近な植物から素材を得る知恵として山里の暮らしを支えました。近年は保存会を中心に技術の継承が進められています。※史実は確認中の仮テキストです。',
  true, true
from c
union all
select id, 'en',
  'Tōyama Fuji-ito (wisteria-vine thread)',
  'Thread spun from mountain wisteria vines',
  'A handcraft of the Tōyama region: fiber drawn from the vines of mountain wisteria and spun into thread, long used for cloth and bags in mountain life. (Provisional text pending confirmation.)',
  'In the Tōyama region, wild wisteria vines have long been used to make thread and cloth. Before synthetic fibers spread, drawing material from nearby plants supported daily life in the mountains. Today a preservation society leads the effort to pass the technique on. (Historical details pending confirmation.)',
  true, true
from c;

-- 担い手（遠山ふじ糸伝承の会）＋ 公開翻訳
with g as (
  insert into public.groups (slug, address, contact, is_provisional)
  values ('toyama-fuji-ito-kai', '長野県飯田市南信濃和田', '電話でお問い合わせください（※確認中）', true)
  returning id
)
insert into public.group_translations (group_id, locale, name, description, is_published, is_provisional)
select id, 'ja', '遠山ふじ糸伝承の会', '遠山ふじ糸の技術を受け継ぐ会。体験の受け入れも行っています。※確認中', true, true from g
union all
select id, 'en', 'Tōyama Fuji-ito Preservation Society', 'A group carrying on the craft of Tōyama fuji-ito, also welcoming hands-on visitors. (Provisional)', true, true from g;

-- 工程（4 ステップ）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
s as (
  insert into public.craft_steps (craft_id, position, image_url, is_provisional)
  select cr.id, v.position, null, true
  from cr, (values (1), (2), (3), (4)) as v(position)
  returning id, position
)
insert into public.craft_step_translations
  (craft_step_id, locale, title, description, image_alt, is_published, is_provisional)
select s.id, t.locale, t.title, t.description, null, true, true
from s
join (values
  (1, 'ja', '蔓を採取する', '山に入り、山藤の蔓を採取します。採る時期や太さの見極めが仕上がりを左右します。※確認中'),
  (2, 'ja', '繊維を取り出す', '蔓を煮て柔らかくし、内側の繊維をていねいに取り出します。※確認中'),
  (3, 'ja', '繊維を績む', '取り出した繊維を細く裂き、端どうしをつないで一本の長い糸にしていきます。※確認中'),
  (4, 'ja', '糸を撚る', '績んだ繊維に撚りをかけて強い糸に仕上げます。※確認中'),
  (1, 'en', 'Harvest the vines', 'Head into the hills to gather mountain wisteria vines; timing and thickness shape the final thread. (Provisional)'),
  (2, 'en', 'Extract the fibers', 'Simmer the vines to soften them and carefully draw out the inner fibers. (Provisional)'),
  (3, 'en', 'Split and join', 'Split the fibers thin and join them end to end into one long strand. (Provisional)'),
  (4, 'en', 'Twist into thread', 'Add twist to the joined fibers to finish a strong thread. (Provisional)')
) as t(position, locale, title, description) on t.position = s.position;

-- スポット（見る・買う）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
sp as (
  insert into public.spots (craft_id, type, address, is_provisional)
  select cr.id, v.type, v.address, true
  from cr, (values
    ('shop', '長野県飯田市南信濃和田（遠山郷観光案内所）'),
    ('museum', '長野県飯田市南信濃和田（和田城 歴史民俗資料館）')
  ) as v(type, address)
  returning id, type
)
insert into public.spot_translations (spot_id, locale, name, description, is_published, is_provisional)
select sp.id, t.locale, t.name, t.description, true, true
from sp
join (values
  ('shop', 'ja', '遠山郷観光案内所', '遠山ふじ糸の小物などを扱っています。※確認中'),
  ('museum', 'ja', '和田城 歴史民俗資料館', '遠山郷の暮らしと手しごとを紹介する資料館。※確認中'),
  ('shop', 'en', 'Tōyama Tourist Information', 'Carries small goods made from Tōyama fuji-ito. (Provisional)'),
  ('museum', 'en', 'Wada Castle Folk Museum', 'A museum introducing the life and crafts of the Tōyama region. (Provisional)')
) as t(type, locale, name, description) on t.type = sp.type;

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

-- 体験その2（随時受付）＋ 公開翻訳。受付形態フィルタに variety を持たせる
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'anytime', '1,000円〜（※確認中）', '約60分（※確認中）', '事前連絡のうえ来訪', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸の小物づくり体験', '紡いだ藤糸を使って小さな小物づくりを体験できます。随時受け付けています。※確認中', true, true from e
union all
select id, 'en', 'Fuji-ito trinket-making experience', 'Make a small item with spun wisteria thread — available year-round. (Provisional)', true, true from e;

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

-- 過去イベント（published・開催日が過去 → クエリ側で ended 派生）。アーカイブ表示の確認用
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, time_note, venue, address, fee_note, apply_note, is_provisional)
  select cr.id, g.id, 'fuji-ito-workshop-2026-06', 'published',
    date '2026-06-15', '10時頃〜', '遠山郷 和田会館', '長野県飯田市南信濃和田',
    '2,000円（※確認中）', '電話で申し込み（※確認中）', true
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸づくり体験ワークショップ（春）', '遠山ふじ糸の糸づくりを体験できるワークショップ。※確認中', true, true from ev
union all
select id, 'en', 'Fuji-ito thread-making workshop (spring)', 'A workshop to try making Tōyama fuji-ito thread. (Provisional)', true, true from ev;

-- 記事（取材記事・published）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
a as (
  insert into public.articles (craft_id, slug, published_at, thumbnail, is_provisional)
  select cr.id, 'fuji-ito-monogatari', timestamptz '2026-07-10 09:00:00+09', null, true
  from cr
  returning id
)
insert into public.article_translations
  (article_id, locale, title, excerpt, content, thumbnail_alt, is_published, is_provisional)
select id, 'ja',
  '遠山郷、藤の糸をたどって',
  '山藤の蔓から糸が生まれるまで。遠山ふじ糸の担い手を訪ねました。※確認中',
  '（※内容は確認中の仮テキストです）遠山郷に受け継がれる藤糸づくりの現場を訪ねた取材記事。',
  null, true, true
from a
union all
select id, 'en',
  'Following the wisteria thread in Tōyama',
  'How thread is born from mountain wisteria vines: a visit to the makers of Tōyama fuji-ito. (Provisional)',
  '(Provisional text pending confirmation) A visit to the workshop where Tōyama fuji-ito thread is made.',
  null, true, true
from a;

-- =====================================================================
-- craft #2: 阿島傘（published）
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional)
  values ('ajima-gasa', 'published', '下伊那郡喬木村阿島', true)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, history, is_published, is_provisional)
select id, 'ja',
  '阿島傘',
  '喬木村阿島に伝わる和傘',
  '喬木村阿島に伝わる和傘づくり。竹の骨に和紙を貼り、油を引いて仕上げる、実用と美を兼ねた手しごとです。※内容は確認中の仮テキストです。',
  '阿島の和傘づくりは江戸期に始まり、農閑期の手仕事として地域に根づいたと伝えられます。最盛期には多くの傘が作られ、南信州の産物として知られました。現在は数少ない作り手が技術を守っています。※史実は確認中の仮テキストです。',
  true, true
from c
union all
select id, 'en',
  'Ajima-gasa (Japanese umbrella)',
  'Traditional umbrellas of Ajima, Takagi',
  'Traditional Japanese umbrella-making handed down in Ajima, Takagi: washi paper over a bamboo frame, finished with oil — practical and beautiful. (Provisional text pending confirmation.)',
  'Umbrella-making in Ajima is said to have begun in the Edo period as off-season handwork that took root in the community. At its peak many umbrellas were made and known as a product of southern Shinshu. Today a few makers keep the technique alive. (Historical details pending confirmation.)',
  true, true
from c;

-- 担い手（阿島傘保存会）＋ 公開翻訳
with g as (
  insert into public.groups (slug, address, contact, is_provisional)
  values ('ajima-gasa-kai', '長野県下伊那郡喬木村阿島', '電話でお問い合わせください（※確認中）', true)
  returning id
)
insert into public.group_translations (group_id, locale, name, description, is_published, is_provisional)
select id, 'ja', '阿島傘保存会', '阿島傘の技術を受け継ぐ会。制作の見学や体験も受け付けています。※確認中', true, true from g
union all
select id, 'en', 'Ajima-gasa Preservation Society', 'A group carrying on Ajima umbrella-making, welcoming demonstrations and hands-on visits. (Provisional)', true, true from g;

-- 工程（4 ステップ）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
s as (
  insert into public.craft_steps (craft_id, position, image_url, is_provisional)
  select cr.id, v.position, null, true
  from cr, (values (1), (2), (3), (4)) as v(position)
  returning id, position
)
insert into public.craft_step_translations
  (craft_step_id, locale, title, description, image_alt, is_published, is_provisional)
select s.id, t.locale, t.title, t.description, null, true, true
from s
join (values
  (1, 'ja', '竹を割って骨をつくる', '竹をていねいに割り、傘の骨となる細い部材を削り出します。※確認中'),
  (2, 'ja', '骨を組む', '中心の轆轤（ろくろ）に骨を差し込み、傘の骨組みを組み上げます。※確認中'),
  (3, 'ja', '和紙を貼る', '骨組みに和紙を貼り、乾かします。継ぎ目の美しさが職人の技。※確認中'),
  (4, 'ja', '油を引いて仕上げる', '防水のために油を引き、天日で乾かして仕上げます。※確認中'),
  (1, 'en', 'Split bamboo for ribs', 'Split bamboo carefully and shape the slender ribs of the umbrella. (Provisional)'),
  (2, 'en', 'Assemble the frame', 'Fit the ribs into the central hub to build the umbrella frame. (Provisional)'),
  (3, 'en', 'Apply washi paper', 'Paste washi paper onto the frame and let it dry; clean seams show the maker''s skill. (Provisional)'),
  (4, 'en', 'Oil and finish', 'Apply oil for waterproofing and dry in the sun to finish. (Provisional)')
) as t(position, locale, title, description) on t.position = s.position;

-- スポット（見る・買う）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
sp as (
  insert into public.spots (craft_id, type, address, is_provisional)
  select cr.id, v.type, v.address, true
  from cr, (values
    ('museum', '長野県下伊那郡喬木村阿島（阿島傘 展示スペース）')
  ) as v(type, address)
  returning id, type
)
insert into public.spot_translations (spot_id, locale, name, description, is_published, is_provisional)
select sp.id, t.locale, t.name, t.description, true, true
from sp
join (values
  ('museum', 'ja', '阿島傘 展示スペース', '阿島傘の実物を見学できる展示スペース。※確認中'),
  ('museum', 'en', 'Ajima-gasa Exhibition Space', 'A space to see Ajima umbrellas in person. (Provisional)')
) as t(type, locale, name, description) on t.type = sp.type;

-- 体験（要予約）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
g as (
  select id from public.groups where slug = 'ajima-gasa-kai'
),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'request', '3,000円（※確認中）', '約120分（※確認中）', '電話で要予約', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '和傘づくり見学・体験', '阿島傘づくりの工程を見学し、一部を体験できます。※確認中', true, true from e
union all
select id, 'en', 'Umbrella-making tour & experience', 'Watch the Ajima umbrella process and try part of it yourself. (Provisional)', true, true from e;

-- イベント（未来日・published）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
g as (
  select id from public.groups where slug = 'ajima-gasa-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, time_note, venue, address, fee_note, apply_url, apply_note, is_provisional)
  select cr.id, g.id, 'ajima-gasa-workshop-2026-09', 'published',
    date '2026-09-20', '13時頃〜', '喬木村 阿島公民館', '長野県下伊那郡喬木村阿島',
    '3,000円（※確認中）', 'https://example.com/apply', '外部申込フォーム、または電話でも受付（※確認中）', true
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '阿島傘づくりワークショップ', '阿島傘の骨組みや紙貼りを体験できるワークショップ。※確認中', true, true from ev
union all
select id, 'en', 'Ajima-gasa making workshop', 'A workshop to try the frame and paper-pasting of Ajima umbrellas. (Provisional)', true, true from ev;

-- 記事（取材記事・published）＋ 公開翻訳
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
a as (
  insert into public.articles (craft_id, slug, published_at, thumbnail, is_provisional)
  select cr.id, 'ajima-gasa-monogatari', timestamptz '2026-07-05 09:00:00+09', null, true
  from cr
  returning id
)
insert into public.article_translations
  (article_id, locale, title, excerpt, content, thumbnail_alt, is_published, is_provisional)
select id, 'ja',
  '阿島の傘、竹と紙のあいだで',
  '一本の傘ができるまで。阿島傘の作り手を訪ねました。※確認中',
  '（※内容は確認中の仮テキストです）竹と和紙から和傘が生まれる工程を追った取材記事。',
  null, true, true
from a
union all
select id, 'en',
  'Ajima umbrellas, between bamboo and paper',
  'How a single umbrella comes to be: a visit to the makers of Ajima-gasa. (Provisional)',
  '(Provisional text pending confirmation) A report following how a Japanese umbrella is born from bamboo and washi.',
  null, true, true
from a;
