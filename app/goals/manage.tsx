import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/database';
import { Goal } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GoalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await databaseService.getGoalsByUser(user.id);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user, loadGoals]);

  const handleAddGoal = async () => {
    if (!user || !title.trim() || !targetValue || !unit) {
      Alert.alert('Error', 'Please fill in all required fields (title, target value, unit)');
      return;
    }

    setIsLoading(true);
    try {
      const goalData: Omit<Goal, 'id' | 'createdAt'> = {
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        targetValue: parseFloat(targetValue),
        currentValue: currentValue ? parseFloat(currentValue) : 0,
        unit: unit.trim(),
        deadline,
        isCompleted: false,
      };

      await databaseService.createGoal(goalData);
      await loadGoals();
      resetForm();
      setShowAddModal(false);
      Alert.alert('Success', 'Goal added successfully!');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (goal: Goal, newCurrentValue: number) => {
    if (!user) return;

    try {
      const isCompleted = newCurrentValue >= goal.targetValue;
      await databaseService.updateGoal(goal.id, {
        currentValue: newCurrentValue,
        isCompleted
      });
      await loadGoals();
      
      if (isCompleted && !goal.isCompleted) {
        Alert.alert('🎉 Goal Achieved!', `Congratulations! You've reached your goal: ${goal.title}`);
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetValue('');
    setCurrentValue('');
    setUnit('kg');
    setDeadline(undefined);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = getProgressPercentage(goal);
    const daysLeft = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null;

    return (
      <View key={goal.id} style={[styles.goalCard, goal.isCompleted && styles.completedGoal]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalTitle, goal.isCompleted && styles.completedText]}>
              {goal.title}
            </Text>
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}
          </View>
          {goal.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: goal.isCompleted ? '#4CAF50' : '#6B73FF'
                }
              ]} 
            />
          </View>
        </View>

        {goal.deadline && (
          <View style={styles.deadlineContainer}>
            <Text style={[
              styles.deadlineText,
              daysLeft !== null && daysLeft < 7 && daysLeft >= 0 && styles.deadlineUrgent,
              daysLeft !== null && daysLeft < 0 && styles.deadlineOverdue
            ]}>
              {daysLeft !== null && daysLeft >= 0 
                ? `${daysLeft} days left (${formatDate(goal.deadline)})`
                : daysLeft !== null && daysLeft < 0
                ? `Overdue by ${Math.abs(daysLeft)} days`
                : formatDate(goal.deadline)}
            </Text>
          </View>
        )}

        {!goal.isCompleted && (
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              Alert.prompt(
                'Update Progress',
                `Current: ${goal.currentValue} ${goal.unit}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Update',
                    onPress: (value) => {
                      if (value && !isNaN(parseFloat(value))) {
                        handleUpdateProgress(goal, parseFloat(value));
                      }
                    }
                  }
                ],
                'plain-text',
                goal.currentValue.toString()
              );
            }}
          >
            <Text style={styles.updateButtonText}>Update Progress</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAddGoalModal = () => {
    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Goal</Text>
            <TouchableOpacity onPress={handleAddGoal} disabled={isLoading}>
              <Text style={[styles.modalSave, isLoading && styles.modalSaveDisabled]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Goal Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Lose weight, Build muscle, Run 5K"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Optional details about your goal..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Target & Progress</Text>
              
              <View style={styles.rowInputs}>
                <View style={styles.rowInput}>
                  <Text style={styles.inputLabel}>Target Value *</Text>
                  <TextInput
                    style={styles.input}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    placeholder="75"
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.rowInput}>
                  <Text style={styles.inputLabel}>Unit *</Text>
                  <TextInput
                    style={styles.input}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="kg, lbs, miles, ..."
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Value</Text>
                <TextInput
                  style={styles.input}
                  value={currentValue}
                  onChangeText={setCurrentValue}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Quick Goal Templates</Text>
              <View style={styles.templateContainer}>
                {[
                  { title: 'Lose 5kg', target: '5', unit: 'kg less' },
                  { title: 'Bench 100kg', target: '100', unit: 'kg' },
                  { title: 'Run 10K', target: '10', unit: 'km' },
                  { title: 'Body Fat 15%', target: '15', unit: '%' },
                ].map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateButton}
                    onPress={() => {
                      setTitle(template.title);
                      setTargetValue(template.target);
                      setUnit(template.unit);
                    }}
                  >
                    <Text style={styles.templateText}>{template.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#C44569']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Goals</Text>
            <Text style={styles.headerSubtitle}>Track your fitness targets</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goals Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Goals Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{goals.length}</Text>
              <Text style={styles.statLabel}>Total Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {goals.filter(g => g.isCompleted).length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {goals.filter(g => !g.isCompleted).length}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Your Goals</Text>
          
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateTitle}>No Goals Set</Text>
              <Text style={styles.emptyStateText}>
                Set your first fitness goal to start tracking your progress!
              </Text>
              <TouchableOpacity 
                style={styles.addFirstGoalButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addFirstGoalText}>Add Your First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map(renderGoalCard)
          )}
        </View>
      </ScrollView>

      {renderAddGoalModal()}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  goalsContainer: {
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
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  completedGoal: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#4CAF50',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  deadlineContainer: {
    marginBottom: 12,
  },
  deadlineText: {
    fontSize: 12,
    color: '#666',
  },
  deadlineUrgent: {
    color: '#ff9800',
    fontWeight: '500',
  },
  deadlineOverdue: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#6B73FF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
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
  addFirstGoalButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addFirstGoalText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSave: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowInput: {
    width: '48%',
  },
  templateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateText: {
    fontSize: 12,
    color: '#666',
  },
});
