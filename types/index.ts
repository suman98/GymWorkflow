export interface User {
  id: string;
  email: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number; // in cm
  weight: number; // in kg
  targetBodyType: 'lean' | 'muscular' | 'athletic' | 'bulky';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  bodyPart: BodyPart[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string[];
  tips: string[];
  imageUrl?: string;
  videoUrl?: string;
  duration?: number; // in seconds
  reps?: number;
  sets?: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // in minutes
  difficulty: Difficulty;
  targetBodyParts: BodyPart[];
  createdAt: Date;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  duration?: number; // in seconds
  restTime: number; // in seconds
  weight?: number; // in kg
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  startTime: Date;
  endTime?: Date;
  completedExercises: CompletedExercise[];
  totalDuration: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface CompletedExercise {
  exerciseId: string;
  completedSets: CompletedSet[];
  notes?: string;
}

export interface CompletedSet {
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
}

export interface Progress {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: BodyMeasurements;
  photos?: string[];
  notes?: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  isCompleted: boolean;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  type: 'workout' | 'measurement' | 'goal';
  title: string;
  message: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday to Saturday)
  isActive: boolean;
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'plyometric'
  | 'isometric';

export type BodyPart = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'glutes'
  | 'core'
  | 'full-body';

export type Equipment = 
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebell'
  | 'resistance-bands'
  | 'pull-up-bar'
  | 'bench'
  | 'cable-machine'
  | 'treadmill'
  | 'bicycle'
  | 'yoga-mat';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface UserPreferences {
  workoutDuration: number; // preferred workout duration in minutes
  workoutFrequency: number; // days per week
  availableEquipment: Equipment[];
  preferredBodyParts: BodyPart[];
  avoidedBodyParts: BodyPart[];
  workoutTime: 'morning' | 'afternoon' | 'evening';
  notifications: {
    workoutReminders: boolean;
    progressReminders: boolean;
    goalDeadlines: boolean;
    motivationalMessages: boolean;
  };
}
