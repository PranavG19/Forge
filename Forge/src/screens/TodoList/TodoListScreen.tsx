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
  SectionList,
  Switch,
} from 'react-native';
import {TaskCard} from '../../components/task/TaskCard';
import {DailyNorthStarModal} from '../../components/modals/DailyNorthStarModal';
import {IntentionsHeader} from '../../components/intention/IntentionsHeader';
import {CalendarEvents} from '../../components/calendar/CalendarEvents';
import {Task, TaskCategory, TaskStatus} from '../../models/Task';
import {taskService} from '../../services/task/TaskService';
import {intentionService} from '../../services/intention/IntentionService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoList'>;

interface TaskSection {
  title: string;
  data: Task[];
  category: TaskCategory;
}

export const TodoListScreen: React.FC<Props> = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(
    TaskCategory.TODAY,
  );
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNorthStarModal, setShowNorthStarModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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
      // Load tasks for all categories
      const [todayTasks, nextTasks, laterTasks] = await Promise.all([
        taskService.getTasksByCategory(TaskCategory.TODAY),
        taskService.getTasksByCategory(TaskCategory.NEXT),
        taskService.getTasksByCategory(TaskCategory.LATER),
      ]);

      // Create sections based on selected category
      const sections: TaskSection[] = [];

      if (selectedCategory === TaskCategory.TODAY) {
        sections.push({
          title: 'TODAY',
          data: todayTasks,
          category: TaskCategory.TODAY,
        });
      } else if (selectedCategory === TaskCategory.NEXT) {
        sections.push({
          title: 'NEXT',
          data: nextTasks,
          category: TaskCategory.NEXT,
        });
      } else if (selectedCategory === TaskCategory.LATER) {
        sections.push({
          title: 'LATER',
          data: laterTasks,
          category: TaskCategory.LATER,
        });
      }

      setTaskSections(sections);
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

      {/* Header with Profile Button */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Tasks</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Intentions Header */}
      <IntentionsHeader onSetNorthStar={() => setShowNorthStarModal(true)} />

      {/* Calendar Integration Toggle */}
      <View style={styles.calendarToggleContainer}>
        <Text style={styles.calendarToggleText}>Show Calendar Events</Text>
        <Switch
          value={showCalendar}
          onValueChange={setShowCalendar}
          trackColor={{false: colors.surface, true: colors.primary}}
          thumbColor={colors.text.primary}
        />
      </View>

      {/* Calendar Events */}
      {showCalendar && <CalendarEvents />}

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {Object.values(TaskCategory).map(category => (
          <React.Fragment key={category}>
            {renderCategoryTab(category)}
          </React.Fragment>
        ))}
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
        <SectionList
          sections={taskSections}
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
          renderSectionHeader={({section}) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            taskSections.length === 0 ||
            (taskSections.length === 1 && taskSections[0].data.length === 0)
              ? styles.emptyListContent
              : null,
          ]}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          stickySectionHeadersEnabled={true}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.container.padding,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionHeaderText: {
    color: colors.text.secondary,
    fontSize: spacing.md,
    fontWeight: 'bold',
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
  profileButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.primary,
  },
  profileButtonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  calendarToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.container.padding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  calendarToggleText: {
    color: colors.text.primary,
    fontSize: spacing.sm,
  },
});
