import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useThemeStore } from './store/useThemeStore';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import ConfirmEmail from './pages/ConfirmEmail';
import NewProject from './pages/NewProject';
import Projects from './pages/Projects';

function App() {
  const theme = useThemeStore((state) => state.theme);

  // Set theme immediately on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Set initial theme before hydration
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme-storage');
    if (storedTheme) {
      try {
        const parsed = JSON.parse(storedTheme);
        if (parsed.state?.theme) {
          document.documentElement.setAttribute('data-theme', parsed.state.theme);
        }
      } catch (e) {
        // If parsing fails, use default
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
