import { Exercise } from '../types';

export const sampleExercises: Exercise[] = [
  // Strength Exercises - Chest
  {
    id: '1',
    name: 'Push-ups',
    category: 'strength',
    bodyPart: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push back up to the starting position',
      'Keep your core engaged throughout the movement'
    ],
    tips: [
      'Keep your body in a straight line from head to heels',
      'Don\'t let your hips sag or pike up',
      'Breathe in as you lower, breathe out as you push up'
    ],
    reps: 10,
    sets: 3
  },
  {
    id: '2',
    name: 'Dumbbell Bench Press',
    category: 'strength',
    bodyPart: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    instructions: [
      'Lie on a bench with dumbbells in each hand',
      'Position dumbbells at chest level with arms extended',
      'Lower the weights to chest level',
      'Press the weights back up to starting position'
    ],
    tips: [
      'Keep your feet flat on the floor',
      'Maintain a slight arch in your back',
      'Control the weight on both up and down movements'
    ],
    reps: 8,
    sets: 4
  },

  // Strength Exercises - Back
  {
    id: '3',
    name: 'Pull-ups',
    category: 'strength',
    bodyPart: ['back', 'biceps'],
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with palms facing away',
      'Pull yourself up until your chin clears the bar',
      'Lower yourself back to the starting position with control',
      'Repeat for desired repetitions'
    ],
    tips: [
      'Keep your core engaged',
      'Don\'t swing or use momentum',
      'Focus on pulling with your back muscles'
    ],
    reps: 6,
    sets: 3
  },

  // Strength Exercises - Legs
  {
    id: '4',
    name: 'Bodyweight Squats',
    category: 'strength',
    bodyPart: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind your toes',
      'Return to standing position'
    ],
    tips: [
      'Keep your weight on your heels',
      'Don\'t let your knees cave inward',
      'Go as low as your mobility allows'
    ],
    reps: 15,
    sets: 3
  },
  {
    id: '5',
    name: 'Lunges',
    category: 'strength',
    bodyPart: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Step forward with one leg',
      'Lower your hips until both knees are bent at 90 degrees',
      'Push back to starting position',
      'Repeat with other leg'
    ],
    tips: [
      'Keep your front knee over your ankle',
      'Don\'t let your front knee drift over your toes',
      'Keep your torso upright'
    ],
    reps: 10,
    sets: 3
  },

  // Cardio Exercises
  {
    id: '6',
    name: 'Jumping Jacks',
    category: 'cardio',
    bodyPart: ['full-body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start standing with feet together and arms at sides',
      'Jump feet apart while raising arms overhead',
      'Jump back to starting position',
      'Repeat at a steady pace'
    ],
    tips: [
      'Land softly on the balls of your feet',
      'Keep a steady rhythm',
      'Breathe steadily throughout'
    ],
    duration: 30,
    sets: 3
  },
  {
    id: '7',
    name: 'Mountain Climbers',
    category: 'cardio',
    bodyPart: ['core', 'shoulders', 'quadriceps'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: [
      'Start in a plank position',
      'Bring one knee toward your chest',
      'Quickly switch legs',
      'Continue alternating at a fast pace'
    ],
    tips: [
      'Keep your hips level',
      'Don\'t let your hips pike up',
      'Maintain plank position throughout'
    ],
    duration: 30,
    sets: 3
  },

  // Core Exercises
  {
    id: '8',
    name: 'Plank',
    category: 'strength',
    bodyPart: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: [
      'Start in a push-up position but rest on forearms',
      'Keep your body in a straight line from head to heels',
      'Hold this position',
      'Breathe normally while holding'
    ],
    tips: [
      'Don\'t let your hips sag or pike up',
      'Keep your core engaged',
      'Start with shorter holds and build up time'
    ],
    duration: 30,
    sets: 3
  },

  // Flexibility Exercises
  {
    id: '9',
    name: 'Child\'s Pose',
    category: 'flexibility',
    bodyPart: ['back', 'shoulders'],
    equipment: ['yoga-mat'],
    difficulty: 'beginner',
    instructions: [
      'Start on hands and knees',
      'Sit back on your heels',
      'Extend your arms forward and lower your forehead to the ground',
      'Hold and breathe deeply'
    ],
    tips: [
      'Let your body relax into the stretch',
      'Breathe deeply and slowly',
      'Hold for at least 30 seconds'
    ],
    duration: 60,
    sets: 1
  },

  // Advanced Exercises
  {
    id: '10',
    name: 'Burpees',
    category: 'plyometric',
    bodyPart: ['full-body'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    instructions: [
      'Start standing',
      'Drop into a squat and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up',
      'Jump feet back to squat',
      'Jump up with arms overhead'
    ],
    tips: [
      'Move at your own pace',
      'Focus on form over speed',
      'Land softly to protect your joints'
    ],
    reps: 5,
    sets: 3
  }
];

export const exerciseCategories = [
  'strength',
  'cardio',
  'flexibility',
  'balance',
  'plyometric',
  'isometric'
];

export const bodyParts = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'quadriceps',
  'hamstrings',
  'calves',
  'glutes',
  'core',
  'full-body'
];

export const equipment = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'kettlebell',
  'resistance-bands',
  'pull-up-bar',
  'bench',
  'cable-machine',
  'treadmill',
  'bicycle',
  'yoga-mat'
];
