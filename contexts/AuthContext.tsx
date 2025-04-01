import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, getCurrentUser, signOut, isAvailable } from '@/lib/auth';

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

        if (available) {
          console.log('Checking user login status...');
          const currentUser = await getCurrentUser();
          console.log('Current user status:', currentUser ? 'Logged in' : 'Not logged in');
          setUser(currentUser);
        } else {
          console.log('Apple Sign In is not available');
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