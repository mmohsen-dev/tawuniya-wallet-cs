'use client';

import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  wallet?: {
    id: string;
    balance: number;
    totalEarned: number;
    totalBurned: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Helper function to safely parse JSON from localStorage
  const safeParseJSON = (value: string | null): User | null => {
    if (!value || value === 'null' || value === 'undefined') {
      return null;
    }
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      // Clean up invalid data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      return null;
    }
  };

  // Initialize state from localStorage using lazy initialization
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      return safeParseJSON(storedUser);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      // Clean up invalid token values
      if (storedToken === 'null' || storedToken === 'undefined' || storedToken === '') {
        localStorage.removeItem('token');
        return null;
      }
      return storedToken;
    }
    return null;
  });

  const loading = false; // Auth state is initialized synchronously from localStorage

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login(email, password);
      console.log('✅ Login response:', response.data);
      
      // Handle new standardized response format: { success, message, data: { token, user } }
      // or fallback to old format: { token, user }
      const responseData = response.data;
      let token: string;
      let user: User;
      
      if (responseData.success && responseData.data) {
        // New standardized format
        token = responseData.data.token;
        user = responseData.data.user;
      } else if (responseData.token && responseData.user) {
        // Old format (backward compatibility)
        token = responseData.token;
        user = responseData.user;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      if (!token || !user) {
        throw new Error('Missing token or user data');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      console.log('✅ Login successful, user:', user);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', err.response?.data);
      
      // Handle standardized error format: { success: false, error, details }
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Login failed';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

