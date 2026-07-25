import { ImageResponse } from 'next/og';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_PHASE, siteName } from '@/lib/seo/config';
import { OG_COLOR as C, OG_SIZE, OG_CONTENT_TYPE } from './config';
import { loadOgFonts } from './fonts';

/**
 * OGP カードの描画（docs/15 / DESIGN §1「糸と結び目」「金の栞」）。
 *
 * **写真は使わない**（掲載交渉が終わるまで他者の写真を一切使わないため）。
 * 破線のプレースホルダ枠も置かない — 共有カードとしての品位を優先し、
 * 糸と結び目のモチーフ + 藤色/金 + タイポグラフィだけで構成する。
 *
 * satori の制約:
 * - CSS 変数は解決されないので色は `OG_COLOR`（globals.css からの写し）を使う
 * - レイアウトは flexbox のみ。子が 2 つ以上ある要素には display:'flex' を明示する
 * - SVG 要素は扱えないので、`ThreadMark` の糸と結び目は div の円と罫線で組み直す
 */

const MINCHO = '"Shippori Mincho"';
const CORMORANT = '"Cormorant Garamond"';

type OgRouteParams = { locale: string; slug?: string };

/**
 * メタデータルートの `params` を解決する。
 * page の `params` と違って Promise では渡らない（loader が await 済みで渡す）が、
 * 将来変わっても壊れないよう `await` で受けられる型にしておく。
 */
export async function resolveOgParams(
  params: OgRouteParams | Promise<OgRouteParams>,
): Promise<{ locale: Locale; slug: string }> {
  const p = await params;
  const locale = (routing.locales as readonly string[]).includes(p.locale)
    ? (p.locale as Locale)
    : routing.defaultLocale;
  return { locale, slug: p.slug ?? '' };
}

export type OgCardProps = {
  locale: Locale;
  /** 金の罫線に続く英字（例 `No. 01 · The Craft`） */
  kicker: string;
  /** 日本語見出し（工芸名・ページ名） */
  title: string;
  /** 英字併走（`crafts.name_latin` 等）。無ければ省略 */
  latin?: string | null;
  /** 補足 1 行（タグライン・リード） */
  note?: string | null;
};

/** 糸と結び目（`ThreadMark` の div 版）。円 - 罫線 - 円 - 罫線 - 円。 */
function ThreadMark() {
  const knot = { width: 12, height: 12, borderRadius: 6, background: C.gold600 };
  const line = { width: 34, height: 2, background: C.primary600 };
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={knot} />
      <div style={line} />
      <div style={{ width: 22, height: 22, borderRadius: 11, background: C.primary600 }} />
      <div style={line} />
      <div style={knot} />
    </div>
  );
}

/** 下部の糸の区切り（`ThreadDivider` の簡易版・結び目 2 つ）。 */
function ThreadDivider() {
  const knot = { width: 10, height: 10, borderRadius: 5, background: C.gold600 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <div style={knot} />
      <div style={{ width: 120, height: 1, background: C.primary400 }} />
      <div style={knot} />
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

export async function renderOgImage({ locale, kicker, title, latin: rawLatin, note }: OgCardProps) {
  const brand = siteName(locale);
  // 英字併走は EN ロケールでは落とす（同じ言語が 2 行続くため。DESIGN §3.3 層 2 の規約）
  const latin = locale === 'en' ? null : rawLatin;
  const region = locale === 'en' ? 'Minami-Shinshu, Nagano, Japan' : '南信州・飯田／下伊那';
  const phaseLabel = locale === 'en' ? 'Provisional demo' : '交渉中のデモ';
  const isPreview = SITE_PHASE === 'preview';

  // 描く文字だけをサブセット取得する。1 文字でも漏らすと豆腐になるので全部渡す。
  const fonts = await loadOgFonts(
    [brand, 'ITOGUCHI', kicker, title, latin, note, region, isPreview ? phaseLabel : '']
      .filter(Boolean)
      .join(''),
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: C.bg,
          fontFamily: MINCHO,
        }}
      >
        {/* 左端の藤紫の縦帯（構造の目印） */}
        <div style={{ width: 8, height: '100%', background: C.primary600 }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '56px 64px 48px 56px',
            position: 'relative',
          }}
        >
          {/* 交渉中のあいだは右上に印を出す。public に切り替えると自動で消える */}
          {isPreview && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 48,
                display: 'flex',
                padding: '8px 18px',
                borderRadius: 999,
                background: C.gold100,
                border: `1px solid ${C.gold400}`,
                color: C.gold800,
                fontSize: 20,
              }}
            >
              {phaseLabel}
            </div>
          )}

          {/* ロゴ行 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ThreadMark />
            <div style={{ display: 'flex', alignItems: 'baseline', marginLeft: 20 }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: C.text }}>{brand}</div>
              <div
                style={{
                  marginLeft: 14,
                  fontFamily: CORMORANT,
                  fontStyle: 'italic',
                  fontSize: 22,
                  letterSpacing: 3,
                  color: C.primary600,
                }}
              >
                ITOGUCHI
              </div>
            </div>
          </div>

          {/* 本文ブロック（縦方向は中央寄せ） */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              paddingTop: 8,
            }}
          >
            {/* kicker: 金の罫線 + 英字イタリック（§3.3 の層 1） */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 44, height: 2, background: C.gold600 }} />
              <div
                style={{
                  marginLeft: 16,
                  fontFamily: CORMORANT,
                  fontStyle: 'italic',
                  fontSize: 26,
                  letterSpacing: 1,
                  color: C.gold800,
                }}
              >
                {kicker}
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                fontSize: title.length > 22 ? 58 : 76,
                fontWeight: 700,
                lineHeight: 1.2,
                color: C.text,
              }}
            >
              {title}
            </div>

            {latin && (
              <div
                style={{
                  marginTop: 14,
                  fontFamily: CORMORANT,
                  fontStyle: 'italic',
                  fontSize: 30,
                  color: C.primary600,
                }}
              >
                {latin}
              </div>
            )}

            {note && (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 26,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: C.muted,
                  // 長いリードは 2 行で切る（satori は行数制限に対応している）
                  display: 'block',
                  lineClamp: 2,
                }}
              >
                {note}
              </div>
            )}
          </div>

          <ThreadDivider />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 20,
              fontSize: 20,
              color: C.muted,
            }}
          >
            <div>{region}</div>
            <div style={{ fontFamily: CORMORANT, fontStyle: 'italic', fontSize: 22 }}>
              itoguchi.jp
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

export { OG_SIZE, OG_CONTENT_TYPE };
