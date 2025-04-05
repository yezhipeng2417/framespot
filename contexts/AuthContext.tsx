/*
 * @Description: 
 * @Date: 2025-04-01 17:41:06
 * @LastEditTime: 2025-04-01 19:30:17
 * @FilePath: /framespot/contexts/AuthContext.tsx
 * @LastEditors: Xinyi Yan
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, getCurrentUser, signOut, isAvailable, getUserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAppleAuthAvailable: boolean;
  handleSignOut: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('Checking Apple Sign In availability...');
        const available = await isAvailable();
        setIsAppleAuthAvailable(available);

        console.log('Checking user login status...');
        const currentUser = await getCurrentUser();
        console.log('Current user status:', currentUser ? 'Logged in' : 'Not logged in');
        
        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    initialize();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session) {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('User signed out, clearing state...');
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAppleAuthAvailable, 
        handleSignOut,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 