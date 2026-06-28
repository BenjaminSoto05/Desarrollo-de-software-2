import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    if (!token) return;
    authAPI.getProfile()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        logout();
      })
      .finally(() => { setLoading(false); });
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: jwt } = res.data.data;
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
    return userData;
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
