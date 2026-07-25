-- 交渉用デモのシード（docs/15 / REQUIREMENTS §10）。
--
-- 文章は**公開情報をもとに書き起こしたもの**で、出典は docs/15-seed-content.md の
-- 「出典」節に記述と URL の対応を残してある。裏が取れない固有名詞・数値は書かない。
-- `is_provisional = true` を立てるのは §10-1 の定義どおり**推測で補った箇所**
-- （料金・所要時間・定員・開催日）だけ。出典のある記述には立てない。
--
-- 写真は 1 枚も使わない（許可取得前は他者の写真を使用しない）。`*_url` は null のまま。
-- RLS（匿名=published のみ / 書込=認証）は docs/03 のマイグレーションで担保。
--
-- 冪等: events / articles は slug unique かつ craft 削除で set null のため、明示削除する。
--       crafts 削除で craft_translations / craft_steps / experiences / spots は cascade。
-- ※ このファイルの全実行は crafts を delete → insert するため子テーブルの UUID が
--   総入れ替えになる。**既存のリモート DB には流さず、slug/position/locale 条件の
--   差分 update を使う**（docs/15 / docs/18 のメモ）。

-- =====================================================================
-- 冪等化: 既存シードを slug ベースで削除（子→親の順）
-- =====================================================================
delete from public.articles where slug in ('fuji-ito-monogatari', 'ajima-gasa-monogatari');
delete from public.events where slug in (
  'fuji-ito-workshop-2026-06', 'fuji-ito-workshop-2026-08', 'ajima-gasa-workshop-2026-09',
  'fuji-ito-10th-exhibition-2025', 'fuji-ito-thread-workshop-2026', 'ajima-gasa-summer-class-2026'
);
delete from public.crafts where slug in ('toyama-fuji-ito', 'ajima-gasa');
delete from public.groups where slug in ('toyama-fuji-ito-kai', 'ajima-gasa-kai');

-- =====================================================================
-- craft #1: 遠山ふじ糸（published）
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional, name_latin, admin_note)
  values ('toyama-fuji-ito', 'published', '飯田市南信濃（遠山郷）', false,
    'Tōyama Fuji-ito — wisteria-vine thread',
    $$出典: 遠山ふじ糸伝承の会 公式 https://fujiitonokai.jimdofree.com/ ／ 信州遠山郷 https://tohyamago.com/archives/340 ／ 南信州新聞 2025-10-30 https://minamishinshu.jp/2025/10/30/759832/ ／ 中日新聞 https://www.chunichi.co.jp/article/593780
掲載交渉: 未了。許可を得たら誰から・いつ・どの範囲までをここに記録する。$$)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, history, about_heading, story_heading,
   is_published, is_provisional)
select id, 'ja',
  '遠山ふじ糸',
  '山藤の蔓から糸を紡ぐ',
  $$長野県飯田市南信濃、遠山郷に伝わる手しごとです。山に自生する山藤（ヤマフジ）の蔓から皮をはぎ、内側の繊維を取り出して糸に績（う）む。藤糸で織った藤布は、かつて衣類やかご、敷物、農作業に使うひもの素材として全国各地で使われていました。木綿が広まり、やがて化学繊維が普及するにつれて各地で姿を消したその技を、遠山郷では地域の人たちが掘り起こし、山で蔓を集めるところから織り上げるまでを一続きの手しごととして受け継いでいます。$$,
  $$遠山郷には「藤姫物語」と呼ばれる話が伝わっています。1600 年代、遠山城下に百姓一揆が起きたとき、館から逃れたお姫様が身を寄せた民家に、山藤の糸を紡いでお礼に置いていった——藤糸の由来として語られてきた物語です。

藤布そのものは遠山郷だけのものではありませんでした。藤糸で織った布は、かつて全国各地で暮らしの素材として使われていたもの。けれども手間のかかる藤の糸づくりは、木綿や化学繊維の普及とともに各地で途絶えていきます。

一度は絶えかけたその文化を再生しようと、遠山郷の人たちが会を結成したのが 2015 年。2025 年には発足 10 周年を迎え、東京・新潟・豊橋市・阿南町・浜松市天竜区水窪町など県外に住む人を含めて 27 人が名を連ねます。

活動は展示や実演にとどまりません。地元の和田小学校の児童とともに、山でフジづるを採るところから布にするまでを 5 年がかりで進め、横糸に藤糸・縦糸に絹糸を使って織った袖無しの法被状の衣を仕上げ、同校へ寄贈しました。糸のつくり方を伝えることが、そのまま地域の記憶を手渡すことになっています。$$,
  '山藤の蔓を、糸にする。',
  '藤姫が置いていった、糸。',
  true, false
from c
union all
select id, 'en',
  'Tōyama Fuji-ito (wisteria-vine thread)',
  'Thread spun from mountain wisteria vines',
  $$A handcraft of Tōyama-go in Minami-Shinano, Iida City. Bark is stripped from the vines of wild mountain wisteria and the inner fibers are drawn out and spun into thread. Cloth woven from this thread was once used across Japan for clothing, baskets, mats and the cords used in farm work. As cotton and later synthetic fibers spread, the labour-intensive craft disappeared almost everywhere — but in Tōyama-go local people have brought it back, keeping the whole sequence alive, from gathering vines in the hills to weaving the finished cloth.$$,
  $$Tōyama-go tells a story called the Tale of Princess Fuji. In the 1600s, when a peasant uprising broke out below Tōyama castle, a princess fled the residence and took shelter in a farmhouse; before leaving she spun thread from mountain wisteria and left it behind as thanks. The story has been handed down as the origin of fuji-ito.

Wisteria cloth was never unique to Tōyama-go. It was once a material of everyday life throughout Japan. But making the thread takes time, and as cotton and then synthetic fibers spread, the practice died out region by region.

In 2015, people of Tōyama-go formed a society to revive what had almost been lost. In 2025 it marked its tenth anniversary, with 27 members — including people living outside the prefecture, in Tokyo, Niigata, Toyohashi, Anan and the Misakubo district of Hamamatsu.

Their work goes beyond exhibitions and demonstrations. Together with children of the local Wada Elementary School they spent five years going from gathering wisteria vines in the hills all the way to finished cloth, weaving a sleeveless happi-style garment with wisteria thread as the weft and silk as the warp, and presented it to the school. Teaching how the thread is made is itself a way of handing on the memory of a place.$$,
  'Threads spun from the wild wisteria vine.',
  'The thread a princess left behind.',
  true, false
from c;

-- 担い手（遠山ふじ糸伝承の会）
with g as (
  insert into public.groups (slug, address, contact, sns_urls, is_provisional)
  values ('toyama-fuji-ito-kai', '長野県飯田市南信濃和田901-1', null,
    array['https://fujiitonokai.jimdofree.com/'], false)
  returning id
)
insert into public.group_translations (group_id, locale, name, description, is_published, is_provisional)
select id, 'ja', '遠山ふじ糸伝承の会',
  $$長野県飯田市南信濃（遠山郷）の人たちが結成した、山藤の蔓から糸を紡ぐ藤糸の文化を伝承する会です。2015 年の発足から 10 年、県外在住の会員を含む 27 人が、蔓の採取から糸績み、藤織りまでを続けています。地元の小学校と協力して藤布の衣を仕上げるなど、技を次の世代へ手渡す活動にも力を入れています。$$,
  true, false from g
union all
select id, 'en', 'Tōyama Fuji-ito Preservation Society',
  $$A society formed by people of Tōyama-go in Minami-Shinano, Iida City, to carry on the culture of thread spun from mountain wisteria vines. Ten years after its founding in 2015, its 27 members — some living outside the prefecture — continue everything from gathering vines to spinning and weaving. They also work with the local elementary school, handing the skills on to the next generation.$$,
  true, false from g;

-- 工程（4 ステップ）。作業名と順序は南信州新聞の記載どおり
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
s as (
  insert into public.craft_steps (craft_id, position, image_url, is_provisional)
  select cr.id, v.position, null, false
  from cr, (values (1), (2), (3), (4)) as v(position)
  returning id, position
)
insert into public.craft_step_translations
  (craft_step_id, locale, title, description, image_alt, is_published, is_provisional)
select s.id, t.locale, t.title, t.description, null, true, false
from s
join (values
  (1, 'ja', '藤づるを集める',
   '山に入り、山藤の蔓を集めます。会の体験メニューもこの作業から始まります。材料を買うのではなく山から得るところが、藤糸づくりの出発点です。'),
  (2, 'ja', '皮をはぐ',
   '集めた蔓の皮をはぎます。糸になるのは蔓そのものではなく、皮の内側にある繊維です。'),
  (3, 'ja', '繊維を糸にする',
   '取り出した繊維を糸にしていきます。会ではこの作業を「糸績（う）み」と呼び、実演でも見どころのひとつになっています。'),
  (4, 'ja', '藤織り',
   '績んだ藤糸を織って布にします。横糸に藤糸、縦糸に絹糸を使って織ることもあります。'),
  (1, 'en', 'Gather the vines',
   'Head into the hills to gather mountain wisteria. The society''s hands-on programme begins here too: the material is taken from the mountain, not bought.'),
  (2, 'en', 'Strip the bark',
   'Strip the bark from the gathered vines. What becomes thread is not the vine itself but the fibers on the inner side of the bark.'),
  (3, 'en', 'Spin into thread',
   'Work the drawn-out fibers into thread. The society calls this ito-umi, and it is one of the highlights of their demonstrations.'),
  (4, 'en', 'Weave the cloth',
   'Weave the spun wisteria thread into cloth — sometimes with wisteria as the weft and silk as the warp.')
) as t(position, locale, title, description) on t.position = s.position;

-- スポット（見る・買う）
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
sp as (
  insert into public.spots (craft_id, name, type, address, url, is_provisional)
  select cr.id, v.name, v.type, v.address, v.url, false
  from cr, (values
    ('道の駅 遠山郷', 'shop', '長野県飯田市南信濃和田456-1', 'https://michinoeki-tohyamago.com/'),
    ('遠山郷土館 和田城', 'museum', '長野県飯田市南信濃和田', null::text)
  ) as v(name, type, address, url)
  returning id, type
)
insert into public.spot_translations (spot_id, locale, name, description, is_published, is_provisional)
select sp.id, t.locale, t.name, t.description, true, false
from sp
join (values
  ('shop', 'ja', '道の駅 遠山郷',
   '国道 152 号沿いの道の駅。観光案内所と特産品の販売所、日帰り温泉「かぐらの湯」を併設しています。遠山郷を訪ねるときの入口です。'),
  ('museum', 'ja', '遠山郷土館 和田城',
   '和田城跡に建つ郷土館。遠山氏の城を模した建物で、霜月まつりに使う面の複製など、遠山郷の暮らしと信仰を伝える資料を展示しています。'),
  ('shop', 'en', 'Michi-no-Eki Tōyama-go',
   'A roadside station on Route 152 with a tourist information desk, a local produce shop and the Kagura-no-Yu hot spring. The gateway to Tōyama-go.'),
  ('museum', 'en', 'Tōyama Folk Museum (Wada Castle)',
   'A folk museum on the site of Wada Castle, built in the form of the Tōyama clan''s castle. Its displays include replicas of the masks used in the Shimotsuki festival.')
) as t(type, locale, name, description) on t.type = sp.type;

-- 体験（公式サイトに挙がっている 3 つのメニュー。すべて申し込み・問い合わせが必要）。
-- 料金・所要時間は公開されていないため is_provisional=true（交渉時に確認する）。
-- 3 件は同じ属性なので 1 文でまとめて insert すると翻訳との対応が id 順まかせになる。
-- 対応を明示するため 1 件ずつ分けて書く。
with cr as (select id from public.crafts where slug = 'toyama-fuji-ito'),
g as (select id from public.groups where slug = 'toyama-fuji-ito-kai'),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'request', '要問い合わせ', null, '公式サイトから申し込み・問い合わせ', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸づくり', '山藤の蔓から繊維を取り出し、糸に績（う）む工程を体験できます。', true, true from e
union all
select id, 'en', 'Making fuji-ito thread', 'Draw fibers from mountain wisteria vines and spin them into thread.', true, true from e;

with cr as (select id from public.crafts where slug = 'toyama-fuji-ito'),
g as (select id from public.groups where slug = 'toyama-fuji-ito-kai'),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'request', '要問い合わせ', null, '公式サイトから申し込み・問い合わせ', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤織り', '績んだ藤糸を織り込んで、布にする工程を体験できます。', true, true from e
union all
select id, 'en', 'Wisteria weaving', 'Weave the spun wisteria thread into cloth.', true, true from e;

with cr as (select id from public.crafts where slug = 'toyama-fuji-ito'),
g as (select id from public.groups where slug = 'toyama-fuji-ito-kai'),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, apply_method, is_provisional)
  select cr.id, g.id, 'request', '要問い合わせ', null, '公式サイトから申し込み・問い合わせ', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤蔓の籠編み', '自然の蔓を使って籠を編みます。', true, true from e
union all
select id, 'en', 'Vine basket weaving', 'Weave a basket from vines gathered in the hills.', true, true from e;

-- イベント: 発足 10 周年記念展（2025 年開催・終了済み → クエリ側で ended 派生）。実在の記録
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, end_date, venue, address, is_provisional)
  select cr.id, g.id, 'fuji-ito-10th-exhibition-2025', 'published',
    date '2025-11-01', date '2025-11-09', '南信濃地域交流センター', '長野県飯田市南信濃和田', false
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '遠山ふじ糸伝承の会 発足10周年イベント',
  '会の発足 10 周年を記念して 9 日間開かれた催し。会員の作品展示に加え、講演、実演トークショー、藤を使ったストラップ作り体験、糸績みと藤織りの実演が行われました。',
  true, false from ev
union all
select id, 'en', 'Tenth anniversary of the Tōyama Fuji-ito Preservation Society',
  'A nine-day event marking the society''s tenth anniversary, with members'' work on show alongside talks, a demonstration talk show, a wisteria strap-making workshop, and live demonstrations of spinning and weaving.',
  true, false from ev;

-- イベント: 藤糸づくり体験（**日程・料金は仮置き**。交渉時に実際の予定を確認する）
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
g as (
  select id from public.groups where slug = 'toyama-fuji-ito-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, time_note, venue, address,
     fee_note, apply_url, apply_note, is_provisional)
  select cr.id, g.id, 'fuji-ito-thread-workshop-2026', 'published',
    date '2026-09-13', '午前〜（※確認中）', '南信濃地域交流センター', '長野県飯田市南信濃和田',
    '要問い合わせ', 'https://fujiitonokai.jimdofree.com/', '公式サイトから申し込み・問い合わせ', true
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '藤糸づくり体験',
  '藤づるの皮はぎから糸績みまでを体験できる会。※開催日と料金は確認中の仮置きです。',
  true, true from ev
union all
select id, 'en', 'Fuji-ito thread-making session',
  'A session covering everything from stripping the bark of wisteria vines to spinning the thread. (Date and fee are provisional, pending confirmation.)',
  true, true from ev;

-- 記事
with cr as (
  select id from public.crafts where slug = 'toyama-fuji-ito'
),
a as (
  insert into public.articles (craft_id, slug, published_at, thumbnail, is_provisional)
  select cr.id, 'fuji-ito-monogatari', timestamptz '2026-07-10 09:00:00+09', null, false
  from cr
  returning id
)
insert into public.article_translations
  (article_id, locale, title, excerpt, content, thumbnail_alt, is_published, is_provisional)
select id, 'ja',
  '藤姫が置いていった糸 — 遠山ふじ糸のいま',
  '山藤の蔓から糸が生まれるまで。遠山郷で 10 年続く、藤糸の再生の記録。',
  $$<p>山に自生する藤の蔓から、糸を績（う）む。<strong>遠山ふじ糸</strong>は、長野県飯田市南信濃（遠山郷）で受け継がれてきた手しごとです。</p><h2>藤姫が置いていった糸</h2><p>遠山郷には「藤姫物語」と呼ばれる話が伝わっています。1600 年代、遠山城下に百姓一揆が起きたとき、館から逃れたお姫様が身を寄せた民家に、山藤の糸を紡いでお礼に置いていった——藤糸の由来として語り継がれてきた物語です。</p><h2>全国にあった布、遠山に戻った技</h2><p>藤糸で織った藤布は、かつて衣類やかご、敷物、農作業に使うひもなどの素材として全国各地で使われていました。特別な布ではなく、暮らしの布だったのです。けれども木綿が広まり、やがて化学繊維が普及すると、手間のかかる藤の糸づくりは各地で姿を消していきます。</p><p>一度は絶えかけたその文化を再生しようと、遠山郷の人たちが会を結成したのが 2015 年のこと。2025 年には発足 10 周年を迎えました。会員は 27 人。東京、新潟、豊橋市、阿南町、浜松市天竜区水窪町など、県外に住む人も名を連ねています。</p><h2>山から布まで、ひと続きで</h2><p>この会の特徴は、材料を得るところから布になるまでが途切れずに残っていることです。体験メニューは、藤づるを山から集める作業にはじまり、皮はぎ、繊維を糸にする作業、そして藤織りまで。どこから関わるかを選べます。</p><ul><li>藤づるを山から集める</li><li>皮をはぐ</li><li>繊維を糸にする（糸績み）</li><li>藤織り</li></ul><h2>小学校へ贈られた、藤布の衣</h2><p>会は地元の和田小学校の児童とともに、山でフジづるを採るところから布にするまでを 5 年がかりで進めてきました。仕上がったのは、横糸に藤糸、縦糸に絹糸を使って織った袖無しの法被状の衣。同校へ寄贈され、校内で展示される予定です。</p><p>10 周年の節目には、南信濃地域交流センターで 9 日間の催しが開かれました。会員の作品展示に加え、講演、実演トークショー、藤を使ったストラップ作り体験、そして糸績みと藤織りの実演。糸のつくり方を見せることが、そのまま地域の記憶を手渡すことになっています。</p><hr><p><em>この記事は公開されている情報をもとに編集部でまとめたものです。掲載にあたっては担い手の確認を経て更新します。</em></p>$$,
  null, true, false
from a
union all
select id, 'en',
  'The thread a princess left behind: Tōyama fuji-ito today',
  'How thread is born from mountain wisteria vines — ten years of reviving fuji-ito in Tōyama-go.',
  $$<p>Spinning thread from the vines of wild mountain wisteria: <strong>Tōyama fuji-ito</strong> is a handcraft carried on in Tōyama-go, in Minami-Shinano, Iida City.</p><h2>The thread a princess left behind</h2><p>Tōyama-go tells a story called the Tale of Princess Fuji. In the 1600s, when a peasant uprising broke out below Tōyama castle, a princess fled the residence and took shelter in a farmhouse; before she left she spun thread from mountain wisteria and left it behind as thanks. The story has been handed down as the origin of fuji-ito.</p><h2>A cloth once found everywhere</h2><p>Cloth woven from wisteria thread was once used across Japan for clothing, baskets, mats and the cords used in farm work. It was not a precious textile but an everyday one. As cotton spread, and later synthetic fibers, the labour-intensive craft of making wisteria thread disappeared region by region.</p><p>In 2015 people of Tōyama-go formed a society to revive what had almost been lost, and in 2025 it marked its tenth anniversary. Its 27 members include people living outside the prefecture — in Tokyo, Niigata, Toyohashi, Anan and the Misakubo district of Hamamatsu.</p><h2>From the mountain to the cloth, without a break</h2><p>What sets this society apart is that the whole sequence survives intact, from gathering the material to weaving the cloth. Their hands-on programme runs from collecting wisteria vines in the hills through stripping bark and spinning fiber into thread, all the way to weaving — and you can join at whichever stage you like.</p><ul><li>Gather wisteria vines in the hills</li><li>Strip the bark</li><li>Spin the fibers into thread</li><li>Weave the cloth</li></ul><h2>A wisteria garment for the local school</h2><p>Together with children of the nearby Wada Elementary School, the society spent five years going from gathering vines in the hills to finished cloth. The result was a sleeveless happi-style garment woven with wisteria thread as the weft and silk as the warp, presented to the school, which plans to display it.</p><p>For the tenth anniversary, a nine-day event was held at the Minami-Shinano Community Centre: members'' work on show, talks, a demonstration talk show, a wisteria strap-making workshop, and live demonstrations of spinning and weaving. Showing how the thread is made is itself a way of handing on the memory of a place.</p><hr><p><em>This article was compiled by our editors from publicly available information. It will be updated once the makers have reviewed it.</em></p>$$,
  null, true, false
from a;

-- =====================================================================
-- glossary（工芸用語の対訳集）
-- docs/13 の英訳下訳で systemInstruction に注入される。ここが空だと固有の訳語が
-- 揺れるので、2 工芸の本文に出てくる語を先に登録しておく。冪等（ja が unique）。
-- =====================================================================
insert into public.glossary (ja, en, note) values
  ('遠山郷', 'Tōyama-go', '飯田市南信濃の地域名。Toyama と綴ると富山県と紛れるのでマクロン付きで統一する'),
  ('遠山ふじ糸', 'Tōyama fuji-ito', '固有名詞。wisteria-vine thread を初出で括弧補足する'),
  ('山藤', 'mountain wisteria', 'ヤマフジ。単に wisteria とせず mountain を付ける'),
  ('藤糸', 'fuji-ito (wisteria thread)', ''),
  ('藤布', 'wisteria cloth', ''),
  ('績む', 'to spin (fiber into thread)', '「うむ」。撚りをかける twist とは別の工程'),
  ('糸績み', 'ito-umi', '会が使う呼称。ローマ字のまま出し、必要なら spinning と補足する'),
  ('藤織り', 'wisteria weaving', ''),
  ('阿島傘', 'Ajima-gasa', '固有名詞。初出で Japanese umbrella を括弧補足する'),
  ('和傘', 'Japanese umbrella', '文脈で wagasa をそのまま使う場合もある'),
  ('マダケ', 'madake bamboo', 'Phyllostachys reticulata。和名をローマ字で残す'),
  ('和紙', 'washi paper', ''),
  ('ろくろ', 'hub', '傘の骨をつなぐ部材。轆轤（旋盤）ではないので lathe と訳さない'),
  ('わらび粉', 'bracken starch', ''),
  ('柿渋', 'persimmon tannin', ''),
  ('間割り', 'kenwari', '傘の骨を等間隔に配分する工程。spacing the ribs と補足する'),
  ('張り', 'hari', '骨組みに和紙を張る工程。pasting the paper と補足する'),
  ('霜月まつり', 'Shimotsuki festival', '遠山郷の祭り'),
  ('担い手', 'makers', 'サイト全体の章見出しで使う語'),
  ('南信州', 'Minami-Shinshu', '飯田・下伊那。Southern Shinshu ではなくローマ字で統一する')
on conflict (ja) do update set en = excluded.en, note = excluded.note;

-- =====================================================================
-- craft #2: 阿島傘（published）
-- =====================================================================
with c as (
  insert into public.crafts (slug, status, region, is_provisional, name_latin, admin_note)
  values ('ajima-gasa', 'published', '下伊那郡喬木村阿島', false,
    'Ajima-gasa — washi-and-bamboo umbrella',
    $$出典: 喬木村 公式 https://www.vill.takagi.lg.jp/special/sp3_ajimagasa.html ／ Wikipedia「阿島傘」 ／ 阿島傘プロジェクト https://ajimagasa.wixsite.com/ajimagasa-project ／ 日本ふるさと手しごと協会 note https://note.com/teshigoto100/n/n5731263850a6
注意: 現役の作り手の軒数は出典によって 1 軒 / 2 軒と食い違うため本文では数を書いていない。会員数も 25 人 / 50 人と割れているため書いていない。工程は全 6 工程のうち主要な流れを 4 つに要約している。
掲載交渉: 未了。許可を得たら誰から・いつ・どの範囲までをここに記録する。$$)
  returning id
)
insert into public.craft_translations
  (craft_id, locale, name, tagline, overview, history, about_heading, story_heading,
   is_published, is_provisional)
select id, 'ja',
  '阿島傘',
  '竹と和紙でつくる、喬木村の和傘',
  $$長野県下伊那郡喬木村の阿島地区に、江戸時代から伝わる和傘です。骨になる竹（マダケ）と雨よけの和紙はもちろん、骨をつなぐろくろにはエゴノキやヤシャブシなどの広葉樹、のりにはわらび粉、仕上げには油と柿渋——一本の傘に、山と里から集めたいくつもの材料が必要になります。かつては村を挙げての一大産業でしたが、いまは日本舞踊などで和傘を必需品とする人たちに向けて、限られた手で作り続けられています。$$,
  $$慶長 6（1601）年以来、江戸幕府の命で浪合の関所を守っていたのは、阿島を拠点とする知久氏でした。江戸時代なかば、その関所を訪れた旅の僧が倒れ、介抱した関守への礼として和傘の製法を伝えた——阿島傘の起こりは、そう語り継がれています。

任を終えた役人が阿島に戻って技を伝えると、傘づくりはまず薄給の下級武士の内職として広まりました。阿島の周辺では良質な竹や和紙、渋柿が採れたため、やがて武士だけでなく村人も傘を作るようになります。最盛期には 100 軒あまりの傘屋が軒を連ね、年間 30 万本を数えました。畑にも石垣にも水路にも千本を超える傘が干され、阿島は「傘の村」として広く知られます。

洋傘の普及とともに和傘は急速に衰退し、傘づくりを生業とする家はごくわずかになりました。平成 6（1994）年、阿島傘の伝統を伝える伝承館が建てられ、あわせて「阿島傘の会」が発足します。会は月に一度集まって各自の傘づくりを進めるほか、年 2 回（一般向けは 4 月、親子向けは夏休み）の傘づくり講座を開いています。長野県長和町の立石和紙で紙漉きを体験したり、ろくろの仕入先である岐阜の工房を訪ねたりと、材料の側からも技を確かめる活動を続けています。$$,
  '竹の骨に、和紙を張る。',
  '関所の礼に、伝わった。',
  true, false
from c
union all
select id, 'en',
  'Ajima-gasa (Japanese umbrella)',
  'Bamboo-and-washi umbrellas of Takagi village',
  $$A traditional Japanese umbrella handed down since the Edo period in the Ajima district of Takagi, Shimo-Ina. Beyond the bamboo ribs and the washi paper that keeps out the rain, a single umbrella calls for hardwoods such as styrax or alder for the hub that joins the ribs, bracken starch for the paste, and oil and persimmon tannin for the finish — materials gathered from both the mountains and the village. Once an industry that occupied the whole village, it is now made by a small number of hands, chiefly for those who need a real Japanese umbrella, such as classical dancers.$$,
  $$From 1601 the Chiku clan, based at Ajima, guarded the Namiai barrier station under orders from the Tokugawa shogunate. In the middle of the Edo period, so the story goes, a travelling monk collapsed at that barrier, and in thanks for being nursed back to health he taught the guard how to make Japanese umbrellas. That is how Ajima-gasa is said to have begun.

When the official finished his post and returned to Ajima, he passed the technique on, and umbrella-making spread first as piecework among poorly paid lower-ranking samurai. Good bamboo, washi paper and astringent persimmons could all be had nearby, so villagers soon took it up as well. At its height more than a hundred umbrella shops stood side by side in Ajima, turning out some 300,000 umbrellas a year. More than a thousand umbrellas at a time were set out to dry on fields, stone walls and waterways, and Ajima became known as the village of umbrellas.

The spread of Western umbrellas brought a steep decline, and only a very few households now make umbrellas for a living. In 1994 a hall was built to pass on the Ajima umbrella tradition, and the Ajima-gasa Society was founded alongside it. The society meets once a month to work on members'' own umbrellas and runs umbrella-making courses twice a year — in April for the general public and during the summer holidays for families. Members have also tried papermaking at Tateishi washi in Nagawa, Nagano, and visited the workshop in Gifu that supplies their hubs, checking the craft from the side of its materials.$$,
  'Washi paper stretched over bamboo ribs.',
  'A gift of thanks at the barrier station.',
  true, false
from c;

-- 担い手（阿島傘の会）
with g as (
  insert into public.groups (slug, address, contact, is_provisional)
  values ('ajima-gasa-kai', '長野県下伊那郡喬木村阿島', null, false)
  returning id
)
insert into public.group_translations (group_id, locale, name, description, is_published, is_provisional)
select id, 'ja', '阿島傘の会',
  $$平成 6（1994）年、阿島傘伝承館の建設にあわせて発足した会です。月に一度集まり、各自の和傘づくりや傘づくり体験教室などの伝承活動の準備を進めています。年 2 回（一般向けは 4 月、親子向けは夏休み）の傘づくり講座を開くほか、立石和紙での紙漉き体験やろくろの仕入先である岐阜の工房訪問など、材料の側から技を確かめる活動も続けています。$$,
  true, false from g
union all
select id, 'en', 'Ajima-gasa Society',
  $$Founded in 1994 alongside the building of the Ajima Umbrella Hall. Members meet monthly to work on their own umbrellas and to prepare the workshops and events through which the craft is passed on. They run umbrella-making courses twice a year — in April for the general public and during the summer holidays for families — and also study the craft from the side of its materials, trying papermaking at Tateishi washi and visiting the Gifu workshop that supplies their hubs.$$,
  true, false from g;

-- 工程（全 6 工程のうち主要な流れを 4 つに要約。名称は喬木村・note の記載に拠る）
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
s as (
  insert into public.craft_steps (craft_id, position, image_url, is_provisional)
  select cr.id, v.position, null, false
  from cr, (values (1), (2), (3), (4)) as v(position)
  returning id, position
)
insert into public.craft_step_translations
  (craft_step_id, locale, title, description, image_alt, is_published, is_provisional)
select s.id, t.locale, t.title, t.description, null, true, false
from s
join (values
  (1, 'ja', '骨をつくる',
   '傘の骨になるのはマダケ。割って削り、一本の傘に必要な数の骨をそろえます。'),
  (2, 'ja', '間割り（けんわり）',
   '傘の骨を等間隔に配分する作業です。骨をつなぐろくろには、エゴノキやヤシャブシなどの広葉樹が使われます。'),
  (3, 'ja', '張り',
   '骨組みに和紙を張ります。のりにはわらび粉を使います。'),
  (4, 'ja', '仕上げ',
   '油や柿渋を引いて仕上げます。雨をはじく傘になるのは、この工程を経てからです。'),
  (1, 'en', 'Shaping the ribs',
   'The ribs are madake bamboo, split and pared down until there are enough for one umbrella.'),
  (2, 'en', 'Kenwari — spacing the ribs',
   'Setting the ribs at even intervals. The hub that joins them is made from hardwoods such as styrax or alder.'),
  (3, 'en', 'Hari — pasting the paper',
   'Washi paper is pasted onto the frame, using paste made from bracken starch.'),
  (4, 'en', 'Finishing',
   'Oil and persimmon tannin are applied. Only after this does the umbrella turn the rain.')
) as t(position, locale, title, description) on t.position = s.position;

-- スポット（見る）
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
sp as (
  insert into public.spots (craft_id, name, type, address, is_provisional)
  select cr.id, v.name, v.type, v.address, false
  from cr, (values
    ('阿島傘伝承館', 'museum', '長野県下伊那郡喬木村阿島')
  ) as v(name, type, address)
  returning id, type
)
insert into public.spot_translations (spot_id, locale, name, description, is_published, is_provisional)
select sp.id, t.locale, t.name, t.description, true, false
from sp
join (values
  ('museum', 'ja', '阿島傘伝承館',
   '阿島傘の資料と道具を保存するために平成 6 年に建てられた施設。傘に似せた屋根を持つ八角形の建物で、直径 6 メートルの大傘や、明治期以降の作品と資料を展示しています。'),
  ('museum', 'en', 'Ajima Umbrella Hall',
   'Built in 1994 to preserve the materials and tools of Ajima-gasa. The octagonal building has a roof shaped like an umbrella, and its displays include a six-metre umbrella along with works and records from the Meiji era onward.')
) as t(type, locale, name, description) on t.type = sp.type;

-- 体験（年 2 回の傘づくり講座 → seasonal）。料金・定員は確認中
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
g as (
  select id from public.groups where slug = 'ajima-gasa-kai'
),
e as (
  insert into public.experiences
    (craft_id, group_id, availability, price_note, duration_note, season_note, apply_method, is_provisional)
  select cr.id, g.id, 'seasonal', '要問い合わせ', null,
    '年 2 回（一般向けは 4 月、親子向けは夏休み）', '喬木村へ問い合わせ', true
  from cr, g
  returning id
)
insert into public.experience_translations (experience_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '傘づくり講座',
  '阿島傘の会が年 2 回開いている講座です。阿島傘の歴史を学びながら、製作工程の一部を実際に体験します。',
  true, true from e
union all
select id, 'en', 'Umbrella-making course',
  'A course run twice a year by the Ajima-gasa Society: learn the history of Ajima umbrellas and try part of the making process yourself.',
  true, true from e;

-- イベント: 親子向け傘づくり講座（**日程・料金は仮置き**。交渉時に実際の予定を確認する）
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
g as (
  select id from public.groups where slug = 'ajima-gasa-kai'
),
ev as (
  insert into public.events
    (craft_id, group_id, slug, status, start_date, time_note, venue, address,
     fee_note, apply_note, is_provisional)
  select cr.id, g.id, 'ajima-gasa-summer-class-2026', 'published',
    date '2026-08-08', '午後〜（※確認中）', '阿島傘伝承館', '長野県下伊那郡喬木村阿島',
    '要問い合わせ', '喬木村へ問い合わせ', true
  from cr, g
  returning id
)
insert into public.event_translations (event_id, locale, title, description, is_published, is_provisional)
select id, 'ja', '傘づくり講座（親子向け）',
  '夏休みに開かれる親子向けの傘づくり講座。※開催日と料金は確認中の仮置きです。',
  true, true from ev
union all
select id, 'en', 'Umbrella-making course for families',
  'The summer-holiday umbrella-making course for families. (Date and fee are provisional, pending confirmation.)',
  true, true from ev;

-- 記事
with cr as (
  select id from public.crafts where slug = 'ajima-gasa'
),
a as (
  insert into public.articles (craft_id, slug, published_at, thumbnail, is_provisional)
  select cr.id, 'ajima-gasa-monogatari', timestamptz '2026-07-05 09:00:00+09', null, false
  from cr
  returning id
)
insert into public.article_translations
  (article_id, locale, title, excerpt, content, thumbnail_alt, is_published, is_provisional)
select id, 'ja',
  '関所の礼にはじまる — 阿島傘のいま',
  '年間 30 万本の産地から、いま作り続ける手へ。喬木村阿島に伝わる和傘をたどりました。',
  $$<p>竹の骨に和紙を張り、油を引いて仕上げる。<strong>阿島傘</strong>は、長野県下伊那郡喬木村の阿島地区に江戸時代から伝わる和傘です。</p><h2>関所の礼にはじまる</h2><p>慶長 6（1601）年以来、江戸幕府の命で浪合の関所を守っていたのは、阿島を拠点とする知久氏でした。江戸時代なかば、その関所を訪れた旅の僧が倒れ、介抱した関守への礼として和傘の製法を伝えた——阿島傘の起こりは、そう語り継がれています。</p><p>任を終えた役人が阿島に戻って技を伝えると、傘づくりはまず薄給の下級武士の内職として広まりました。やがて武士だけでなく村人も傘を作るようになります。阿島の周辺で良質な竹や和紙、渋柿が採れたことが、その広がりを支えました。</p><h2>「傘の村」だったころ</h2><p>最盛期には 100 軒あまりの傘屋が軒を連ね、年間 30 万本を数えました。畑にも石垣にも水路にも千本を超える傘が干され、阿島は「傘の村」として広く知られていたといいます。</p><p>洋傘の普及とともに和傘は急速に衰退し、傘づくりを生業とする家はごくわずかになりました。それでも和傘を必需品とする人はいます。日本舞踊などの舞台では、いまも本物の和傘が求められています。</p><h2>一本の傘に、いくつもの材料</h2><p>和傘は竹と紙だけではできません。</p><ul><li>骨になる竹（マダケ）</li><li>雨よけの和紙</li><li>骨をつなぐろくろ（エゴノキ・ヤシャブシなどの広葉樹）</li><li>のりになるわらび粉</li><li>仕上げの油と柿渋</li></ul><p>山と里から集めたこれらの材料が、ひとつでも欠けると傘にならない。作り手が材料の産地まで足を運ぶのは、そのためです。</p><h2>伝承館と、月に一度の集まり</h2><p>平成 6（1994）年、阿島傘の伝統を伝える伝承館が建てられ、あわせて「阿島傘の会」が発足しました。傘に似せた屋根を持つ八角形の建物には、直径 6 メートルの大傘や明治期以降の作品が並びます。</p><p>会は月に一度集まり、各自の傘づくりと、体験教室などの伝承活動の準備を進めています。年 2 回、一般向けは 4 月、親子向けは夏休みに傘づくり講座を開催。立石和紙での紙漉き体験や、ろくろの仕入先である岐阜の工房訪問など、材料の側から技を確かめる活動も続けています。</p><hr><p><em>この記事は公開されている情報をもとに編集部でまとめたものです。掲載にあたっては担い手の確認を経て更新します。</em></p>$$,
  null, true, false
from a
union all
select id, 'en',
  'A gift of thanks at the barrier station: Ajima-gasa today',
  'From a village of 300,000 umbrellas a year to the few hands still making them, in Ajima, Takagi.',
  $$<p>Washi paper stretched over bamboo ribs, finished with a coat of oil. <strong>Ajima-gasa</strong> is a Japanese umbrella handed down since the Edo period in the Ajima district of Takagi, Shimo-Ina, Nagano.</p><h2>A gift of thanks at the barrier station</h2><p>From 1601 the Chiku clan, based at Ajima, guarded the Namiai barrier station under orders from the Tokugawa shogunate. In the middle of the Edo period, so the story goes, a travelling monk collapsed at that barrier, and in thanks for being nursed back to health he taught the guard how to make Japanese umbrellas. That is how Ajima-gasa is said to have begun.</p><p>When the official finished his post and returned to Ajima, he passed the technique on, and umbrella-making spread first as piecework among poorly paid lower-ranking samurai. Villagers soon took it up too — good bamboo, washi paper and astringent persimmons could all be had nearby.</p><h2>When Ajima was the village of umbrellas</h2><p>At its height more than a hundred umbrella shops stood side by side, turning out some 300,000 umbrellas a year. More than a thousand at a time were set out to dry on fields, stone walls and waterways, and Ajima was widely known as the village of umbrellas.</p><p>The spread of Western umbrellas brought a steep decline, and only a very few households now make umbrellas for a living. Yet some people still need the real thing: on the stage of classical Japanese dance, a genuine wagasa is indispensable.</p><h2>Many materials in a single umbrella</h2><p>A Japanese umbrella is not just bamboo and paper.</p><ul><li>Madake bamboo for the ribs</li><li>Washi paper to keep out the rain</li><li>A hub of hardwood — styrax or alder — to join the ribs</li><li>Bracken starch for the paste</li><li>Oil and persimmon tannin for the finish</li></ul><p>Gathered from the mountains and the village, these materials are all necessary; without any one of them there is no umbrella. That is why the makers travel to the places their materials come from.</p><h2>A hall, and a meeting once a month</h2><p>In 1994 a hall was built to pass on the Ajima umbrella tradition, and the Ajima-gasa Society was founded alongside it. The octagonal building, roofed in the shape of an umbrella, holds a six-metre umbrella and works dating from the Meiji era onward.</p><p>The society meets monthly to work on members'' own umbrellas and to prepare the workshops through which the craft is handed on. Courses run twice a year — April for the general public, the summer holidays for families. Members have also tried papermaking at Tateishi washi and visited the Gifu workshop that supplies their hubs, studying the craft from the side of its materials.</p><hr><p><em>This article was compiled by our editors from publicly available information. It will be updated once the makers have reviewed it.</em></p>$$,
  null, true, false
from a;
