'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    console.log('🔍 UserContext: Checking auth status...');
    setIsLoading(true);
    
    try {
      const data = await api.getCurrentUser();
      console.log('📡 UserContext: Auth check response:', data);
      
      // Handle the response properly - 401 is not an error, just not logged in
      if (data && data.success && data.user) {
        console.log('✅ UserContext: User authenticated:', data.user.email);
        setUser(data.user);
      } else {
        // This is the expected state when not logged in
        console.log('ℹ️ UserContext: No authenticated user (normal if logged out)');
        setUser(null);
      }
    } catch (error) {
      // Catch any unexpected errors, but don't treat 401 as error
      console.log('ℹ️ UserContext: Not authenticated (normal state)');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 UserContext: Attempting login...');
    setIsLoading(true);
    
    try {
      const data = await api.login(email, password);
      console.log('📡 UserContext: Login response:', data);
      
      if (data && data.success && data.user) {
        console.log('✅ UserContext: Login successful for:', data.user.email);
        setUser(data.user);
        return true;
      } else {
        console.log('❌ UserContext: Login failed -', data?.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('🔥 UserContext: Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🔍 UserContext: Logging out...');
    setIsLoading(true);
    
    try {
      const data = await api.logout();
      console.log('✅ UserContext: Logout successful', data);
      setUser(null);
    } catch (error) {
      console.error('🔥 UserContext: Logout error:', error);
      // Still clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Provide context value
  const contextValue: UserContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}