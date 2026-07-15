import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import { TodoApp } from './components/TodoApp';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return (
      <main className="auth-layout">
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
    <main>
      <TodoApp />
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
