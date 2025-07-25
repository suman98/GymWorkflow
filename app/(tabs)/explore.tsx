import { useWorkout } from '@/contexts/WorkoutContext';
import { Exercise } from '@/types';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ExploreScreen() {
  const { exercises, getExercisesByCategory } = useWorkout();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'plyometric'];
  const bodyParts = ['all', 'chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'glutes', 'core', 'full-body'];

  const getFilteredExercises = (): Exercise[] => {
    let filtered = exercises;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = getExercisesByCategory(selectedCategory);
    }

    // Filter by body part
    if (selectedBodyPart !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.bodyPart.includes(selectedBodyPart as any)
      );
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase()) ||
        exercise.bodyPart.some(part => part.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    return filtered;
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.bodyPartText}>
          {item.bodyPart.join(', ')}
        </Text>
      </View>
      <View style={styles.exerciseStats}>
        {item.reps && (
          <Text style={styles.statText}>{item.reps} reps</Text>
        )}
        {item.sets && (
          <Text style={styles.statText}>{item.sets} sets</Text>
        )}
        {item.duration && (
          <Text style={styles.statText}>{item.duration}s</Text>
        )}
      </View>
      <Text style={styles.instructionPreview}>
        {item.instructions[0]}...
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedCategory === item && styles.selectedFilterChip
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.filterText,
        selectedCategory === item && styles.selectedFilterText
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderBodyPartFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedBodyPart === item && styles.selectedFilterChip
      ]}
      onPress={() => setSelectedBodyPart(item)}
    >
      <Text style={[
        styles.filterText,
        selectedBodyPart === item && styles.selectedFilterText
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise Library</Text>
        <Text style={styles.subtitle}>Discover exercises for your workout</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Category</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
        />

        <Text style={styles.filterLabel}>Body Part</Text>
        <FlatList
          data={bodyParts}
          renderItem={renderBodyPartFilter}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
        />
      </View>

      <FlatList
        data={getFilteredExercises()}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exercisesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterList: {
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  selectedFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  exercisesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 16,
  },
  bodyPartText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  exerciseStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f8f8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  instructionPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
