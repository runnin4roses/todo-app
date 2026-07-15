import { type FormEvent, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

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
    <div className="auth-card">
      <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
      <p className="subtitle">
        {mode === 'login'
          ? 'Access your personal task list.'
          : 'Start managing your tasks in one place.'}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={8}
          required
        />

        {error && <p className="field-error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <button type="button" className="link-button" onClick={onToggleMode}>
        {mode === 'login'
          ? 'Need an account? Register'
          : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
