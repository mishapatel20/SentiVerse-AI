import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sentiverse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sentiverse_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getCurrentUser();
          setUser(res.data.user);
          localStorage.setItem('sentiverse_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sentiverse_token', newToken);
    localStorage.setItem('sentiverse_user', JSON.stringify(newUser));
    return newUser;
  };

  const register = async (email, password, full_name) => {
    const res = await authAPI.register({ email, password, full_name });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sentiverse_token', newToken);
    localStorage.setItem('sentiverse_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sentiverse_token');
    localStorage.removeItem('sentiverse_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newU = { ...prev, ...updatedData };
      localStorage.setItem('sentiverse_user', JSON.stringify(newU));
      return newU;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
