import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { ProgressInitializationService } from '../services/progressInitialization';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-login with demo user for testing
    const initDemoUser = async () => {
      try {
        const demoUser = await databaseService.getUserByEmail('demo@gym.com');
        if (demoUser) {
          setUser(demoUser);
        } else {
          // Create demo user if doesn't exist
          await databaseService.createUser({
            email: 'demo@gym.com',
            name: 'Demo User',
            gender: 'male',
            age: 25,
            height: 175,
            weight: 70,
            targetBodyType: 'athletic',
            fitnessLevel: 'intermediate',
            goals: ['Build muscle', 'Lose fat', 'Improve endurance']
          });
          
          const createdUser = await databaseService.getUserByEmail('demo@gym.com');
          if (createdUser) {
            setUser(createdUser);
            // Initialize sample progress data
            await ProgressInitializationService.initializeSampleProgress(createdUser.id);
          }
        }
      } catch (error) {
        console.error('Error initializing demo user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDemoUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, you would validate password here
      const userData = await databaseService.getUserByEmail(email);
      
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      await databaseService.createUser(userData);
      const newUser = await databaseService.getUserByEmail(userData.email);
      
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      await databaseService.updateUser(user.id, updates);
      setUser({ ...user, ...updates, updatedAt: new Date() });
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
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
