import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Masuk · Digital Letter',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 grid gap-1.5 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Digital Letter</h1>
          <p className="text-xs text-muted-foreground">
            Masuk untuk mengelola surat kamu.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
