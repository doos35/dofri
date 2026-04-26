import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LinksProvider } from './context/LinksContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import DiscussionsPage from './pages/DiscussionsPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import FreetchPage from './pages/FreetchPage';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LinksProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/discussions" element={<DiscussionsPage />} />
                <Route path="/discussions/:id" element={<DiscussionDetailPage />} />
                <Route path="/freetch" element={<FreetchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </LinksProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
