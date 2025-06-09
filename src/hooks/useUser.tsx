import { useState, useCallback, useEffect } from 'react';
import { User } from '../utils/auth.types';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAnonymous: boolean;
};

// Global state for user data
let globalUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

const notifyListeners = (user: User | null) => {
  listeners.forEach(listener => listener(user));
};

export default function useUser(): UserContextType {
  const [user, setLocalUser] = useState<User | null>(globalUser);

  const setUser = useCallback((newUser: User | null) => {
    globalUser = newUser;
    setLocalUser(newUser);
    notifyListeners(newUser);
  }, []);

  // Subscribe to changes
  useEffect(() => {
    listeners.add(setLocalUser);
    return () => {
      listeners.delete(setLocalUser);
    };
  }, []);

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    isAnonymous: user?.isAnonymous ?? false,
  };
}
