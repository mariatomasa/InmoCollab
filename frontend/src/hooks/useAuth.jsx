import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login(email, password);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }, []);

  const loginDemo = useCallback(async (role) => {
    const email = role === 'admin' ? 'janire@mariatomasa.com' : 'demo@costablancahomes.com';
    const password = role === 'admin' ? 'admin2026' : 'demo2026';
    return login(email, password);
  }, [login]);

  const register = useCallback(async (data) => {
    const { token, user: u } = await api.register(data);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await api.me();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
