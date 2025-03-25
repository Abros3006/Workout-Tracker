
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/ui/sonner';

type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g. from localStorage)
    const savedUser = localStorage.getItem('workout-tracker-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('workout-tracker-user');
      }
    }
    setLoading(false);
  }, []);

  // Mock Google Sign-In for now - will be replaced with actual implementation
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: 'google-user-123',
        name: 'Demo User',
        email: 'demo@example.com',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
      };
      
      setUser(mockUser);
      localStorage.setItem('workout-tracker-user', JSON.stringify(mockUser));
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Sign in error', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem('workout-tracker-user');
      toast.success('You have been signed out');
    } catch (error) {
      console.error('Sign out error', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
