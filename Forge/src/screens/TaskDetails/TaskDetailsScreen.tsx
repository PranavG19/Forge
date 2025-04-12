import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import {Task} from '../../models/Task';
import {taskService} from '../../services/task/TaskService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC<Props> = ({route}) => {
  const {taskId} = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <Text style={styles.title}>{task.title}</Text>
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>{task.status}</Text>
      </View>

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

      {task.timeEstimate && (
        <View style={styles.section}>
          <Text style={styles.label}>Time Estimate</Text>
          <Text style={styles.timeEstimate}>{task.timeEstimate} minutes</Text>
        </View>
      )}

      {task.notes && (
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.notes}>{task.notes}</Text>
        </View>
      )}

      {task.subtasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Subtasks</Text>
          {task.subtasks.map(subtask => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <Text style={styles.subtaskTitle}>{subtask.title}</Text>
              <Text style={styles.subtaskStatus}>{subtask.status}</Text>
            </View>
          ))}
        </View>
      )}
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
});
