
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Format user data to match our app's user structure
  const formatUser = (userData: any): User => {
    if (!userData) return null;
    
    return {
      id: userData.id,
      name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'User',
      email: userData.email || '',
      photoURL: userData.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'User')}&background=0D8ABC&color=fff`,
    };
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          const formattedUser = formatUser(session.user);
          setUser(formattedUser);
          localStorage.setItem('workout-tracker-user', JSON.stringify(formattedUser));
        } else {
          setUser(null);
          localStorage.removeItem('workout-tracker-user');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const formattedUser = formatUser(session.user);
        setUser(formattedUser);
        localStorage.setItem('workout-tracker-user', JSON.stringify(formattedUser));
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      toast.success('Redirecting to Google...');
    } catch (error) {
      console.error('Google sign in error', error);
      toast.error('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Email sign in error', error);
      toast.error('Failed to sign in. Please check your credentials and try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signOut }}>
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
