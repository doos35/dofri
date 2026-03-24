import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lp_token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('lp_username'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        setUsername(res.data.username);
        setLoading(false);
      })
      .catch(() => {
        // Token expired or invalid
        localStorage.removeItem('lp_token');
        localStorage.removeItem('lp_username');
        setToken(null);
        setUsername(null);
        setLoading(false);
      });
  }, [token]);

  const login = useCallback(async (user: string, password: string) => {
    const { data } = await axios.post('/api/auth/login', { username: user, password });
    setToken(data.token);
    setUsername(data.username);
    localStorage.setItem('lp_token', data.token);
    localStorage.setItem('lp_username', data.username);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('lp_token');
    localStorage.removeItem('lp_username');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
