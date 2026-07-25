import { LoginForm } from './LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="font-jp text-h3 text-foreground">いとぐち 管理パネル</h1>
        <p className="mt-2 text-caption text-muted">続けるにはパスワードを入力してください。</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
