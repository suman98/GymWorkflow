import { sampleExercises } from '../data/exercises';
import { databaseService } from './database';

export class DataInitializationService {
  static async initializeSampleData() {
    try {
      // Check if exercises already exist
      const existingExercises = await databaseService.getExercises();
      
      if (existingExercises.length === 0) {
        console.log('Initializing sample exercises...');
        
        // Insert sample exercises
        for (const exercise of sampleExercises) {
          await databaseService.addExercise(exercise);
        }
        
        console.log('Sample exercises initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }
}
