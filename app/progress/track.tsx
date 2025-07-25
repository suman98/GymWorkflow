import ProgressChart from '@/components/ProgressChart';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/database';
import { BodyMeasurements, Progress } from '@/types';
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

export default function ProgressTrackingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Form state
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    chest: undefined,
    waist: undefined,
    hips: undefined,
    biceps: undefined,
    thighs: undefined,
    neck: undefined,
  });

  const loadProgressData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await databaseService.getProgressByUser(user.id);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, loadProgressData]);

  const handleAddProgress = async () => {
    if (!user) return;

    // Validate at least one field is filled
    if (!weight && !bodyFat && !muscleMass && !notes && 
        !measurements.chest && !measurements.waist && !measurements.hips && 
        !measurements.biceps && !measurements.thighs && !measurements.neck) {
      Alert.alert('Error', 'Please enter at least one measurement or note');
      return;
    }

    setIsLoading(true);
    try {
      const progressEntry: Omit<Progress, 'id'> = {
        userId: user.id,
        date: selectedDate,
        weight: weight ? parseFloat(weight) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
        measurements: hasAnyMeasurement() ? measurements : undefined,
        notes: notes || undefined,
      };

      await databaseService.createProgress(progressEntry);
      await loadProgressData();
      resetForm();
      setShowAddModal(false);
      Alert.alert('Success', 'Progress entry added successfully!');
    } catch (error) {
      console.error('Error adding progress:', error);
      Alert.alert('Error', 'Failed to add progress entry');
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyMeasurement = () => {
    return Object.values(measurements).some(value => value !== undefined && value !== null);
  };

  const resetForm = () => {
    setWeight('');
    setBodyFat('');
    setMuscleMass('');
    setNotes('');
    setMeasurements({
      chest: undefined,
      waist: undefined,
      hips: undefined,
      biceps: undefined,
      thighs: undefined,
      neck: undefined,
    });
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLatestProgress = () => {
    return progressData.length > 0 ? progressData[0] : null;
  };

  const calculateWeightChange = () => {
    if (progressData.length < 2) return null;
    const latest = progressData[0];
    const previous = progressData[1];
    
    if (latest.weight && previous.weight) {
      const change = latest.weight - previous.weight;
      return {
        value: Math.abs(change),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
      };
    }
    return null;
  };

  const renderProgressCharts = () => {
    if (progressData.length === 0) return null;

    return (
      <View style={styles.chartsContainer}>
        <Text style={styles.chartsTitle}>Progress Trends</Text>
        
        <ProgressChart
          data={progressData}
          type="weight"
          title="Weight"
          unit="kg"
          color="#6B73FF"
        />
        
        <ProgressChart
          data={progressData}
          type="bodyFat"
          title="Body Fat"
          unit="%"
          color="#FF6B9D"
        />
        
        <ProgressChart
          data={progressData}
          type="muscleMass"
          title="Muscle Mass"
          unit="kg"
          color="#51CF66"
        />
      </View>
    );
  };

  const renderProgressSummary = () => {
    const latest = getLatestProgress();
    const weightChange = calculateWeightChange();

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Current Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {latest?.weight ? `${latest.weight} kg` : '--'}
            </Text>
            <Text style={styles.statLabel}>Weight</Text>
            {weightChange && (
              <Text style={[
                styles.statChange,
                weightChange.trend === 'up' ? styles.statUp : 
                weightChange.trend === 'down' ? styles.statDown : styles.statSame
              ]}>
                {weightChange.trend === 'up' ? '↗' : weightChange.trend === 'down' ? '↘' : '→'} 
                {weightChange.value.toFixed(1)} kg
              </Text>
            )}
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {latest?.bodyFat ? `${latest.bodyFat}%` : '--'}
            </Text>
            <Text style={styles.statLabel}>Body Fat</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {latest?.muscleMass ? `${latest.muscleMass} kg` : '--'}
            </Text>
            <Text style={styles.statLabel}>Muscle Mass</Text>
          </View>
        </View>

        {latest?.measurements && (
          <View style={styles.measurementsContainer}>
            <Text style={styles.measurementsTitle}>Latest Measurements</Text>
            <View style={styles.measurementsGrid}>
              {Object.entries(latest.measurements).map(([key, value]) => {
                if (value) {
                  return (
                    <View key={key} style={styles.measurementItem}>
                      <Text style={styles.measurementLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <Text style={styles.measurementValue}>{value} cm</Text>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderProgressHistory = () => {
    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Progress History</Text>
          <Text style={styles.historyCount}>{progressData.length} entries</Text>
        </View>
        
        {progressData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateTitle}>No Progress Data</Text>
            <Text style={styles.emptyStateText}>
              Start tracking your fitness journey by adding your first progress entry!
            </Text>
          </View>
        ) : (
          progressData.map((entry, index) => (
            <View key={entry.id} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressDate}>{formatDate(entry.date)}</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    Day {progressData.length - index}
                  </Text>
                </View>
              </View>
              
              <View style={styles.progressContent}>
                <View style={styles.progressStats}>
                  {entry.weight && (
                    <Text style={styles.progressStat}>Weight: {entry.weight} kg</Text>
                  )}
                  {entry.bodyFat && (
                    <Text style={styles.progressStat}>Body Fat: {entry.bodyFat}%</Text>
                  )}
                  {entry.muscleMass && (
                    <Text style={styles.progressStat}>Muscle: {entry.muscleMass} kg</Text>
                  )}
                </View>
                
                {entry.measurements && (
                  <View style={styles.progressMeasurements}>
                    <Text style={styles.progressMeasurementsTitle}>Measurements:</Text>
                    <View style={styles.measurementsList}>
                      {Object.entries(entry.measurements).map(([key, value]) => {
                        if (value) {
                          return (
                            <Text key={key} style={styles.measurementText}>
                              {key}: {value}cm
                            </Text>
                          );
                        }
                        return null;
                      })}
                    </View>
                  </View>
                )}
                
                {entry.notes && (
                  <View style={styles.progressNotes}>
                    <Text style={styles.progressNotesTitle}>Notes:</Text>
                    <Text style={styles.progressNotesText}>{entry.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderAddProgressModal = () => {
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
            <Text style={styles.modalTitle}>Add Progress</Text>
            <TouchableOpacity onPress={handleAddProgress} disabled={isLoading}>
              <Text style={[styles.modalSave, isLoading && styles.modalSaveDisabled]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Body Stats</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="75.5"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Body Fat (%)</Text>
                <TextInput
                  style={styles.input}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="15.2"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Muscle Mass (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={muscleMass}
                  onChangeText={setMuscleMass}
                  placeholder="45.0"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Body Measurements (cm)</Text>
              
              <View style={styles.measurementInputs}>
                <View style={styles.measurementRow}>
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Chest</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.chest?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        chest: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="100"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Waist</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.waist?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        waist: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="80"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.measurementRow}>
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Hips</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.hips?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        hips: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="95"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Biceps</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.biceps?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        biceps: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="35"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.measurementRow}>
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Thighs</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.thighs?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        thighs: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="55"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  
                  <View style={styles.measurementInput}>
                    <Text style={styles.inputLabel}>Neck</Text>
                    <TextInput
                      style={styles.input}
                      value={measurements.neck?.toString() || ''}
                      onChangeText={(value) => setMeasurements(prev => ({
                        ...prev,
                        neck: value ? parseFloat(value) : undefined
                      }))}
                      placeholder="38"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="How are you feeling? Any observations..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
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
        colors={['#6B73FF', '#9B59B6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Track Progress</Text>
            <Text style={styles.headerSubtitle}>Monitor your fitness journey</Text>
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
        {renderProgressSummary()}
        {renderProgressCharts()}
        {renderProgressHistory()}
      </ScrollView>

      {renderAddProgressModal()}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B73FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 10,
    fontWeight: '500',
  },
  statUp: {
    color: '#ff6b6b',
  },
  statDown: {
    color: '#51cf66',
  },
  statSame: {
    color: '#666',
  },
  measurementsContainer: {
    marginTop: 16,
  },
  measurementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyContainer: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCount: {
    fontSize: 14,
    color: '#666',
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
    paddingHorizontal: 20,
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressBadge: {
    backgroundColor: '#6B73FF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  progressBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  progressContent: {
    gap: 12,
  },
  progressStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressStat: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressMeasurements: {},
  progressMeasurementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  measurementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measurementText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  progressNotes: {},
  progressNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  progressNotesText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    lineHeight: 18,
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
    color: '#6B73FF',
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
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  measurementInputs: {},
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  measurementInput: {
    width: '48%',
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
});
