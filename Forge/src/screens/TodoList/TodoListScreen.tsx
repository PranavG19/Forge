import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {TaskCard} from '../../components/task/TaskCard';
import {DailyNorthStarModal} from '../../components/modals/DailyNorthStarModal';
import {ExperienceBar} from '../../components/experience/ExperienceBar';
import {Task, TaskCategory, TaskStatus} from '../../models/Task';
import {taskService} from '../../services/task/TaskService';
import {intentionService} from '../../services/intention/IntentionService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoList'>;

export const TodoListScreen: React.FC<Props> = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(
    TaskCategory.TODAY,
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNorthStarModal, setShowNorthStarModal] = useState(false);

  // Check for daily North Star on mount and category change
  useEffect(() => {
    let mounted = true;

    const checkNorthStar = async () => {
      if (!mounted) return;

      try {
        const northStar = await intentionService.getDailyNorthStar();
        if (!northStar) {
          setShowNorthStarModal(true);
        }
      } catch (error) {
        console.error('Error checking North Star:', error);
      }
    };

    const loadTasksIfMounted = async () => {
      if (!mounted) return;
      await loadTasks();
    };

    checkNorthStar();
    loadTasksIfMounted();

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const loadTasks = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const loadedTasks = await taskService.getTasksByCategory(
        selectedCategory,
      );
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks(false);
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetails', {taskId: task.id});
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      await taskService.completeTask(task.id);
      await loadTasks(false); // Reload tasks without showing loading indicator
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task. Please try again.');
    }
  };

  const renderCategoryTab = (category: TaskCategory) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabSelected,
      ]}
      onPress={() => setSelectedCategory(category)}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextSelected,
        ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No tasks in {selectedCategory.toLowerCase()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DailyNorthStarModal
        visible={showNorthStarModal}
        onComplete={() => {
          setShowNorthStarModal(false);
          loadTasks();
        }}
      />
      <View style={styles.header}>
        <ExperienceBar />
        <ExperienceBar />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tasks</Text>
        </View>
      </View>

      <View style={styles.categoryTabs}>
        {Object.values(TaskCategory).map(category =>
          renderCategoryTab(category),
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TaskCard
              task={item}
              onPress={handleTaskPress}
              onComplete={handleTaskComplete}
              onStartTimer={task => {
                navigation.navigate('Timer', {taskId: task.id});
              }}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            tasks.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  titleContainer: {
    padding: spacing.container.padding,
  },
  title: {
    fontSize: spacing.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.container.padding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  categoryTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surface,
  },
  categoryTabSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.text.secondary,
    fontSize: spacing.sm + spacing.xs,
    fontWeight: 'bold',
  },
  categoryTextSelected: {
    color: colors.text.primary,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.status.error + '20', // 20% opacity
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    fontSize: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: spacing.md,
    textAlign: 'center',
  },
});
