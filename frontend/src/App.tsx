import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundPreferenceProvider } from './context/SoundPreferenceContext';
import { AuthForm } from './components/AuthForm';
import { TodoApp } from './components/TodoApp';
import { ClayBackground } from './components/ui/ClayBackground';

function AppContent() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (isInitializing) {
    return (
      <main className="relative grid min-h-screen place-items-center px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-clay-breathe rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-clay-button" />
          <p className="m-0 text-base font-medium text-clay-muted">
            Restoring your session...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="relative grid min-h-screen place-items-center px-4 py-8 sm:px-6">
        <AuthForm
          mode={authMode}
          onToggleMode={() =>
            setAuthMode((current) => (current === 'login' ? 'register' : 'login'))
          }
        />
      </main>
    );
  }

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-8 pb-12 sm:px-6 md:py-12 lg:py-16">
      <TodoApp />
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <SoundPreferenceProvider>
        <ClayBackground />
        <AppContent />
      </SoundPreferenceProvider>
    </AuthProvider>
  );
}

export default App;
