import { User, Exercise, WorkoutPlan, WorkoutExercise, BodyPart, Difficulty } from '../types';

interface WorkoutPreferences {
  duration: number; // in minutes
  frequency: number; // days per week
  targetBodyParts?: BodyPart[];
  excludeBodyParts?: BodyPart[];
  availableEquipment?: string[];
}

export class WorkoutPlanGenerator {
  static generatePersonalizedPlan(
    user: User,
    exercises: Exercise[],
    preferences: WorkoutPreferences
  ): WorkoutPlan {
    const difficulty = this.getDifficultyBasedOnLevel(user.fitnessLevel);
    const targetBodyParts = this.getTargetBodyParts(user.targetBodyType, preferences.targetBodyParts);
    const selectedExercises = this.selectExercises(exercises, targetBodyParts, difficulty, preferences);
    const workoutExercises = this.createWorkoutExercises(selectedExercises, user.fitnessLevel);

    return {
      id: '',
      userId: user.id,
      name: `${user.targetBodyType.charAt(0).toUpperCase() + user.targetBodyType.slice(1)} Training Plan`,
      description: `Personalized ${preferences.duration}-minute workout plan tailored for ${user.targetBodyType} body type`,
      exercises: workoutExercises,
      estimatedDuration: preferences.duration,
      difficulty,
      targetBodyParts,
      createdAt: new Date()
    };
  }

  private static getDifficultyBasedOnLevel(fitnessLevel: string): Difficulty {
    switch (fitnessLevel) {
      case 'beginner':
        return 'beginner';
      case 'intermediate':
        return 'intermediate';
      case 'advanced':
        return 'advanced';
      default:
        return 'beginner';
    }
  }

  private static getTargetBodyParts(targetBodyType: string, preferredParts?: BodyPart[]): BodyPart[] {
    if (preferredParts && preferredParts.length > 0) {
      return preferredParts;
    }

    switch (targetBodyType) {
      case 'lean':
        return ['core', 'full-body'];
      case 'muscular':
        return ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
      case 'athletic':
        return ['full-body', 'core', 'quadriceps', 'glutes'];
      case 'bulky':
        return ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps'];
      default:
        return ['full-body'];
    }
  }

  private static selectExercises(
    exercises: Exercise[],
    targetBodyParts: BodyPart[],
    difficulty: Difficulty,
    preferences: WorkoutPreferences
  ): Exercise[] {
    let filteredExercises = exercises.filter(exercise => {
      // Filter by difficulty
      const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const exerciseDifficulty = difficultyOrder[exercise.difficulty];
      const targetDifficulty = difficultyOrder[difficulty];
      
      if (exerciseDifficulty > targetDifficulty) {
        return false;
      }

      // Filter by target body parts
      const hasTargetBodyPart = exercise.bodyPart.some(part => 
        targetBodyParts.includes(part) || part === 'full-body'
      );

      if (!hasTargetBodyPart) {
        return false;
      }

      // Filter by available equipment if specified
      if (preferences.availableEquipment && preferences.availableEquipment.length > 0) {
        const hasAvailableEquipment = exercise.equipment.some(eq => 
          preferences.availableEquipment!.includes(eq) || eq === 'bodyweight'
        );
        if (!hasAvailableEquipment) {
          return false;
        }
      }

      // Exclude unwanted body parts
      if (preferences.excludeBodyParts && preferences.excludeBodyParts.length > 0) {
        const hasExcludedBodyPart = exercise.bodyPart.some(part => 
          preferences.excludeBodyParts!.includes(part)
        );
        if (hasExcludedBodyPart) {
          return false;
        }
      }

      return true;
    });

    // Select exercises to fit the duration
    const exercisesPerBodyPart = Math.max(1, Math.floor(preferences.duration / 10)); // ~10 minutes per exercise
    const selectedExercises: Exercise[] = [];

    // Group exercises by primary body part
    const exercisesByBodyPart: { [key: string]: Exercise[] } = {};
    filteredExercises.forEach(exercise => {
      const primaryBodyPart = exercise.bodyPart[0];
      if (!exercisesByBodyPart[primaryBodyPart]) {
        exercisesByBodyPart[primaryBodyPart] = [];
      }
      exercisesByBodyPart[primaryBodyPart].push(exercise);
    });

    // Select exercises from each target body part
    targetBodyParts.forEach(bodyPart => {
      const bodyPartExercises = exercisesByBodyPart[bodyPart] || [];
      const shuffled = bodyPartExercises.sort(() => 0.5 - Math.random());
      selectedExercises.push(...shuffled.slice(0, exercisesPerBodyPart));
    });

    // If we don't have enough exercises, add more from any category
    const totalExercisesNeeded = Math.floor(preferences.duration / 8); // ~8 minutes per exercise
    if (selectedExercises.length < totalExercisesNeeded) {
      const remaining = filteredExercises.filter(ex => !selectedExercises.includes(ex));
      const shuffled = remaining.sort(() => 0.5 - Math.random());
      selectedExercises.push(...shuffled.slice(0, totalExercisesNeeded - selectedExercises.length));
    }

    return selectedExercises.slice(0, totalExercisesNeeded);
  }

  private static createWorkoutExercises(exercises: Exercise[], fitnessLevel: string): WorkoutExercise[] {
    const baseMultiplier = this.getBaseMultiplier(fitnessLevel);

    return exercises.map(exercise => {
      const sets = Math.max(2, Math.floor((exercise.sets || 3) * baseMultiplier));
      const reps = Math.max(5, Math.floor((exercise.reps || 10) * baseMultiplier));
      const duration = exercise.duration ? Math.max(15, Math.floor(exercise.duration * baseMultiplier)) : undefined;

      return {
        exerciseId: exercise.id,
        exercise,
        sets,
        reps,
        duration,
        restTime: this.getRestTime(fitnessLevel, exercise.difficulty),
        notes: `Perform ${sets} sets of ${reps} repetitions${duration ? ` for ${duration} seconds` : ''}`
      };
    });
  }

  private static getBaseMultiplier(fitnessLevel: string): number {
    switch (fitnessLevel) {
      case 'beginner':
        return 0.7;
      case 'intermediate':
        return 1.0;
      case 'advanced':
        return 1.3;
      default:
        return 1.0;
    }
  }

  private static getRestTime(fitnessLevel: string, exerciseDifficulty: Difficulty): number {
    const baseRestTime = {
      'beginner': 90,
      'intermediate': 60,
      'advanced': 45
    };

    const difficultyMultiplier = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2
    };

    const base = baseRestTime[fitnessLevel as keyof typeof baseRestTime] || 60;
    const multiplier = difficultyMultiplier[exerciseDifficulty];

    return Math.floor(base * multiplier);
  }

  static generateWeeklySchedule(
    user: User,
    exercises: Exercise[],
    preferences: WorkoutPreferences
  ): WorkoutPlan[] {
    const plans: WorkoutPlan[] = [];
    const bodyPartRotation = this.getBodyPartRotation(user.targetBodyType, preferences.frequency);

    for (let day = 0; day < preferences.frequency; day++) {
      const dayBodyParts = bodyPartRotation[day % bodyPartRotation.length];
      const dayPreferences = {
        ...preferences,
        targetBodyParts: dayBodyParts
      };

      const plan = this.generatePersonalizedPlan(user, exercises, dayPreferences);
      plan.name = `Day ${day + 1} - ${dayBodyParts.join(', ').replace(/^\w/, c => c.toUpperCase())}`;
      plans.push(plan);
    }

    return plans;
  }

  private static getBodyPartRotation(targetBodyType: string, frequency: number): BodyPart[][] {
    const rotations: { [key: number]: BodyPart[][] } = {
      3: [
        ['chest', 'triceps', 'shoulders'],
        ['back', 'biceps'],
        ['quadriceps', 'glutes', 'hamstrings']
      ],
      4: [
        ['chest', 'triceps'],
        ['back', 'biceps'],
        ['shoulders', 'core'],
        ['quadriceps', 'glutes', 'hamstrings']
      ],
      5: [
        ['chest', 'triceps'],
        ['back', 'biceps'],
        ['shoulders'],
        ['quadriceps', 'glutes'],
        ['hamstrings', 'calves', 'core']
      ],
      6: [
        ['chest'],
        ['back'],
        ['shoulders'],
        ['biceps', 'triceps'],
        ['quadriceps', 'glutes'],
        ['hamstrings', 'calves', 'core']
      ]
    };

    // Default to full-body for other frequencies
    if (!rotations[frequency]) {
      return Array(frequency).fill(['full-body']);
    }

    return rotations[frequency];
  }
}
