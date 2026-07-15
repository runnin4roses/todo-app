import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { TodoApp } from './components/TodoApp';
import { ClayBackground } from './components/ui/ClayBackground';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

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
      <ClayBackground />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
