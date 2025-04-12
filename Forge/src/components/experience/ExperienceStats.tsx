import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {
  experienceService,
  ExperienceStats as StatsType,
} from '../../services/experience/ExperienceService';
import {ExperienceBar} from './ExperienceBar';
import LevelUpModal from './LevelUpModal';

interface ExperienceStatsProps {
  style?: any;
}

export const ExperienceStats: React.FC<ExperienceStatsProps> = ({style}) => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({oldLevel: 1, newLevel: 2});

  useEffect(() => {
    loadStats();

    // Listen for experience changes
    const handleExperienceGained = ({stats}: {stats: StatsType}) => {
      setStats(stats);
    };

    // Listen for level up events
    const handleLevelUp = ({
      oldLevel,
      newLevel,
    }: {
      oldLevel: number;
      newLevel: number;
    }) => {
      setLevelUpData({oldLevel, newLevel});
      setShowLevelUpModal(true);
    };

    experienceService.on('experienceGained', handleExperienceGained);
    experienceService.on('levelUp', handleLevelUp);

    return () => {
      experienceService.off('experienceGained', handleExperienceGained);
      experienceService.off('levelUp', handleLevelUp);
    };
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const experienceStats = await experienceService.getStats();
      setStats(experienceStats);
    } catch (error) {
      console.error('Failed to load experience stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading experience stats...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Monk Level {stats.level}</Text>
        <Text style={styles.expText}>
          {stats.currentExp} / {stats.nextLevelExp} XP
        </Text>
      </View>

      <ExperienceBar
        current={stats.currentExp}
        max={stats.nextLevelExp}
        animated={true}
        style={styles.expBar}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.weeklyExp}</Text>
          <Text style={styles.statLabel}>Weekly XP</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.level}</Text>
          <Text style={styles.statLabel}>Current Level</Text>
        </View>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setShowLevelUpModal(true)}>
          <Text style={styles.statValue}>?</Text>
          <Text style={styles.statLabel}>Next Reward</Text>
        </TouchableOpacity>
      </View>

      <LevelUpModal
        visible={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  expText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  expBar: {
    height: 8,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  loadingText: {
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.md,
  },
});
