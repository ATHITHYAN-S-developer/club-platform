import { createContext, useContext, useState, useEffect } from 'react';
import db from '../db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = db.subscribeAuth((profile) => {
      setUser(profile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await db.login(email, password);
  };

  const loginWithGoogle = async () => {
    return await db.loginWithGoogle();
  };

  const register = async (name, email, password, ...extra) => {
    return await db.register(name, email, password, ...extra);
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, loginWithGoogle, register, logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
