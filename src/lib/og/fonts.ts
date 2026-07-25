/**
 * OGP 画像用のフォント取得（docs/15）。
 *
 * `src/app/fonts.ts` の `next/font/google` はビルド出力が **woff2 のみ**で、
 * satori（`next/og` の中身）は woff2 を読めない（TTF / OTF / WOFF のみ）。
 * そこでここだけ **Google Fonts CSS API の `text=` サブセット**から TTF を取る。
 * `text=` を付けると描画に必要なグリフだけが返るので、和文でも 1 枚あたり数十 KB で済み、
 * リポジトリへのフォント同梱もサブセット化ツールの追加も要らない。
 *
 * 注意: User-Agent を送らないと Google は `format('truetype')` を返す。UA を足すと
 * woff2 に変わって satori が読めなくなるので、**fetch にヘッダを付けない**こと。
 */

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: 'normal' | 'italic';
};

/** 同じ (family, axis, text) の取得はプロセス内で使い回す。 */
const cache = new Map<string, Promise<OgFont[]>>();

/**
 * 文字集合を正規化する。並び順が違うだけの同じ集合でキャッシュを共有させるためソートする。
 */
const charset = (s: string) => Array.from(new Set(s)).sort().join('');

/**
 * フォント取得を**プロセス内で直列化する**。
 * ビルド時は 20 枚の OGP ルートが同時にプリレンダされ、そのまま並列に投げると
 * fonts.googleapis.com への同時接続が増えて ETIMEDOUT で落ちる（実測）。
 */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  // 失敗しても後続を止めない
  queue = run.catch(() => undefined);
  return run;
}

/** 一時的な失敗（タイムアウト・レート制限）に備えて指数バックオフで数回だけ試す。 */
async function fetchWithRetry(url: string, label: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`OG font: ${label} の取得に失敗しました (${String(lastError)})`);
}

async function loadFamily(family: string, axis: string, text: string): Promise<OgFont[]> {
  const url =
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:${axis}` +
    `&text=${encodeURIComponent(charset(text))}`;

  const cached = cache.get(url);
  if (cached) return cached;

  const task = serialize(async (): Promise<OgFont[]> => {
    const css = await (await fetchWithRetry(url, `${family} の CSS`)).text();
    const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((m) => m[1]);
    if (faces.length === 0) {
      throw new Error(`OG font: ${family} の @font-face が返りませんでした`);
    }

    const loaded: OgFont[] = [];
    for (const block of faces) {
      const src = block.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('truetype'\)/);
      if (!src) {
        // woff2 が返ってきたら satori が読めない。豆腐（□）入りの PNG を出すより落とす。
        throw new Error(`OG font: ${family} で truetype が提供されませんでした`);
      }
      const fontRes = await fetchWithRetry(src[1], `${family} の本体`);
      loaded.push({
        name: family,
        data: await fontRes.arrayBuffer(),
        weight: Number(block.match(/font-weight:\s*(\d+)/)?.[1] ?? 400) as OgFont['weight'],
        style: (block.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal') as OgFont['style'],
      });
    }
    return loaded;
  });

  cache.set(url, task);
  return task;
}

/**
 * カードに描く文字列をすべて渡す（Google は対応外のグリフを黙って無視するので 1 本化できる）。
 * 見出し = Shippori Mincho、英字併走 = Cormorant Garamond のイタリック（DESIGN §3.3）。
 */
export async function loadOgFonts(text: string): Promise<OgFont[]> {
  // 直列化しているので Promise.all にしても同時接続は増えないが、意図を明示して順に取る
  const mincho = await loadFamily('Shippori Mincho', 'wght@500;700', text);
  const cormorant = await loadFamily('Cormorant Garamond', 'ital,wght@1,600', text);
  return [...mincho, ...cormorant];
}
