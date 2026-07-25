import 'server-only';

/**
 * Gemini REST クライアント（docs/13）。SDK を足さず fetch のみ。
 * generateContent + responseSchema（JSON モード）で構造化出力を得る。
 */

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 4;
const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

/** 翻訳失敗（ユーザーに見せるメッセージを持つ）。ja データには触れない前提。 */
export class TranslationError extends Error {}

type GeminiOptions = {
  /** systemInstruction に入れる指示（+ glossary）。 */
  system: string;
  /** user パートに入れる原文（オブジェクトは JSON 文字列化して送る）。 */
  payload: unknown;
  /** generationConfig.responseSchema（型は大文字 OBJECT/STRING）。 */
  schema: unknown;
  maxOutputTokens?: number;
  temperature?: number;
};

type GeminiResponse = {
  promptFeedback?: { blockReason?: string };
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function getKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new TranslationError('GEMINI_API_KEY が未設定です（.env.local に設定してください）');
  }
  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 構造化 JSON を 1 回生成する（タイムアウト + 429/5xx バックオフ + 応答ガード）。 */
export async function geminiJSON<T>(opts: GeminiOptions): Promise<T> {
  const key = getKey();
  const body = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: typeof opts.payload === 'string' ? opts.payload : JSON.stringify(opts.payload) }],
      },
    ],
    generationConfig: {
      temperature: opts.temperature ?? 0.2,
      responseMimeType: 'application/json',
      responseSchema: opts.schema,
      ...(opts.maxOutputTokens ? { maxOutputTokens: opts.maxOutputTokens } : {}),
    },
  };

  let lastError: TranslationError | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const backoff = Math.min(8000, 500 * 2 ** (attempt - 1));
      await sleep(backoff + Math.floor(Math.random() * 250));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      // ネットワーク/タイムアウト → リトライ対象
      lastError = new TranslationError(`Gemini への接続に失敗しました: ${(e as Error).message}`);
      clearTimeout(timer);
      continue;
    }
    clearTimeout(timer);

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_ATTEMPTS - 1) {
        lastError = new TranslationError(`Gemini がエラーを返しました (${res.status})`);
        continue;
      }
      throw new TranslationError(`Gemini がエラーを返しました (${res.status}): ${detail.slice(0, 300)}`);
    }

    const json = (await res.json()) as GeminiResponse;

    if (json.promptFeedback?.blockReason) {
      throw new TranslationError(`入力がブロックされました（${json.promptFeedback.blockReason}）`);
    }
    const candidate = json.candidates?.[0];
    const finish = candidate?.finishReason;
    if (!candidate || (finish && finish !== 'STOP')) {
      throw new TranslationError(`翻訳を生成できませんでした（finishReason: ${finish ?? 'なし'}）`);
    }
    const text = (candidate.content?.parts ?? []).map((p) => p.text ?? '').join('');
    if (!text) throw new TranslationError('Gemini の応答が空でした');

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new TranslationError('Gemini の応答を JSON として解釈できませんでした');
    }
  }

  throw lastError ?? new TranslationError('翻訳に失敗しました');
}
