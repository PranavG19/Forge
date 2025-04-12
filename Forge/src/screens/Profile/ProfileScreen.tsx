import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {ExperienceBar} from '../../components/experience/ExperienceBar';
import {ExperienceStats} from '../../components/experience/ExperienceStats';
import {experienceService} from '../../services/experience/ExperienceService';
import {settingsService} from '../../services/settings/SettingsService';
import {appBlockingService} from '../../services/blocking/AppBlockingService';
import {statsAggregator} from '../../services/analytics/StatsAggregator';
import {StatsVisualizer} from '../../components/stats/StatsVisualizer';
import BlockingConfig from '../../components/blocking/BlockingConfig';
import AppSelector from '../../components/blocking/AppSelector';
import {CalendarEvents} from '../../components/calendar/CalendarEvents';

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
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  const [settings, setSettings] = useState({
    soundEnabled: true,
    hapticsEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        expWeeklyStats,
        soundEnabled,
        hapticsEnabled,
        breachCount,
        aggregatedWeeklyStats,
      ] = await Promise.all([
        experienceService.getWeeklyStats(),
        settingsService.getSoundEnabled(),
        settingsService.getHapticsEnabled(),
        appBlockingService.getBreachCount(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ), // Last 7 days
        statsAggregator.getCurrentWeekStats(),
      ]);

      // Get daily stats for the past 7 days
      const today = new Date();
      const dailyStatsPromises = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dailyStatsPromises.push(statsAggregator.getDailyStats(date));
      }
      const dailyStatsResults = await Promise.all(dailyStatsPromises);

      setStats({
        focusHours: Math.round(expWeeklyStats.focusTime / 3600), // Convert seconds to hours
        restHours: Math.round(expWeeklyStats.restTime / 3600), // Convert seconds to hours
        breachCount,
        tasksCompleted: expWeeklyStats.tasksCompleted,
        northStarTasksCompleted: expWeeklyStats.northStarTasksCompleted,
        currentExp: expWeeklyStats.currentExp,
        maxExp: expWeeklyStats.maxExp,
        level: expWeeklyStats.level,
      });

      setWeeklyStats(aggregatedWeeklyStats);
      setDailyStats(dailyStatsResults);
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

          {/* Enhanced Experience Display */}
          <ExperienceStats style={styles.expContainer} />
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

        {/* App Blocking Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Blocking</Text>
          <BlockingConfig mode="Focus" />
          <BlockingConfig mode="Rest" />

          <TouchableOpacity
            style={styles.appSelectorButton}
            onPress={() => setShowAppSelector(prev => !prev)}>
            <Text style={styles.appSelectorButtonText}>
              {showAppSelector
                ? 'Hide App Selection'
                : 'Configure Blocked Apps'}
            </Text>
          </TouchableOpacity>

          {showAppSelector && (
            <>
              <AppSelector mode="Focus" />
              <AppSelector mode="Rest" />
            </>
          )}
        </View>

        {/* Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>

          <TouchableOpacity
            style={styles.appSelectorButton}
            onPress={() => setShowDetailedStats(prev => !prev)}>
            <Text style={styles.appSelectorButtonText}>
              {showDetailedStats
                ? 'Hide Detailed Stats'
                : 'Show Detailed Stats'}
            </Text>
          </TouchableOpacity>

          {showDetailedStats && (
            <StatsVisualizer
              dailyStats={dailyStats}
              weeklyStats={weeklyStats}
              style={styles.statsVisualizer}
            />
          )}
        </View>

        {/* Calendar Integration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendar</Text>

          <TouchableOpacity
            style={styles.appSelectorButton}
            onPress={() => setShowCalendar(prev => !prev)}>
            <Text style={styles.appSelectorButtonText}>
              {showCalendar ? 'Hide Calendar' : 'Show Calendar Events'}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <CalendarEvents
              onRequestAccess={() => {
                // Refresh the calendar view after access is granted
                setShowCalendar(true);
              }}
            />
          )}
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
  appSelectorButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  appSelectorButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: spacing.md,
  },
  statsVisualizer: {
    marginTop: spacing.md,
  },
});
