import { useWorkout } from '@/contexts/WorkoutContext';
import { WorkoutPlan } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WorkoutScheduleScreen() {
  const router = useRouter();
  const { workoutPlans, setCurrentWorkout, isLoading, refreshData } = useWorkout();
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday
  const [weeklySchedule, setWeeklySchedule] = useState<{[key: number]: WorkoutPlan[]}>({});

  const generateWeeklySchedule = useCallback(() => {
    const schedule: {[key: number]: WorkoutPlan[]} = {};
    
    // Initialize empty arrays for each day
    DAYS_OF_WEEK.forEach((_, index) => {
      schedule[index] = [];
    });

    // Distribute workouts across the week
    // For now, we'll cycle through workouts for each day
    // In a real app, you might have specific day assignments
    workoutPlans.forEach((workout, index) => {
      const dayIndex = index % 7;
      schedule[dayIndex].push(workout);
    });

    // If we have fewer than 7 workouts, distribute them across multiple days
    if (workoutPlans.length < 7) {
      workoutPlans.forEach((workout, index) => {
        const secondDay = (index + 3) % 7; // Add to another day
        if (schedule[secondDay].length === 0) {
          schedule[secondDay].push(workout);
        }
      });
    }

    setWeeklySchedule(schedule);
  }, [workoutPlans]);

  useEffect(() => {
    if (workoutPlans.length > 0) {
      generateWeeklySchedule();
    }
  }, [workoutPlans]);

  const getTodayIndex = () => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  };

  const formatWorkoutDuration = (workout: WorkoutPlan) => {
    return `${workout.estimatedDuration} min • ${workout.exercises.length} exercises`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#2196f3';
    }
  };

  const handleStartWorkout = (workout: WorkoutPlan) => {
    Alert.alert(
      'Start Workout',
      `Are you ready to start "${workout.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setCurrentWorkout(workout);
            router.push('./session');
          },
        },
      ]
    );
  };

  const handleWorkoutDetails = (workout: WorkoutPlan) => {
    Alert.alert(
      workout.name,
      `Duration: ${workout.estimatedDuration} minutes\nExercises: ${workout.exercises.length}\nDifficulty: ${workout.difficulty}\n\nExercises:\n${workout.exercises.map((ex, i) => `${i + 1}. ${ex.exercise.name} (${ex.sets} sets x ${ex.reps} reps)`).join('\n')}`,
      [
        { text: 'Close' },
        { text: 'Start Workout', onPress: () => handleStartWorkout(workout) },
      ]
    );
  };

  const isToday = (dayIndex: number) => {
    return dayIndex === getTodayIndex();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Workout Schedule</Text>
            <Text style={styles.headerSubtitle}>Plan your week ahead</Text>
          </View>
          <TouchableOpacity
            onPress={refreshData}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Days of Week Selector */}
      <View style={styles.daysSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS_OF_WEEK.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDayButton,
                isToday(index) && styles.todayButton,
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayButtonText,
                selectedDay === index && styles.selectedDayButtonText,
                isToday(index) && styles.todayButtonText,
              ]}>
                {day.substring(0, 3)}
              </Text>
              <Text style={[
                styles.dayNumber,
                selectedDay === index && styles.selectedDayNumber,
                isToday(index) && styles.todayNumber,
              ]}>
                {new Date(Date.now() + (index - getTodayIndex()) * 24 * 60 * 60 * 1000).getDate()}
              </Text>
              {weeklySchedule[index]?.length > 0 && (
                <View style={[
                  styles.workoutIndicator,
                  isToday(index) && styles.todayIndicator,
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Workout List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} />
        }
      >
        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayTitle}>
            {DAYS_OF_WEEK[selectedDay]}
            {isToday(selectedDay) && <Text style={styles.todayLabel}> (Today)</Text>}
          </Text>
          <Text style={styles.workoutCount}>
            {weeklySchedule[selectedDay]?.length || 0} workout{weeklySchedule[selectedDay]?.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {weeklySchedule[selectedDay]?.length > 0 ? (
          weeklySchedule[selectedDay].map((workout, index) => (
            <View key={`${selectedDay}-${index}`} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {formatWorkoutDuration(workout)}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(workout.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </View>

              <View style={styles.exercisePreview}>
                <Text style={styles.exercisePreviewTitle}>Exercises:</Text>
                <View style={styles.exercisesList}>
                  {workout.exercises.slice(0, 3).map((exercise, exIndex) => (
                    <Text key={exIndex} style={styles.exerciseItem}>
                      • {exercise.exercise.name}
                    </Text>
                  ))}
                  {workout.exercises.length > 3 && (
                    <Text style={styles.moreExercises}>
                      +{workout.exercises.length - 3} more
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.workoutActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleWorkoutDetails(workout)}
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => handleStartWorkout(workout)}
                >
                  <Text style={styles.startButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💪</Text>
            <Text style={styles.emptyStateTitle}>No workouts scheduled</Text>
            <Text style={styles.emptyStateText}>
              {selectedDay === getTodayIndex() 
                ? "You have no workouts planned for today. Take a rest day or create a new workout!"
                : `No workouts planned for ${DAYS_OF_WEEK[selectedDay]}. Your muscles can recover!`}
            </Text>
            <TouchableOpacity
              style={styles.createWorkoutButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.createWorkoutButtonText}>Create Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Weekly Summary */}
        <View style={styles.weeklySummary}>
          <Text style={styles.weeklySummaryTitle}>This Week Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Object.values(weeklySchedule).reduce((total, day) => total + day.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Object.values(weeklySchedule).reduce((total, day) => 
                  total + day.reduce((dayTotal, workout) => dayTotal + workout.estimatedDuration, 0), 0
                )}
              </Text>
              <Text style={styles.statLabel}>Total Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Object.values(weeklySchedule).reduce((total, day) => 
                  total + day.reduce((dayTotal, workout) => dayTotal + workout.exercises.length, 0), 0
                )}
              </Text>
              <Text style={styles.statLabel}>Total Exercises</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  daysSelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 60,
    position: 'relative',
  },
  selectedDayButton: {
    backgroundColor: '#667eea',
  },
  todayButton: {
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
  todayButtonText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  dayNumber: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDayNumber: {
    color: '#fff',
  },
  todayNumber: {
    color: '#4caf50',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667eea',
  },
  todayIndicator: {
    backgroundColor: '#4caf50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectedDayHeader: {
    marginBottom: 20,
  },
  selectedDayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  todayLabel: {
    color: '#4caf50',
  },
  workoutCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
  },
  difficultyBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  exercisePreview: {
    marginBottom: 16,
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exercisesList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  exerciseItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  moreExercises: {
    fontSize: 13,
    color: '#667eea',
    fontStyle: 'italic',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
  },
  detailsButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  startButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createWorkoutButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createWorkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  weeklySummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  weeklySummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
