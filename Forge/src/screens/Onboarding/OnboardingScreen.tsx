import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import {intentionService} from '../../services/intention/IntentionService';
import {appBlockingService} from '../../services/blocking/AppBlockingService';
import {settingsService} from '../../services/settings/SettingsService';
import {analyticsService} from '../../services/analytics/AnalyticsService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

const EXAMPLE_DAILY_INTENTIONS = [
  'Close 1 sales call',
  'Record 1 YouTube script',
  'Outline $10K offer',
  'Meditate 20 min',
];

const EXAMPLE_WEEKLY_INTENTIONS = [
  'Launch side hustle landing page',
  'Batch 5 blog posts',
  'Pitch 10 clients',
  'Hit 5 gym sessions',
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC<Props> = ({navigation}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appBlockingEnabled, setAppBlockingEnabled] = useState(true);
  const [focusBlockedApps, setFocusBlockedApps] = useState<string[]>([
    'X',
    'Instagram',
    'YouTube',
  ]);
  const [restBlockedApps, setRestBlockedApps] = useState<string[]>([]);
  const [blockMode, setBlockMode] = useState<'FULL' | 'REMINDER' | 'TIMER'>(
    'FULL',
  );
  const [timerDuration, setTimerDuration] = useState(30); // 30 seconds default

  // Daily North Star
  const [dailyNorthStar, setDailyNorthStar] = useState('');
  const [dailyExampleIndex, setDailyExampleIndex] = useState(0);

  // Weekly Intentions
  const [weeklyIntentions, setWeeklyIntentions] = useState(['', '', '']);
  const [selectedNorthStarIndex, setSelectedNorthStarIndex] =
    useState<number>(-1);
  const [weeklyExampleIndex, setWeeklyExampleIndex] = useState(0);

  // Reset Day
  const [resetDay, setResetDay] = useState('SUNDAY');

  const cycleDailyExamples = useCallback(() => {
    setDailyExampleIndex(prev => (prev + 1) % EXAMPLE_DAILY_INTENTIONS.length);
  }, []);

  const cycleWeeklyExamples = useCallback(() => {
    setWeeklyExampleIndex(
      prev => (prev + 1) % EXAMPLE_WEEKLY_INTENTIONS.length,
    );
  }, []);

  React.useEffect(() => {
    const interval = setInterval(cycleDailyExamples, 3000);
    return () => clearInterval(interval);
  }, [cycleDailyExamples]);

  React.useEffect(() => {
    const interval = setInterval(cycleWeeklyExamples, 3000);
    return () => clearInterval(interval);
  }, [cycleWeeklyExamples]);

  const handleDailyNorthStarSubmit = async () => {
    if (!dailyNorthStar.trim()) {
      setError('Please set your daily North Star intention');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await intentionService.setDailyNorthStar(dailyNorthStar.trim());
      await analyticsService.logNorthStarSet();
      setStep(2);
    } catch (err) {
      console.error('Error setting daily North Star:', err);
      setError('Failed to save daily North Star');
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyIntentionsSubmit = async () => {
    if (weeklyIntentions.some(i => !i.trim())) {
      setError('Please set all three weekly intentions');
      return;
    }

    if (selectedNorthStarIndex === -1) {
      setError('Please select one intention as your North Star');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formattedIntentions = weeklyIntentions.map((title, index) => ({
        title: title.trim(),
        isNorthStar: index === selectedNorthStarIndex,
      }));

      await intentionService.setWeeklyIntentions(formattedIntentions);
      await analyticsService.logNorthStarSet();
      setStep(3);
    } catch (err) {
      console.error('Error setting weekly intentions:', err);
      setError('Failed to save weekly intentions');
    } finally {
      setLoading(false);
    }
  };
  const completeOnboarding = async () => {
    setError(null);
    setLoading(true);

    try {
      // Save reset day settings
      await Promise.all([
        intentionService.setWeeklyResetDay(resetDay),
        settingsService.setWeeklyResetDay(resetDay),
      ]);

      // If app blocking is enabled, configure the blocked apps
      if (appBlockingEnabled) {
        // Initialize the app blocking service first
        await appBlockingService.initialize();

        const focusApps = focusBlockedApps.map(name => ({
          packageName:
            Platform.OS === 'ios'
              ? `com.${name.toLowerCase()}.ios`
              : `com.${name.toLowerCase()}.android`,
          name,
          mode: blockMode,
          timerDuration: blockMode === 'TIMER' ? timerDuration : undefined,
        }));

        const restApps = restBlockedApps.map(name => ({
          packageName:
            Platform.OS === 'ios'
              ? `com.${name.toLowerCase()}.ios`
              : `com.${name.toLowerCase()}.android`,
          name,
          mode: blockMode,
          timerDuration: blockMode === 'TIMER' ? timerDuration : undefined,
        }));

        await Promise.all([
          appBlockingService.setBlockedApps(focusApps, true),
          appBlockingService.setBlockedApps(restApps, false),
        ]);
      }

      // Mark onboarding as completed
      await settingsService.setOnboardingCompleted(true);

      // Navigate to the main app
      navigation.replace('MainTabs');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const renderDailyNorthStarStep = () => (
    <View style={styles.step}>
      <Text style={styles.title}>Set your North Star</Text>
      <Text style={styles.subtitle}>What's the one win you want today?</Text>

      <TextInput
        style={styles.input}
        value={dailyNorthStar}
        onChangeText={setDailyNorthStar}
        placeholder={EXAMPLE_DAILY_INTENTIONS[dailyExampleIndex]}
        placeholderTextColor={colors.text.secondary}
      />

      <TouchableOpacity
        style={[styles.button, styles.northStarButton]}
        onPress={handleDailyNorthStarSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.buttonText}>Set Daily North Star</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderWeeklyIntentionsStep = () => (
    <View style={styles.step}>
      <Text style={styles.title}>Set Weekly Intentions</Text>
      <Text style={styles.subtitle}>Choose 3 intentions, 1 North Star</Text>

      {weeklyIntentions.map((intention, index) => (
        <View key={index} style={styles.intentionContainer}>
          <TextInput
            style={[
              styles.input,
              selectedNorthStarIndex === index && styles.northStarInput,
            ]}
            value={intention}
            onChangeText={text => {
              const newIntentions = [...weeklyIntentions];
              newIntentions[index] = text;
              setWeeklyIntentions(newIntentions);
            }}
            placeholder={EXAMPLE_WEEKLY_INTENTIONS[weeklyExampleIndex]}
            placeholderTextColor={colors.text.secondary}
          />
          <TouchableOpacity
            style={[
              styles.northStarTag,
              selectedNorthStarIndex === index && styles.northStarTagSelected,
            ]}
            onPress={() => setSelectedNorthStarIndex(index)}>
            <Text
              style={[
                styles.northStarTagText,
                selectedNorthStarIndex === index &&
                  styles.northStarTagTextSelected,
              ]}>
              North Star
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, styles.northStarButton]}
        onPress={handleWeeklyIntentionsSubmit}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.buttonText}>Set Weekly Intentions</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderResetDayStep = () => (
    <View style={styles.step}>
      <Text style={styles.title}>Weekly Reset Day</Text>
      <Text style={styles.subtitle}>When does your week start?</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.resetDayContainer}>
        {[
          'SUNDAY',
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ].map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.resetDayButton,
              resetDay === day && styles.resetDayButtonSelected,
            ]}
            onPress={() => setResetDay(day)}>
            <Text
              style={[
                styles.resetDayText,
                resetDay === day && styles.resetDayTextSelected,
              ]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, styles.northStarButton]}
        onPress={() => setStep(4)}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAppBlockingStep = () => (
    <View style={styles.step}>
      <Text style={styles.title}>App Blocking</Text>
      <Text style={styles.subtitle}>
        Block distracting apps during focus time
      </Text>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable App Blocking</Text>
        <Switch
          value={appBlockingEnabled}
          onValueChange={setAppBlockingEnabled}
          trackColor={{false: colors.surface, true: colors.northStar}}
          thumbColor={colors.text.primary}
        />
      </View>

      {appBlockingEnabled && (
        <>
          <Text style={styles.sectionLabel}>Block in Focus Mode:</Text>
          <View style={styles.appListContainer}>
            {['X', 'Instagram', 'YouTube'].map(app => (
              <TouchableOpacity
                key={app}
                style={[
                  styles.appItem,
                  focusBlockedApps.includes(app) && styles.appItemSelected,
                ]}
                onPress={() => {
                  if (focusBlockedApps.includes(app)) {
                    setFocusBlockedApps(
                      focusBlockedApps.filter(a => a !== app),
                    );
                  } else {
                    setFocusBlockedApps([...focusBlockedApps, app]);
                  }
                }}>
                <Text
                  style={[
                    styles.appItemText,
                    focusBlockedApps.includes(app) &&
                      styles.appItemTextSelected,
                  ]}>
                  {app}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Block in Rest Mode:</Text>
          <View style={styles.appListContainer}>
            {['X', 'Instagram', 'YouTube'].map(app => (
              <TouchableOpacity
                key={app}
                style={[
                  styles.appItem,
                  restBlockedApps.includes(app) && styles.appItemSelected,
                ]}
                onPress={() => {
                  if (restBlockedApps.includes(app)) {
                    setRestBlockedApps(restBlockedApps.filter(a => a !== app));
                  } else {
                    setRestBlockedApps([...restBlockedApps, app]);
                  }
                }}>
                <Text
                  style={[
                    styles.appItemText,
                    restBlockedApps.includes(app) && styles.appItemTextSelected,
                  ]}>
                  {app}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Blocking Mode:</Text>
          <View style={styles.blockModeContainer}>
            {['FULL', 'REMINDER', 'TIMER'].map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.blockModeItem,
                  blockMode === mode && styles.blockModeItemSelected,
                ]}
                onPress={() =>
                  setBlockMode(mode as 'FULL' | 'REMINDER' | 'TIMER')
                }>
                <Text
                  style={[
                    styles.blockModeText,
                    blockMode === mode && styles.blockModeTextSelected,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {blockMode === 'TIMER' && (
            <View style={styles.timerDurationContainer}>
              <Text style={styles.timerDurationLabel}>
                Countdown Duration: {timerDuration}s
              </Text>
              <View style={styles.timerDurationButtons}>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() =>
                    setTimerDuration(Math.max(10, timerDuration - 5))
                  }>
                  <Text style={styles.timerButtonText}>-5s</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() =>
                    setTimerDuration(Math.min(60, timerDuration + 5))
                  }>
                  <Text style={styles.timerButtonText}>+5s</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.northStarButton]}
        onPress={completeOnboarding}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.text.primary} />
        ) : (
          <Text style={styles.buttonText}>Complete Setup</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monk Mode: Forge</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {step === 1 && renderDailyNorthStarStep()}
      {step === 2 && renderWeeklyIntentionsStep()}
      {step === 3 && renderResetDayStep()}
      {step === 4 && renderAppBlockingStep()}

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map(s => (
          <View
            key={s}
            style={[styles.progressDot, s === step && styles.progressDotActive]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Existing styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.container.padding,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.header,
  },
  step: {
    flex: 1,
    padding: spacing.container.padding,
  },
  title: {
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: spacing.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  northStarInput: {
    borderColor: colors.northStar,
  },
  button: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  northStarButton: {
    backgroundColor: colors.northStar,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  intentionContainer: {
    marginBottom: spacing.md,
  },
  northStarTag: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    backgroundColor: colors.surface,
  },
  northStarTagSelected: {
    backgroundColor: colors.northStar,
  },
  northStarTagText: {
    fontSize: spacing.sm,
    color: colors.text.secondary,
  },
  northStarTagTextSelected: {
    color: colors.text.primary,
  },
  resetDayContainer: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  resetDayButton: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  resetDayButtonSelected: {
    backgroundColor: colors.northStar,
  },
  resetDayText: {
    color: colors.text.secondary,
    fontSize: spacing.md,
  },
  resetDayTextSelected: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.secondary,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.northStar,
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    fontSize: spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  switchLabel: {
    color: colors.text.primary,
    fontSize: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  appListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  appItem: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  appItemSelected: {
    backgroundColor: colors.northStar,
  },
  appItemText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  appItemTextSelected: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  blockModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  blockModeItem: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  blockModeItemSelected: {
    backgroundColor: colors.northStar,
  },
  blockModeText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  blockModeTextSelected: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  timerDurationContainer: {
    marginBottom: spacing.md,
  },
  timerDurationLabel: {
    color: colors.text.primary,
    fontSize: spacing.sm,
    marginBottom: spacing.xs,
  },
  timerDurationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    marginHorizontal: spacing.sm,
  },
  timerButtonText: {
    color: colors.text.primary,
    fontSize: spacing.sm,
  },
});
