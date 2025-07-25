import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { DataInitializationService } from '../services/dataInitialization';
import { Exercise, Goal, Progress, WorkoutPlan } from '../types';
import { useAuth } from './AuthContext';

interface WorkoutContextType {
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  progress: Progress[];
  goals: Goal[];
  currentWorkout: WorkoutPlan | null;
  isLoading: boolean;
  
  // Exercise methods
  getExercisesByCategory: (category: string) => Exercise[];
  getExercisesByBodyPart: (bodyPart: string) => Exercise[];
  
  // Workout plan methods
  createWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => Promise<void>;
  setCurrentWorkout: (workout: WorkoutPlan | null) => void;
  
  // Progress methods
  addProgress: (progress: Omit<Progress, 'id'>) => Promise<void>;
  
  // Goal methods
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Initialize sample data if needed
        await DataInitializationService.initializeSampleData();
        
        // Load exercises from database
        const exercisesFromDb = await databaseService.getExercises();
        setExercises(exercisesFromDb);
        
        if (user) {
          // Load user-specific data
          const [userWorkoutPlans, userProgress, userGoals] = await Promise.all([
            databaseService.getWorkoutPlansByUser(user.id),
            databaseService.getProgressByUser(user.id),
            databaseService.getGoalsByUser(user.id)
          ]);
          
          setWorkoutPlans(userWorkoutPlans);
          setProgress(userProgress);
          setGoals(userGoals);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getExercisesByCategory = (category: string): Exercise[] => {
    return exercises.filter(exercise => exercise.category === category);
  };

  const getExercisesByBodyPart = (bodyPart: string): Exercise[] => {
    return exercises.filter(exercise => exercise.bodyPart.includes(bodyPart as any));
  };

  const createWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await databaseService.createWorkoutPlan(plan);
      await refreshData();
    } catch (error) {
      console.error('Error creating workout plan:', error);
      throw error;
    }
  };

  const addProgress = async (progressData: Omit<Progress, 'id'>) => {
    if (!user) return;
    
    try {
      await databaseService.createProgress(progressData);
      await refreshData();
    } catch (error) {
      console.error('Error adding progress:', error);
      throw error;
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await databaseService.createGoal(goalData);
      await refreshData();
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await databaseService.updateGoal(goalId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    if (!user) return;
    
    try {
      const [userWorkoutPlans, userProgress, userGoals] = await Promise.all([
        databaseService.getWorkoutPlansByUser(user.id),
        databaseService.getProgressByUser(user.id),
        databaseService.getGoalsByUser(user.id)
      ]);
      
      setWorkoutPlans(userWorkoutPlans);
      setProgress(userProgress);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const value = {
    exercises,
    workoutPlans,
    progress,
    goals,
    currentWorkout,
    isLoading,
    getExercisesByCategory,
    getExercisesByBodyPart,
    createWorkoutPlan,
    setCurrentWorkout,
    addProgress,
    addGoal,
    updateGoal,
    refreshData
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
