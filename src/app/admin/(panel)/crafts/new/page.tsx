import { CraftForm } from '../CraftForm';

export default function NewCraftPage() {
  return (
    <div>
      <h1 className="mb-6 font-jp text-h2 text-foreground">工芸 — 新規作成</h1>
      <p className="mb-6 max-w-reading text-caption text-muted">
        工程（craft_steps）は作成・保存したあと、編集画面で追加できます。
      </p>
      <CraftForm />
    </div>
  );
}
