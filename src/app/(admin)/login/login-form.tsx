'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginAction, type LoginState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Card } from '@/components/ui/surface';

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [visible, setVisible] = useState(false);

  return (
    <Card className="p-5">
      <form action={action} className="grid gap-4">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="admin@example.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              // Tombol ini hanya membantu mengetik; pembaca layar tidak perlu
              // menavigasinya, tapi tetap diberi label kalau difokuskan.
              aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
              aria-pressed={visible}
              className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        {state.error && (
          <p role="alert" className="text-xs text-danger">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? 'Memeriksa…' : 'Masuk'}
        </Button>
      </form>
    </Card>
  );
}
