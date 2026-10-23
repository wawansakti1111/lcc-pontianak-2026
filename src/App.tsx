import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StageDisplay } from './components/stage/StageDisplay';
import { AdminPanel } from './components/admin/AdminPanel';

function ScoreboardRouter() {
  const navigate = useNavigate();

  // Support shortcut keys: 'A' to go to /admin, 'D' to go to /display
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only when not typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        navigate('/admin');
      } else if (e.key === 'd' || e.key === 'D') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={<StageDisplay />}
      />
      <Route
        path="/display"
        element={<StageDisplay />}
      />
      <Route
        path="/admin"
        element={<AdminPanel onOpenStage={() => navigate('/')} />}
      />
      {/* Fallback route */}
      <Route
        path="*"
        element={<StageDisplay />}
      />
    </Routes>
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
