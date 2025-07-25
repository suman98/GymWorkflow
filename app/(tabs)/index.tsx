import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkout } from '@/contexts/WorkoutContext';
import { WorkoutPlanGenerator } from '@/utils/workoutGenerator';

export default function HomeScreen() {
  const { user } = useAuth();
  const { workoutPlans, exercises, setCurrentWorkout, createWorkoutPlan } = useWorkout();
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Set today's workout if available
    if (workoutPlans.length > 0) {
      const today = new Date().getDay();
      const workoutIndex = today % workoutPlans.length;
      setTodaysWorkout(workoutPlans[workoutIndex]);
    }
  }, [user, workoutPlans, router]);

  const generateQuickWorkout = async () => {
    if (!user || !exercises.length) {
      Alert.alert('Error', 'Unable to generate workout. Please try again.');
      return;
    }

    try {
      const preferences = {
        duration: 30, // 30 minute workout
        frequency: 3,
        targetBodyParts: undefined,
        excludeBodyParts: undefined,
        availableEquipment: ['bodyweight']
      };

      const generatedPlan = WorkoutPlanGenerator.generatePersonalizedPlan(
        user,
        exercises,
        preferences
      );

      await createWorkoutPlan(generatedPlan);
      Alert.alert('Success', 'New workout plan generated!');
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout plan.');
    }
  };

  const startWorkout = (workout: any) => {
    setCurrentWorkout(workout);
    // router.push('/workout/session'); // Will implement workout session later
    Alert.alert('Coming Soon', 'Workout session feature will be implemented next!');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{user.name}!</Text>
          <Text style={styles.subtitle}>Ready to crush your fitness goals today?</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{workoutPlans.length}</Text>
            <Text style={styles.statLabel}>Workout Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Workouts This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Minutes Exercised</Text>
          </View>
        </View>

        {todaysWorkout ? (
          <View style={styles.todayWorkoutCard}>
            <Text style={styles.cardTitle}>Today&apos;s Workout</Text>
            <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
            <Text style={styles.workoutDescription}>
              {todaysWorkout.estimatedDuration} minutes • {todaysWorkout.exercises.length} exercises
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => startWorkout(todaysWorkout)}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noWorkoutCard}>
            <Text style={[styles.cardTitle, { color: '#333' }]}>No Workout Planned</Text>
            <Text style={styles.noWorkoutText}>
              Generate a personalized workout plan to get started!
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateQuickWorkout}
            >
              <Text style={styles.generateButtonText}>Generate Quick Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.actionIcon}>💪</Text>
              <Text style={styles.actionText}>Browse Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Progress tracking feature will be implemented next!')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Track Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Goals feature will be implemented next!')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Set Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Coming Soon', 'Profile settings will be implemented next!')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  todayWorkoutCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  noWorkoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noWorkoutText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
