import { Progress } from '@/types';
import { databaseService } from './database';

export class ProgressInitializationService {
  static async initializeSampleProgress(userId: string): Promise<void> {
    try {
      // Check if progress data already exists
      const existingProgress = await databaseService.getProgressByUser(userId);
      if (existingProgress.length > 0) {
        console.log('Progress data already exists, skipping initialization');
        return;
      }

      console.log('Initializing sample progress data...');

      // Create sample progress entries for the past 30 days
      const sampleProgressData: Omit<Progress, 'id'>[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Create realistic progression data
        const baseWeight = 70;
        const baseBodyFat = 15;
        const baseMuscle = 45;
        
        // Add some variation and trend
        const progressFactor = (29 - i) / 29; // 0 to 1 over time
        const randomVariation = (Math.random() - 0.5) * 2; // -1 to 1
        
        const weight = baseWeight + (progressFactor * -2) + randomVariation; // Losing weight
        const bodyFat = baseBodyFat + (progressFactor * -3) + (randomVariation * 0.5); // Losing body fat
        const muscleMass = baseMuscle + (progressFactor * 3) + (randomVariation * 0.3); // Gaining muscle
        
        // Only add measurements every few days
        const shouldAddMeasurements = i % 7 === 0;
        
        sampleProgressData.push({
          userId,
          date,
          weight: Math.round(weight * 10) / 10,
          bodyFat: Math.round(bodyFat * 10) / 10,
          muscleMass: Math.round(muscleMass * 10) / 10,
          measurements: shouldAddMeasurements ? {
            chest: 100 + progressFactor * 3 + randomVariation,
            waist: 80 - progressFactor * 5 + randomVariation,
            hips: 95 + progressFactor * 2 + randomVariation,
            biceps: 35 + progressFactor * 2 + randomVariation * 0.5,
            thighs: 55 + progressFactor * 3 + randomVariation,
            neck: 38 + progressFactor * 1 + randomVariation * 0.3,
          } : undefined,
          notes: i % 10 === 0 ? [
            "Feeling stronger today! 💪",
            "Great workout session, pushing harder",
            "Rest day but feeling good",
            "New personal record on bench press!",
            "Energy levels are improving"
          ][Math.floor(Math.random() * 5)] : undefined,
        });
      }

      // Insert all progress data
      for (const progressEntry of sampleProgressData) {
        await databaseService.createProgress(progressEntry);
      }

      console.log(`Initialized ${sampleProgressData.length} progress entries`);
    } catch (error) {
      console.error('Error initializing sample progress:', error);
    }
  }
}
