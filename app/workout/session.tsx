import { useWorkout } from '@/contexts/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { currentWorkout } = useWorkout();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  useEffect(() => {
    if (!currentWorkout) {
      router.back();
      return;
    }
  }, [currentWorkout, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isResting && restTimer > 0) {
      timer = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
    } else if (isResting && restTimer === 0) {
      setIsResting(false);
    }
    return () => clearTimeout(timer);
  }, [isResting, restTimer]);

  if (!currentWorkout) {
    return null;
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const totalExercises = currentWorkout.exercises.length;
  const progressPercentage = ((currentExerciseIndex + (currentSetIndex + 1) / currentExercise.sets) / totalExercises) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const setKey = currentExerciseIndex * 100 + currentSetIndex;
    setCompletedSets([...completedSets, setKey]);

    if (currentSetIndex < currentExercise.sets - 1) {
      // Start rest timer for next set
      setCurrentSetIndex(currentSetIndex + 1);
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetIndex(0);
        setRestTimer(60); // Default rest between exercises
        setIsResting(true);
      } else {
        // Workout complete
        handleWorkoutComplete();
      }
    }
  };

  const handleWorkoutComplete = () => {
    Alert.alert(
      'Workout Complete! 🎉',
      `Great job! You've completed your ${currentWorkout.name} workout in ${formatTime(elapsedTime)}.`,
      [
        {
          text: 'View Summary',
          onPress: () => router.push('./summary'),
        },
        {
          text: 'Back to Home',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  const handleSkipSet = () => {
    Alert.alert(
      'Skip Set',
      'Are you sure you want to skip this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: handleCompleteSet },
      ]
    );
  };

  const handlePreviousSet = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
      setIsResting(false);
    } else if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSetIndex(currentWorkout.exercises[currentExerciseIndex - 1].sets - 1);
      setIsResting(false);
    }
  };

  const isSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const setKey = exerciseIndex * 100 + setIndex;
    return completedSets.includes(setKey);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.workoutTitle}>{currentWorkout.name}</Text>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => Alert.alert('End Workout', 'Are you sure you want to end this workout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'End', onPress: () => router.back() }
            ])}
            style={styles.endButton}
          >
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% Complete
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Exercise Card */}
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseNumber}>
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>{currentExercise.exercise.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>
          
          <View style={styles.exerciseDetails}>
            <Text style={styles.bodyPartText}>
              Target: {currentExercise.exercise.bodyPart.join(', ')}
            </Text>
          </View>

          {/* Set Information */}
          <View style={styles.setInfoCard}>
            <Text style={styles.setInfoTitle}>Current Set</Text>
            <View style={styles.setInfoRow}>
              <Text style={styles.setInfoLabel}>Set {currentSetIndex + 1} of {currentExercise.sets}</Text>
              <Text style={styles.setInfoValue}>
                {currentExercise.reps} reps
                {currentExercise.weight && ` @ ${currentExercise.weight}kg`}
              </Text>
            </View>
            {currentExercise.duration && (
              <View style={styles.setInfoRow}>
                <Text style={styles.setInfoLabel}>Duration</Text>
                <Text style={styles.setInfoValue}>{currentExercise.duration}s</Text>
              </View>
            )}
          </View>

          {/* Rest Timer */}
          {isResting && (
            <View style={styles.restCard}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
              <TouchableOpacity 
                style={styles.skipRestButton}
                onPress={() => setIsResting(false)}
              >
                <Text style={styles.skipRestText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Exercise Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            {currentExercise.exercise.instructions.map((instruction, index) => (
              <Text key={index} style={styles.instructionText}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>

          {/* Tips */}
          {currentExercise.exercise.tips.length > 0 && (
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Tips</Text>
              {currentExercise.exercise.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Set Progress Grid */}
        <View style={styles.setsGrid}>
          <Text style={styles.setsGridTitle}>Set Progress</Text>
          <View style={styles.setsContainer}>
            {Array.from({ length: currentExercise.sets }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.setCircle,
                  isSetCompleted(currentExerciseIndex, index) && styles.completedSet,
                  index === currentSetIndex && !isSetCompleted(currentExerciseIndex, index) && styles.currentSet,
                ]}
              >
                <Text style={[
                  styles.setCircleText,
                  isSetCompleted(currentExerciseIndex, index) && styles.completedSetText,
                  index === currentSetIndex && !isSetCompleted(currentExerciseIndex, index) && styles.currentSetText,
                ]}>
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercise Navigation */}
        <View style={styles.exerciseNavigation}>
          <Text style={styles.navigationTitle}>Exercise Progress</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exercisesList}>
            {currentWorkout.exercises.map((exercise, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exerciseNavItem,
                  index === currentExerciseIndex && styles.currentExerciseNav,
                  index < currentExerciseIndex && styles.completedExerciseNav,
                ]}
                onPress={() => {
                  if (index < currentExerciseIndex) {
                    setCurrentExerciseIndex(index);
                    setCurrentSetIndex(0);
                    setIsResting(false);
                  }
                }}
              >
                <Text style={[
                  styles.exerciseNavText,
                  index === currentExerciseIndex && styles.currentExerciseNavText,
                  index < currentExerciseIndex && styles.completedExerciseNavText,
                ]}>
                  {index + 1}
                </Text>
                <Text style={[
                  styles.exerciseNavName,
                  index === currentExerciseIndex && styles.currentExerciseNavName,
                ]}>
                  {exercise.exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {currentSetIndex > 0 || currentExerciseIndex > 0 ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePreviousSet}>
            <Text style={styles.secondaryButtonText}>Previous Set</Text>
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipSet}>
          <Text style={styles.skipButtonText}>Skip Set</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.completeButton, isResting && styles.disabledButton]} 
          onPress={handleCompleteSet}
          disabled={isResting}
        >
          <Text style={styles.completeButtonText}>
            {isResting ? 'Resting...' : 'Complete Set'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  endButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  difficultyBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exerciseDetails: {
    marginBottom: 20,
  },
  bodyPartText: {
    fontSize: 14,
    color: '#666',
  },
  setInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  setInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  setInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  setInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  setInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  restCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  restTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
  },
  skipRestButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffc107',
  },
  skipRestText: {
    color: '#856404',
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  tipsCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
    marginBottom: 4,
  },
  setsGrid: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  setsGridTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  setsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  setCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  completedSet: {
    backgroundColor: '#4caf50',
  },
  currentSet: {
    backgroundColor: '#4A90E2',
  },
  setCircleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  completedSetText: {
    color: '#fff',
  },
  currentSetText: {
    color: '#fff',
  },
  exerciseNavigation: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  exercisesList: {
    flexDirection: 'row',
  },
  exerciseNavItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  currentExerciseNav: {
    backgroundColor: '#4A90E2',
  },
  completedExerciseNav: {
    backgroundColor: '#4caf50',
  },
  exerciseNavText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  currentExerciseNavText: {
    color: '#fff',
  },
  completedExerciseNavText: {
    color: '#fff',
  },
  exerciseNavName: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  currentExerciseNavName: {
    color: '#fff',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: '#ffc107',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  skipButtonText: {
    color: '#856404',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 2,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
