import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {ExperienceBar} from '../../components/experience/ExperienceBar';
import {experienceService} from '../../services/experience/ExperienceService';
import {settingsService} from '../../services/settings/SettingsService';
import {appBlockingService} from '../../services/blocking/AppBlockingService';

import {WeeklyStats as ServiceWeeklyStats} from '../../services/experience/ExperienceService';

interface ProfileStats {
  focusHours: number;
  restHours: number;
  breachCount: number;
  tasksCompleted: number;
  northStarTasksCompleted: number;
  currentExp: number;
  maxExp: number;
  level: number;
}

export const ProfileScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    focusHours: 0,
    restHours: 0,
    breachCount: 0,
    tasksCompleted: 0,
    northStarTasksCompleted: 0,
    currentExp: 0,
    maxExp: 500,
    level: 1,
  });

  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticsEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [weeklyStats, soundEnabled, hapticsEnabled, breachCount] =
        await Promise.all([
          experienceService.getWeeklyStats(),
          settingsService.getSoundEnabled(),
          settingsService.getHapticsEnabled(),
          appBlockingService.getBreachCount(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          ), // Last 7 days
        ]);

      setStats({
        focusHours: Math.round(weeklyStats.focusTime / 3600), // Convert seconds to hours
        restHours: Math.round(weeklyStats.restTime / 3600), // Convert seconds to hours
        breachCount,
        tasksCompleted: weeklyStats.tasksCompleted,
        northStarTasksCompleted: weeklyStats.northStarTasksCompleted,
        currentExp: weeklyStats.currentExp,
        maxExp: weeklyStats.maxExp,
        level: weeklyStats.level,
      });
      setSettings({soundEnabled, hapticsEnabled});
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSound = async (value: boolean) => {
    try {
      await settingsService.toggleSound(value);
      setSettings(prev => ({...prev, soundEnabled: value}));
    } catch (error) {
      console.error('Failed to toggle sound:', error);
    }
  };

  const toggleHaptics = async (value: boolean) => {
    try {
      await settingsService.toggleHaptics(value);
      setSettings(prev => ({...prev, hapticsEnabled: value}));
    } catch (error) {
      console.error('Failed to toggle haptics:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.focusHours}h</Text>
              <Text style={styles.statLabel}>Focus</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.restHours}h</Text>
              <Text style={styles.statLabel}>Rest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.breachCount}</Text>
              <Text style={styles.statLabel}>Breaches</Text>
            </View>
          </View>

          <View style={styles.tasksStats}>
            <Text style={styles.tasksSummary}>
              Tasks Completed: {stats.tasksCompleted} (
              {stats.northStarTasksCompleted} North Star)
            </Text>
          </View>

          <View style={styles.expContainer}>
            <Text style={styles.expTitle}>
              Monk Level {stats.level} - {stats.currentExp}/{stats.maxExp}
            </Text>
            <ExperienceBar
              current={stats.currentExp}
              max={stats.maxExp}
              style={styles.expBar}
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{false: colors.surface, true: colors.primary}}
              thumbColor={colors.text.primary}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Haptics</Text>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{false: colors.surface, true: colors.primary}}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: spacing.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  tasksStats: {
    marginBottom: spacing.lg,
  },
  tasksSummary: {
    fontSize: spacing.md,
    color: colors.text.primary,
  },
  expContainer: {
    marginTop: spacing.md,
  },
  expTitle: {
    fontSize: spacing.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  expBar: {
    height: 4,
    backgroundColor: colors.surface,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  settingLabel: {
    fontSize: spacing.md,
    color: colors.text.primary,
  },
});
