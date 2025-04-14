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
import {Task, TaskCategory, TaskStatus, TaskPriority} from '../../models/Task';
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
  const [hasShownNorthStarModal, setHasShownNorthStarModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // For future dark mode toggle

  // Check for daily North Star on mount only
  useEffect(() => {
    let mounted = true;

    const checkNorthStar = async () => {
      if (!mounted || hasShownNorthStarModal) return;

      try {
        console.log('Checking for Daily North Star...');
        const northStar = await intentionService.getDailyNorthStar();
        if (!northStar) {
          console.log('No Daily North Star found, showing modal');
          setShowNorthStarModal(true);
        } else {
          console.log('Daily North Star found:', northStar.title);
        }
        setHasShownNorthStarModal(true);
      } catch (error) {
        console.error('Error checking North Star:', error);
        setHasShownNorthStarModal(true); // Prevent repeated attempts on error
      }
    };

    checkNorthStar();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array means it only runs on mount

  // Separate useEffect for loading tasks when category changes
  useEffect(() => {
    let mounted = true;

    const loadTasksIfMounted = async () => {
      if (!mounted) return;
      await loadTasks();
    };

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
      console.log('TodoListScreen: Loading tasks...');
      // Use the new categorizeTasks method
      const {today, upcoming, someday} = await taskService.categorizeTasks();
      console.log('TodoListScreen: Tasks loaded successfully');
      console.log(
        `TodoListScreen: Today: ${today.length}, Upcoming: ${upcoming.length}, Someday: ${someday.length}`,
      );

      // Create sections based on selected category
      const sections: TaskSection[] = [];

      if (selectedCategory === TaskCategory.TODAY) {
        console.log('TodoListScreen: Creating TODAY section');
        sections.push({
          title: 'TODAY',
          data: today,
          category: TaskCategory.TODAY,
        });
      } else if (selectedCategory === TaskCategory.UPCOMING) {
        console.log('TodoListScreen: Creating UPCOMING section');
        sections.push({
          title: 'UPCOMING',
          data: upcoming,
          category: TaskCategory.UPCOMING,
        });
      } else if (selectedCategory === TaskCategory.SOMEDAY) {
        console.log('TodoListScreen: Creating SOMEDAY section');
        sections.push({
          title: 'SOMEDAY',
          data: someday,
          category: TaskCategory.SOMEDAY,
        });
      }

      console.log(`TodoListScreen: Setting ${sections.length} task sections`);
      setTaskSections(sections);
    } catch (error) {
      console.error('TodoListScreen: Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      console.log('TodoListScreen: Finished loading tasks');
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
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? colors.darkMode.background
            : colors.background,
        },
      ]}>
      <DailyNorthStarModal
        visible={showNorthStarModal}
        onComplete={() => {
          setShowNorthStarModal(false);
          setHasShownNorthStarModal(true); // Mark as shown
          loadTasks();
        }}
      />

      {/* Header with Profile Button */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDarkMode
              ? colors.darkMode.border.default
              : colors.border.default,
          },
        ]}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: isDarkMode
                  ? colors.darkMode.text.primary
                  : colors.text.primary,
              },
            ]}>
            Tasks
          </Text>
          <TouchableOpacity
            style={[styles.profileButton, {backgroundColor: colors.header}]}
            onPress={() => navigation.navigate('TaskDetails', {taskId: 'new'})}>
            <Text style={styles.profileButtonText}>+ New</Text>
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
          trackColor={{false: colors.surface, true: colors.header}}
          thumbColor={
            isDarkMode ? colors.darkMode.text.primary : colors.text.primary
          }
        />
      </View>

      {/* Calendar Events */}
      {showCalendar && <CalendarEvents />}

      {/* Category Tabs */}
      <View
        style={[
          styles.categoryTabs,
          {
            borderBottomColor: isDarkMode
              ? colors.darkMode.border.default
              : colors.border.default,
          },
        ]}>
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
          <ActivityIndicator size="large" color={colors.header} />
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
              tintColor={colors.header}
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
    padding: 20, // Add more white space
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginHorizontal: -20, // Compensate for container padding
    paddingHorizontal: 20,
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
    fontFamily: 'System', // Use system font (Inter would be ideal if available)
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginHorizontal: -20, // Compensate for container padding
    paddingHorizontal: spacing.container.padding,
  },
  categoryTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.surface,
    elevation: 1, // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryTabSelected: {
    backgroundColor: colors.header,
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
    marginHorizontal: -20, // Compensate for container padding
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
    backgroundColor: colors.header,
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginHorizontal: -20, // Compensate for container padding
    paddingHorizontal: spacing.container.padding,
  },
  calendarToggleText: {
    color: colors.text.primary,
    fontSize: spacing.sm,
  },
});
