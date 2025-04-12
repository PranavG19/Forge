import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import {Task, TaskStatus} from '../../models/Task';
import {taskService} from '../../services/task/TaskService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {SubtaskList, Subtask} from '../../components/task/SubtaskList';
import {SubtaskProgress} from '../../components/task/SubtaskProgress';
import {SwipeableTask} from '../../components/task/SwipeableTask';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {taskId} = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTaskIfMounted = async () => {
      if (!mounted) return;
      await loadTask();
    };

    loadTaskIfMounted();

    return () => {
      mounted = false;
    };
  }, [taskId]);

  const loadTask = async () => {
    try {
      const loadedTask = await taskService.getTask(taskId);
      if (!loadedTask) {
        throw new Error('Task not found');
      }
      setTask(loadedTask);
    } catch (err) {
      console.error('Error loading task:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    if (task) {
      navigation.navigate('Timer', {taskId: task.id});
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;

    try {
      await taskService.completeTask(task.id);
      // Reload task to show updated status
      await loadTask();
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };

  const handleAddSubtask = async () => {
    if (!task || !newSubtaskTitle.trim()) return;

    try {
      setAddingSubtask(true);
      await taskService.addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      // Reload task to show new subtask
      await loadTask();
    } catch (err) {
      console.error('Error adding subtask:', err);
      Alert.alert('Error', 'Failed to add subtask');
    } finally {
      setAddingSubtask(false);
    }
  };
  const handleCompleteSubtask = async (
    subtaskId: string,
    completed: boolean,
  ) => {
    try {
      if (completed) {
        await taskService.completeSubtask(subtaskId);
      } else {
        await taskService.uncompleteSubtask(subtaskId);
      }
      // Reload task to show updated subtask status
      await loadTask();
    } catch (err) {
      console.error('Error updating subtask:', err);
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const handleUpdateSubtasks = async (subtasks: Subtask[]) => {
    try {
      if (!task) return;

      // Convert to the format expected by the task service
      const updatedSubtasks = subtasks.map(subtask => ({
        id: subtask.id,
        parentId: task.id,
        title: subtask.title,
        status: subtask.completed ? TaskStatus.COMPLETED : TaskStatus.TODO,
        estimatedMinutes: subtask.estimatedMinutes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await taskService.updateSubtasks(task.id, updatedSubtasks);
      await loadTask();
    } catch (err) {
      console.error('Error updating subtasks:', err);
      Alert.alert('Error', 'Failed to update subtasks');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Task not found'}</Text>
      </View>
    );
  }

  // Convert task subtasks to the format expected by SubtaskList
  const convertSubtasks = (): Subtask[] => {
    if (!task) return [];

    return task.subtasks.map(subtask => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.status === TaskStatus.COMPLETED,
      estimatedMinutes: subtask.estimatedMinutes || 15,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.title}>{task.title}</Text>
      </View>

      {/* Description Section */}
      {task.description && (
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text
          style={[
            styles.status,
            task.status === TaskStatus.COMPLETED && styles.completedStatus,
          ]}>
          {task.status}
        </Text>
      </View>

      {/* Priority Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Priority</Text>
        <Text
          style={[
            styles.priority,
            task.priority === 'NORTH_STAR' && styles.northStar,
          ]}>
          {task.priority}
        </Text>
      </View>

      {/* Time Estimate Section */}
      {task.timeEstimate && (
        <View style={styles.section}>
          <Text style={styles.label}>Time Estimate</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeEstimate}>
              Focus: {task.timeEstimate} minutes
            </Text>
            <Text style={styles.timeEstimate}>
              Rest: {Math.round(task.timeEstimate * 0.2)} minutes
            </Text>
          </View>
        </View>
      )}

      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Progress</Text>
        <SubtaskProgress subtasks={convertSubtasks()} />
      </View>

      {/* Notes Section */}
      {task.notes && (
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.notes}>{task.notes}</Text>
        </View>
      )}

      {/* Subtasks Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Subtasks</Text>
        <SubtaskList
          subtasks={convertSubtasks()}
          onSubtasksChange={handleUpdateSubtasks}
          onSubtaskComplete={handleCompleteSubtask}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <SwipeableTask onSwipeRight={handleStartTimer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.timerButton]}
            onPress={handleStartTimer}>
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
        </SwipeableTask>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.completeButton,
            task.status === TaskStatus.COMPLETED && styles.disabledButton,
          ]}
          onPress={handleCompleteTask}
          disabled={task.status === TaskStatus.COMPLETED}>
          <Text style={styles.buttonText}>
            {task.status === TaskStatus.COMPLETED
              ? 'Completed'
              : 'Complete Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  errorText: {
    color: colors.status.error,
    fontSize: spacing.md,
    textAlign: 'center',
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  label: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontSize: spacing.lg,
    fontWeight: 'bold',
  },
  description: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  status: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  priority: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  northStar: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeEstimate: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  notes: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  subtaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  subtaskTitle: {
    color: colors.text.primary,
    fontSize: spacing.md,
    flex: 1,
  },
  subtaskStatus: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    marginLeft: spacing.sm,
  },
  completedStatus: {
    color: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: spacing.xs,
    backgroundColor: colors.border.default,
    borderRadius: spacing.borderRadius.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.sm,
  },
  progressText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  subtaskCheckbox: {
    width: spacing.icon.md,
    height: spacing.icon.md,
    borderRadius: spacing.icon.md / 2,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.text.primary,
    fontSize: spacing.icon.sm,
    fontWeight: 'bold',
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  emptySubtasks: {
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginVertical: spacing.md,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.sm,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  addSubtaskButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  timerButton: {
    backgroundColor: colors.timer.focus.background,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: spacing.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
