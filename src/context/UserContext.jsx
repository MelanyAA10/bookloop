import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);
const USER_STORAGE_KEY = 'bookloop_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('[UserContext] Error leyendo localStorage:', err);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
  return null;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const isLoading = false;

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}