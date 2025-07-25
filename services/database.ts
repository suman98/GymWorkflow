import * as SQLite from 'expo-sqlite';
import { Exercise, Goal, Progress, User, WorkoutPlan } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('gymWorkflow.db');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    try {
      // Users table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          gender TEXT NOT NULL,
          age INTEGER NOT NULL,
          height REAL NOT NULL,
          weight REAL NOT NULL,
          targetBodyType TEXT NOT NULL,
          fitnessLevel TEXT NOT NULL,
          goals TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        );
      `);

      // Exercises table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS exercises (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          bodyPart TEXT NOT NULL,
          equipment TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          instructions TEXT NOT NULL,
          tips TEXT,
          imageUrl TEXT,
          videoUrl TEXT,
          duration INTEGER,
          reps INTEGER,
          sets INTEGER
        );
      `);

      // Workout plans table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS workoutPlans (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          exercises TEXT NOT NULL,
          estimatedDuration INTEGER NOT NULL,
          difficulty TEXT NOT NULL,
          targetBodyParts TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);

      // Workout sessions table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS workoutSessions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          workoutPlanId TEXT NOT NULL,
          startTime TEXT NOT NULL,
          endTime TEXT,
          completedExercises TEXT NOT NULL,
          totalDuration INTEGER NOT NULL,
          notes TEXT,
          rating INTEGER,
          FOREIGN KEY (userId) REFERENCES users (id),
          FOREIGN KEY (workoutPlanId) REFERENCES workoutPlans (id)
        );
      `);

      // Progress table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS progress (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          date TEXT NOT NULL,
          weight REAL,
          bodyFat REAL,
          muscleMass REAL,
          measurements TEXT,
          photos TEXT,
          notes TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);

      // Goals table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS goals (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          targetValue REAL NOT NULL,
          currentValue REAL NOT NULL,
          unit TEXT NOT NULL,
          deadline TEXT,
          isCompleted INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);

      // Reminders table
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          time TEXT NOT NULL,
          days TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // User methods
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    try {
      await this.db.runAsync(
        `INSERT INTO users (id, email, name, gender, age, height, weight, targetBodyType, fitnessLevel, goals, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.email, user.name, user.gender, user.age, user.height, user.weight, user.targetBodyType, user.fitnessLevel, JSON.stringify(user.goals), now, now]
      );
      return id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE email = ?',
        [email]
      ) as any;

      if (!result) return null;

      return {
        ...result,
        goals: JSON.parse(result.goals),
        createdAt: new Date(result.createdAt),
        updatedAt: new Date(result.updatedAt)
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const now = new Date().toISOString();
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    const values = fields.map(field => {
      if (field === 'goals') {
        return JSON.stringify(updates[field as keyof User]);
      }
      return updates[field as keyof User];
    });
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    try {
      await this.db.runAsync(
        `UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?`,
        [...values, now, userId]
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Exercise methods
  async addExercise(exercise: Exercise): Promise<void> {
    try {
      await this.db.runAsync(
        `INSERT INTO exercises (id, name, category, bodyPart, equipment, difficulty, instructions, tips, imageUrl, videoUrl, duration, reps, sets)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.id,
          exercise.name,
          exercise.category,
          JSON.stringify(exercise.bodyPart),
          JSON.stringify(exercise.equipment),
          exercise.difficulty,
          JSON.stringify(exercise.instructions),
          JSON.stringify(exercise.tips || []),
          exercise.imageUrl || null,
          exercise.videoUrl || null,
          exercise.duration || null,
          exercise.reps || null,
          exercise.sets || null
        ]
      );
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  async getExercises(): Promise<Exercise[]> {
    try {
      const results = await this.db.getAllAsync('SELECT * FROM exercises') as any[];
      
      return results.map(result => ({
        ...result,
        bodyPart: JSON.parse(result.bodyPart),
        equipment: JSON.parse(result.equipment),
        instructions: JSON.parse(result.instructions),
        tips: result.tips ? JSON.parse(result.tips) : []
      }));
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    try {
      const results = await this.db.getAllAsync(
        'SELECT * FROM exercises WHERE category = ?',
        [category]
      ) as any[];
      
      return results.map(result => ({
        ...result,
        bodyPart: JSON.parse(result.bodyPart),
        equipment: JSON.parse(result.equipment),
        instructions: JSON.parse(result.instructions),
        tips: result.tips ? JSON.parse(result.tips) : []
      }));
    } catch (error) {
      console.error('Error getting exercises by category:', error);
      return [];
    }
  }

  // Workout plan methods
  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'id' | 'createdAt'>): Promise<string> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    try {
      await this.db.runAsync(
        `INSERT INTO workoutPlans (id, userId, name, description, exercises, estimatedDuration, difficulty, targetBodyParts, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, plan.userId, plan.name, plan.description, JSON.stringify(plan.exercises), plan.estimatedDuration, plan.difficulty, JSON.stringify(plan.targetBodyParts), now]
      );
      return id;
    } catch (error) {
      console.error('Error creating workout plan:', error);
      throw error;
    }
  }

  async getWorkoutPlansByUser(userId: string): Promise<WorkoutPlan[]> {
    try {
      const results = await this.db.getAllAsync(
        'SELECT * FROM workoutPlans WHERE userId = ?',
        [userId]
      ) as any[];
      
      return results.map(result => ({
        ...result,
        exercises: JSON.parse(result.exercises),
        targetBodyParts: JSON.parse(result.targetBodyParts),
        createdAt: new Date(result.createdAt)
      }));
    } catch (error) {
      console.error('Error getting workout plans:', error);
      return [];
    }
  }

  // Progress methods
  async createProgress(progress: Omit<Progress, 'id'>): Promise<string> {
    const id = Date.now().toString();
    
    try {
      await this.db.runAsync(
        `INSERT INTO progress (id, userId, date, weight, bodyFat, muscleMass, measurements, photos, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          progress.userId,
          progress.date.toISOString(),
          progress.weight || null,
          progress.bodyFat || null,
          progress.muscleMass || null,
          progress.measurements ? JSON.stringify(progress.measurements) : null,
          progress.photos ? JSON.stringify(progress.photos) : null,
          progress.notes || null
        ]
      );
      return id;
    } catch (error) {
      console.error('Error creating progress:', error);
      throw error;
    }
  }

  async getProgressByUser(userId: string): Promise<Progress[]> {
    try {
      const results = await this.db.getAllAsync(
        'SELECT * FROM progress WHERE userId = ? ORDER BY date DESC',
        [userId]
      ) as any[];
      
      return results.map(result => ({
        ...result,
        date: new Date(result.date),
        measurements: result.measurements ? JSON.parse(result.measurements) : undefined,
        photos: result.photos ? JSON.parse(result.photos) : undefined
      }));
    } catch (error) {
      console.error('Error getting progress:', error);
      return [];
    }
  }

  // Goal methods
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<string> {
    const id = Date.now().toString();
    const now = new Date().toISOString();
    
    try {
      await this.db.runAsync(
        `INSERT INTO goals (id, userId, title, description, targetValue, currentValue, unit, deadline, isCompleted, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          goal.userId,
          goal.title,
          goal.description || null,
          goal.targetValue,
          goal.currentValue,
          goal.unit,
          goal.deadline ? goal.deadline.toISOString() : null,
          goal.isCompleted ? 1 : 0,
          now
        ]
      );
      return id;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    try {
      const results = await this.db.getAllAsync(
        'SELECT * FROM goals WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      ) as any[];
      
      return results.map(result => ({
        ...result,
        deadline: result.deadline ? new Date(result.deadline) : undefined,
        isCompleted: result.isCompleted === 1,
        createdAt: new Date(result.createdAt)
      }));
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    const values = fields.map(field => {
      if (field === 'deadline') {
        const deadline = updates[field as keyof Goal] as Date | undefined;
        return deadline ? deadline.toISOString() : null;
      }
      if (field === 'isCompleted') {
        return updates[field as keyof Goal] ? 1 : 0;
      }
      const value = updates[field as keyof Goal];
      return value !== undefined ? value : null;
    });
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    try {
      const params = [...values, goalId] as (string | number | null)[];
      await this.db.runAsync(
        `UPDATE goals SET ${setClause} WHERE id = ?`,
        params
      );
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
