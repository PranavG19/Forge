import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import {Task, TaskStatus, TaskPriority, SubTask} from '../../models/Task';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onStartTimer?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onComplete,
  onStartTimer,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const screenWidth = Dimensions.get('window').width;
  const swipeThreshold = screenWidth * 0.25; // 25% of screen width

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movements
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 3);
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: 0,
        });
      },
      onPanResponderMove: Animated.event([null, {dx: pan.x}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // If swiped right far enough and timer function exists
        if (gestureState.dx > swipeThreshold && onStartTimer) {
          // Reset position with animation
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();

          // Start timer
          onStartTimer(task);
        } else {
          // Reset position
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const handleComplete = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onComplete(task);
  };

  const getProgressPercentage = () => {
    if (task.subtasks.length === 0) {
      return task.status === TaskStatus.COMPLETED ? 100 : 0;
    }

    const completedSubtasks = task.subtasks.filter(
      subtask => subtask.checked,
    ).length;

    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  // Format due date for display
  const formatDueDate = () => {
    if (!task.dueDate) return null;

    const date = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today' + (task.dueTime ? ` at ${task.dueTime}` : '');
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow' + (task.dueTime ? ` at ${task.dueTime}` : '');
    } else {
      return (
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }) + (task.dueTime ? ` at ${task.dueTime}` : '')
      );
    }
  };
  return (
    <Animated.View
      style={{
        transform: [{translateX: pan.x}],
      }}
      {...panResponder.panHandlers}>
      <TouchableOpacity
        style={[
          styles.container,
          task.priority === TaskPriority.NORTH_STAR &&
            styles.northStarContainer,
          task.dueDate &&
            new Date(task.dueDate) < new Date() &&
            styles.overdueContainer,
        ]}
        onPress={() => onPress(task)}
        activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                task.status === TaskStatus.COMPLETED &&
                  styles.checkboxCompleted,
              ]}
              onPress={handleComplete}>
              {task.status === TaskStatus.COMPLETED && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                task.status === TaskStatus.COMPLETED && styles.titleCompleted,
              ]}>
              {task.title}
            </Text>
          </View>
          {onStartTimer && (
            <TouchableOpacity
              style={styles.timerButton}
              onPress={() => onStartTimer(task)}>
              <Text style={styles.timerButtonText}>▶</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Due date display */}
        {task.dueDate && (
          <View style={styles.dueDateContainer}>
            <Text
              style={[
                styles.dueDate,
                new Date(task.dueDate) < new Date() && styles.overdue,
              ]}>
              {formatDueDate()}
            </Text>
          </View>
        )}

        {/* Tags display */}
        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {task.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {task.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{task.tags.length - 3}</Text>
            )}
          </View>
        )}

        {task.subtasks.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${getProgressPercentage()}%`},
                ]}
              />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.task.padding,
    marginVertical: spacing.task.marginVertical,
    marginHorizontal: spacing.task.marginHorizontal,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  northStarContainer: {
    borderColor: colors.northStar,
    borderLeftWidth: 4,
  },
  overdueContainer: {
    borderColor: colors.overdue,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: spacing.icon.md,
    height: spacing.icon.md,
    borderRadius: spacing.icon.md / 2,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  checkboxCompleted: {
    backgroundColor: colors.header,
    borderColor: colors.header,
  },
  checkmark: {
    color: colors.text.primary,
    fontSize: spacing.icon.sm,
    fontWeight: 'bold',
  },
  title: {
    color: colors.text.primary,
    fontSize: spacing.md,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  timerButton: {
    width: spacing.icon.lg,
    height: spacing.icon.lg,
    borderRadius: spacing.icon.lg / 2,
    backgroundColor: colors.header,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  timerButtonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  progressContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: spacing.xs,
    backgroundColor: colors.border.default,
    borderRadius: spacing.borderRadius.sm,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.header,
    borderRadius: spacing.borderRadius.sm,
  },
  progressText: {
    color: colors.text.secondary,
    fontSize: spacing.sm + spacing.xs,
    minWidth: spacing.xl,
  },
  dueDateContainer: {
    marginTop: spacing.xs,
  },
  dueDate: {
    fontSize: spacing.sm,
    color: colors.text.secondary,
  },
  overdue: {
    color: colors.overdue,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: spacing.sm - 2,
    color: colors.header,
  },
  moreTagsText: {
    fontSize: spacing.sm - 2,
    color: colors.text.secondary,
    alignSelf: 'center',
  },
});
