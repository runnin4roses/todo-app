import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/AuthForm';
import './App.css';

function AppContent() {
  const { isAuthenticated, email, logout } = useAuth();
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
    <main className="signed-in-layout">
      <div className="auth-card">
        <h1>Signed in</h1>
        <p className="subtitle">Welcome back, {email}.</p>
        <p className="subtitle">Todo UI coming in the next commit.</p>
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </div>
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
