import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {Subtask} from './SubtaskList';

interface SubtaskProgressProps {
  subtasks: Subtask[];
  style?: any;
}

export const SubtaskProgress: React.FC<SubtaskProgressProps> = ({
  subtasks,
  style,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Calculate progress
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(
    subtask => subtask.completed,
  ).length;
  const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

  // Calculate total estimated time
  const totalEstimatedMinutes = subtasks.reduce(
    (total, subtask) => total + subtask.estimatedMinutes,
    0,
  );

  // Calculate completed estimated time
  const completedEstimatedMinutes = subtasks
    .filter(subtask => subtask.completed)
    .reduce((total, subtask) => total + subtask.estimatedMinutes, 0);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width,
            },
          ]}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {completedSubtasks}/{totalSubtasks}
          </Text>
          <Text style={styles.statLabel}>Subtasks</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {completedEstimatedMinutes}/{totalEstimatedMinutes}
          </Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.header,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.header,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
