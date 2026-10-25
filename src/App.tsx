import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StageDisplay } from './components/stage/StageDisplay';
import { AdminPanel } from './components/admin/AdminPanel';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function ScoreboardRouter() {
  const navigate = useNavigate();

  // Support shortcut keys with Alt modifier: Alt+A to go to /admin, Alt+D to go to /display
  // Using Alt prevents accidental navigation while typing or clicking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        navigate('/admin');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <ErrorBoundary fallbackTitle="Kendala Sistem Scoreboard">
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary fallbackTitle="Kendala Layar Panggung">
              <StageDisplay />
            </ErrorBoundary>
          }
        />
        <Route
          path="/display"
          element={
            <ErrorBoundary fallbackTitle="Kendala Layar Panggung">
              <StageDisplay />
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin"
          element={
            <ErrorBoundary fallbackTitle="Kendala Panel Admin">
              <AdminPanel onOpenStage={() => window.open('/', '_blank')} />
            </ErrorBoundary>
          }
        />
        {/* Fallback route */}
        <Route
          path="*"
          element={
            <ErrorBoundary fallbackTitle="Kendala Layar Panggung">
              <StageDisplay />
            </ErrorBoundary>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScoreboardRouter />
    </BrowserRouter>
  );
}

export default App;
