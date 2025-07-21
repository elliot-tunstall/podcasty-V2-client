"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from '../services/authService.ts';
import type { User } from '../types/user'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // you should check for an existing session/token here
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when the app loads
  useEffect(() => {
    authService.setAuthUserUpdater(setUser);

    // Load user if already logged in
    const fetchUser = async () => {
      await authService.getCurrentUser();
      setLoading(false);
    };

    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ 
    user, 
    setUser, 
    isAuthenticated: !!user, 
    loading,
  }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
