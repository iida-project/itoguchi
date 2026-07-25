import 'server-only';
import { listCraftSteps, listCrafts } from './crafts';
import { listGroups } from './groups';
import { listExperiences } from './experiences';
import { listEvents } from './events';
import { listSpots } from './spots';
import { listArticles } from './articles';
import { pickTranslations } from './_shared';

/**
 * 交渉チェックリスト（docs/15 / REQUIREMENTS §10）用の横断リーダー。
 *
 * `is_provisional`（= 推測で補った箇所）が立っている行を全エンティティから集め、
 * 交渉相手＝工芸ごとにまとめて返す。既存の `list*()` は `select('*, translations(*)')`
 * なので本体・翻訳双方のフラグがすでに取れている。**専用クエリは作らない**。
 */

export type ProvisionalEntity =
  | 'craft'
  | 'step'
  | 'group'
  | 'experience'
  | 'event'
  | 'spot'
  | 'article';

/** 仮フラグがどこに立っているか。base = 本体テーブル / ja・en = *_translations */
export type ProvisionalScope = 'base' | 'ja' | 'en';

export type ProvisionalRow = {
  /** テーブル間で衝突しない行キー（`step:<uuid>`） */
  key: string;
  entity: ProvisionalEntity;
  entityLabel: string;
  /** 日本語名。無ければ slug、それも無ければ代替文言 */
  label: string;
  /** 所属・位置（工程なら `工程 03`、スポットなら種別など） */
  context: string | null;
  scopes: ProvisionalScope[];
  /** 編集ページ。工程は工芸編集ページの中で編集する */
  href: string;
};

export type ProvisionalGroup = {
  craftId: string | null;
  craftLabel: string;
  /** 管理メモ（`crafts.admin_note`）へ誘導するリンク先 */
  craftHref: string | null;
  rows: ProvisionalRow[];
};

const ENTITY_LABEL: Record<ProvisionalEntity, string> = {
  craft: '工芸',
  step: '工程',
  group: '担い手',
  experience: '体験',
  event: 'イベント',
  spot: 'スポット',
  article: '記事',
};

/** 工芸詳細ページの章順。グループ内はこの順に並べる。 */
const ENTITY_ORDER: ProvisionalEntity[] = [
  'craft',
  'step',
  'group',
  'experience',
  'event',
  'spot',
  'article',
];

const pad2 = (n: number) => String(n).padStart(2, '0');

type TranslationLike = { locale: string; is_provisional: boolean };

/** 本体・翻訳のどこに仮フラグが立っているかを集める。空配列なら対象外。 */
function collectScopes(
  baseProvisional: boolean,
  translations: TranslationLike[] | null | undefined,
): ProvisionalScope[] {
  const scopes: ProvisionalScope[] = [];
  if (baseProvisional) scopes.push('base');
  for (const locale of ['ja', 'en'] as const) {
    if ((translations ?? []).some((t) => t.locale === locale && t.is_provisional)) {
      scopes.push(locale);
    }
  }
  return scopes;
}

/** ja の名前を拾う（フォームの表示名と同じ優先順位）。 */
function jaName(
  translations: Array<{ locale: string; name?: string | null; title?: string | null }> | null,
): string | null {
  const ja = pickTranslations(translations ?? []).ja;
  return ja?.name ?? ja?.title ?? null;
}

export async function listProvisional(): Promise<ProvisionalGroup[]> {
  const [crafts, steps, groups, experiences, events, spots, articles] = await Promise.all([
    listCrafts(),
    listCraftSteps(),
    listGroups(),
    listExperiences(),
    listEvents(),
    listSpots(),
    listArticles(),
  ]);

  const craftLabelById = new Map(crafts.map((c) => [c.id, jaName(c.translations) ?? c.slug]));

  // groups に craft_id は無いので、体験・イベントの group_id → craft_id から逆引きする
  // （公開層 src/lib/data/crafts.ts が担い手を引くときと同じ経路）。
  const craftIdByGroupId = new Map<string, string>();
  for (const row of [...experiences, ...events]) {
    if (row.group_id && row.craft_id && !craftIdByGroupId.has(row.group_id)) {
      craftIdByGroupId.set(row.group_id, row.craft_id);
    }
  }

  const rows: Array<ProvisionalRow & { craftId: string | null }> = [];

  const push = (
    craftId: string | null,
    entity: ProvisionalEntity,
    id: string,
    scopes: ProvisionalScope[],
    label: string,
    context: string | null,
    href: string,
  ) => {
    if (scopes.length === 0) return;
    rows.push({
      key: `${entity}:${id}`,
      entity,
      entityLabel: ENTITY_LABEL[entity],
      label,
      context,
      scopes,
      href,
      craftId,
    });
  };

  for (const c of crafts) {
    push(
      c.id,
      'craft',
      c.id,
      collectScopes(c.is_provisional, c.translations),
      jaName(c.translations) ?? c.slug,
      c.region,
      `/admin/crafts/${c.id}`,
    );
  }

  for (const s of steps) {
    push(
      s.craft_id,
      'step',
      s.id,
      collectScopes(s.is_provisional, s.translations),
      jaName(s.translations) ?? '（工程名未設定）',
      `工程 ${pad2(s.position)}`,
      `/admin/crafts/${s.craft_id}`,
    );
  }

  for (const g of groups) {
    push(
      craftIdByGroupId.get(g.id) ?? null,
      'group',
      g.id,
      collectScopes(g.is_provisional, g.translations),
      jaName(g.translations) ?? g.slug,
      g.address,
      `/admin/groups/${g.id}`,
    );
  }

  for (const e of experiences) {
    push(
      e.craft_id,
      'experience',
      e.id,
      collectScopes(e.is_provisional, e.translations),
      jaName(e.translations) ?? '（体験名未設定）',
      // 交渉で必ず確認する項目を一覧に出しておく（料金・所要時間）
      [e.price_note, e.duration_note].filter(Boolean).join(' / ') || null,
      `/admin/experiences/${e.id}`,
    );
  }

  for (const e of events) {
    push(
      e.craft_id,
      'event',
      e.id,
      collectScopes(e.is_provisional, e.translations),
      jaName(e.translations) ?? e.slug,
      [e.start_date, e.fee_note].filter(Boolean).join(' / ') || null,
      `/admin/events/${e.id}`,
    );
  }

  for (const s of spots) {
    push(
      s.craft_id,
      'spot',
      s.id,
      collectScopes(s.is_provisional, s.translations),
      jaName(s.translations) ?? s.name ?? '（スポット名未設定）',
      s.address,
      `/admin/spots/${s.id}`,
    );
  }

  for (const a of articles) {
    push(
      a.craft_id,
      'article',
      a.id,
      collectScopes(a.is_provisional, a.translations),
      jaName(a.translations) ?? a.slug,
      a.published_at,
      `/admin/articles/${a.id}`,
    );
  }

  // 工芸ごとにまとめる。工芸の並びは listCrafts（created_at 昇順）に従い、
  // どの工芸にも紐づかない項目は最後にまとめる。
  const groupsOut: ProvisionalGroup[] = crafts.map((c) => ({
    craftId: c.id,
    craftLabel: craftLabelById.get(c.id) ?? c.slug,
    craftHref: `/admin/crafts/${c.id}`,
    rows: [],
  }));
  const orphan: ProvisionalGroup = {
    craftId: null,
    craftLabel: '工芸に紐づかない項目',
    craftHref: null,
    rows: [],
  };

  const byCraftId = new Map(groupsOut.map((g) => [g.craftId, g]));
  for (const row of rows) {
    const { craftId, ...rest } = row;
    (byCraftId.get(craftId) ?? orphan).rows.push(rest);
  }

  for (const g of [...groupsOut, orphan]) {
    g.rows.sort((a, b) => ENTITY_ORDER.indexOf(a.entity) - ENTITY_ORDER.indexOf(b.entity));
  }

  return [...groupsOut, orphan].filter((g) => g.rows.length > 0 || g.craftId !== null);
}
