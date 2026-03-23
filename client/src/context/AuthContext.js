import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const updateAuth = (userData, token) => {
    if (userData && token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    const storedUser = getCurrentUser();
    const auth = isAuthenticated();
    setUser(storedUser);
    setAuthenticated(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, authenticated, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
