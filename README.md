# Gym Workflow - Comprehensive Fitness Companion App

A comprehensive fitness app built with React Native and Expo that provides personalized workout planning, exercise guidance, progress tracking, and goal management.

## Features

### 🔐 User Registration & Profile Setup
- User account creation and authentication
- Comprehensive profile setup including:
  - Personal details (gender, age, height, weight)
  - Target body type selection (lean, muscular, athletic, bulky)
  - Fitness level assessment (beginner, intermediate, advanced)
  - Goal setting

### 🏋️‍♂️ Personalized Workout Plan Generation
- AI-powered workout plan generation based on user profile
- Customizable workout preferences:
  - Duration (15-90 minutes)
  - Frequency (1-7 days per week)
  - Target body parts
  - Available equipment
- Adaptive difficulty scaling

### 📚 Exercise Library
- Comprehensive exercise database with 10+ sample exercises
- Detailed exercise information:
  - Step-by-step instructions
  - Targeted body parts
  - Equipment requirements
  - Difficulty levels
  - Tips and variations
- Advanced filtering and search capabilities:
  - Filter by category (strength, cardio, flexibility, etc.)
  - Filter by body part
  - Search by exercise name

### 📊 Progress Tracking (Coming Soon)
- Body measurement tracking
- Photo progress documentation
- Workout completion logging
- Statistical analysis and charts

### 🎯 Goal Management (Coming Soon)
- SMART goal setting
- Progress monitoring
- Achievement notifications
- Goal adaptation based on progress

### 🔔 Reminders & Motivation (Coming Soon)
- Workout reminders
- Measurement reminders
- Motivational messages
- Custom notification scheduling

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with File-based routing
- **Database**: Expo SQLite for local data storage
- **UI Components**: React Native Elements & React Native Paper
- **State Management**: React Context API
- **Authentication**: Custom authentication system
- **Charts**: React Native Chart Kit (for progress visualization)

## Project Structure

```
gymWorkflow/
├── app/                          # Screen components
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Exercise library
│   │   └── _layout.tsx          # Tab navigation layout
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx           # Login screen
│   │   └── register.tsx        # Registration screen
│   └── _layout.tsx             # Root layout with providers
├── components/                  # Reusable UI components
├── contexts/                    # React Context providers
│   ├── AuthContext.tsx         # Authentication state
│   └── WorkoutContext.tsx      # Workout and exercise state
├── data/                       # Static data and samples
│   └── exercises.ts            # Sample exercise data
├── services/                   # Business logic and data services
│   ├── database.ts             # SQLite database operations
│   └── dataInitialization.ts  # Sample data initialization
├── types/                      # TypeScript type definitions
│   └── index.ts               # All app interfaces and types
├── utils/                      # Utility functions
│   └── workoutGenerator.ts    # Workout plan generation logic
└── constants/                  # App constants and configurations
```

## Key Components

### User Flow
1. **Registration/Login**: New users register with detailed profile information
2. **Home Dashboard**: Personalized dashboard with today's workout and quick actions
3. **Exercise Library**: Browse and filter exercises by category and body part
4. **Workout Generation**: AI-generated workout plans based on user preferences
5. **Progress Tracking**: Log workouts and track physical progress
6. **Goal Management**: Set and monitor fitness goals

### Data Models
- **User**: Complete user profile with fitness preferences
- **Exercise**: Detailed exercise information with instructions
- **WorkoutPlan**: Generated workout routines with exercise sequences
- **Progress**: Physical measurements and workout completion data
- **Goal**: User-defined fitness objectives with tracking

### Smart Features
- **Adaptive Difficulty**: Workouts adjust based on user fitness level
- **Equipment-Based Filtering**: Plans adapt to available equipment
- **Body Type Optimization**: Workouts tailored to target body type goals
- **Progressive Overload**: Automatic progression in workout intensity

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Scan the QR code with Expo Go or run on simulator

### Usage
1. **First Time Setup**: Register with your fitness details
2. **Generate Workout**: Use the "Generate Quick Workout" button on home screen
3. **Browse Exercises**: Explore the exercise library with filtering options
4. **Track Progress**: Log your workouts and body measurements (coming soon)

## Future Enhancements

### Phase 2 Features
- **Workout Sessions**: Real-time workout tracking with timers
- **Progress Charts**: Visual progress tracking with charts and graphs
- **Goal Achievement**: Comprehensive goal management system
- **Social Features**: Share progress and compete with friends

### Phase 3 Features
- **Video Tutorials**: Exercise demonstration videos
- **Nutrition Tracking**: Meal planning and calorie tracking
- **Wearable Integration**: Sync with fitness trackers
- **Personal Trainer**: AI coaching and form correction

## Contributing

This project follows React Native and Expo best practices:
- TypeScript for type safety
- Context API for state management
- SQLite for offline-first data storage
- Component-based architecture
- File-based routing with Expo Router

## License

This project is developed as a comprehensive fitness application template showcasing modern React Native development practices.
