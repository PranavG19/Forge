import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {
  experienceService,
  ExperienceStats,
} from '../../services/experience/ExperienceService';

export const ExperienceBar: React.FC = () => {
  const [stats, setStats] = useState<ExperienceStats | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const currentStats = await experienceService.getStats();
        if (mounted) {
          setStats(currentStats);
          animateProgress(currentStats);
        }
      } catch (error) {
        console.error('Error loading experience stats:', error);
      }
    };

    const handleExpGained = ({stats}: {stats: ExperienceStats}) => {
      if (mounted) {
        setStats(stats);
        animateProgress(stats);
      }
    };

    experienceService.on('experienceGained', handleExpGained);
    experienceService.on('weeklyExpReset', handleExpGained);
    loadStats();

    return () => {
      mounted = false;
      experienceService.removeListener('experienceGained', handleExpGained);
      experienceService.removeListener('weeklyExpReset', handleExpGained);
    };
  }, []);

  const animateProgress = (currentStats: ExperienceStats) => {
    const progress = currentStats.currentExp / currentStats.nextLevelExp;
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  if (!stats) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Monk Level {stats.level}</Text>
        <Text style={styles.expText}>
          {stats.currentExp} / {stats.nextLevelExp}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.weeklyExpText}>Weekly EXP: {stats.weeklyExp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  expText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  barContainer: {
    height: 4,
    backgroundColor: colors.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  weeklyExpText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
