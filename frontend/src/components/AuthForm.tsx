import { type FormEvent, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-[440px]">
      <div className="mb-2 flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-2xl text-white shadow-clay-button animate-clay-breathe"
          aria-hidden="true"
        >
          ✓
        </div>
        <div>
          <h1
            className="font-nunito text-3xl font-black leading-tight tracking-tight text-clay-foreground sm:text-4xl"
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h1>
        </div>
      </div>
      <p className="mb-6 text-base font-medium leading-relaxed text-clay-muted">
        {mode === 'login'
          ? 'Access your personal task list.'
          : 'Start managing your tasks in one place.'}
      </p>

      <form onSubmit={handleSubmit} noValidate className="grid gap-5">
        <div className="grid gap-2">
          <label
            htmlFor="email"
            className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="clay-input"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="password"
            className="font-nunito text-sm font-bold tracking-wide text-clay-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            required
            placeholder="At least 8 characters"
            className="clay-input"
          />
        </div>

        {error && (
          <p className="m-0 rounded-[20px] bg-clay-danger-light px-4 py-3 text-sm font-medium text-clay-danger-text">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} fullWidth size="lg">
          {isSubmitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={onToggleMode}
        fullWidth
        className="mt-6"
      >
        {mode === 'login'
          ? 'Need an account? Register'
          : 'Already have an account? Sign in'}
      </Button>
    </Card>
  );
}
