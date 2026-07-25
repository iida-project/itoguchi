/**
 * 交渉時の確認事項（REQUIREMENTS §10「交渉時の確認チェックリスト」）。
 *
 * `<input type="checkbox">` は使わない。チェック状態を保存するカラムが無く、
 * リロードで消える UI は嘘になるため。画面を見ながらの口頭確認と、印刷して持参する
 * 用途に振り切って `☐` の箇条書きにする。
 */
const ITEMS = [
  '掲載可否（団体紹介 / 歴史・物語 / 工程 / 体験情報）',
  '写真提供の範囲と提供方法（人物写り込みの扱い含む）',
  '体験・イベント情報の粒度（料金・定員・申込方法をどこまで載せるか）',
  '問い合わせ先として掲載してよい連絡手段',
  '英語ページ掲載の可否',
] as const;

export function NegotiationChecklist() {
  return (
    <div className="mb-4 rounded-lg border border-border bg-warm p-5">
      <h3 className="mb-3 font-jp text-body font-medium text-foreground">交渉時に確認すること</h3>
      <ul className="flex flex-col gap-2">
        {ITEMS.map((item) => (
          <li key={item} className="flex gap-2 text-body text-muted">
            <span aria-hidden="true" className="text-border-strong">
              ☐
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
