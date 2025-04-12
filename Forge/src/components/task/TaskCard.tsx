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
import {Task, TaskStatus, TaskPriority} from '../../models/Task';
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
      subtask => subtask.status === TaskStatus.COMPLETED,
    ).length;

    return Math.round((completedSubtasks / task.subtasks.length) * 100);
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
  },
  northStarContainer: {
    borderColor: colors.primary,
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
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.sm,
  },
  progressText: {
    color: colors.text.secondary,
    fontSize: spacing.sm + spacing.xs,
    minWidth: spacing.xl,
  },
});
