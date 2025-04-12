import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Intention,
  intentionService,
} from '../../services/intention/IntentionService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

interface IntentionsHeaderProps {
  onSetNorthStar: () => void;
}

export const IntentionsHeader: React.FC<IntentionsHeaderProps> = ({
  onSetNorthStar,
}) => {
  const [dailyNorthStar, setDailyNorthStar] = useState<Intention | null>(null);
  const [weeklyIntentions, setWeeklyIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntentions();
  }, []);

  const loadIntentions = async () => {
    try {
      setLoading(true);
      const [daily, weekly] = await Promise.all([
        intentionService.getDailyNorthStar(),
        intentionService.getWeeklyIntentions(),
      ]);
      setDailyNorthStar(daily);
      setWeeklyIntentions(weekly);
    } catch (error) {
      console.error('Failed to load intentions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading intentions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Daily North Star */}
      {dailyNorthStar ? (
        <View style={styles.northStarContainer}>
          <Text style={styles.northStarLabel}>TODAY'S NORTH STAR</Text>
          <Text style={styles.northStarText}>{dailyNorthStar.title}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.setNorthStarButton}
          onPress={onSetNorthStar}>
          <Text style={styles.setNorthStarText}>Set Daily North Star</Text>
        </TouchableOpacity>
      )}

      {/* Weekly Intentions */}
      {weeklyIntentions.length > 0 && (
        <View style={styles.weeklyContainer}>
          <Text style={styles.weeklyLabel}>WEEKLY INTENTIONS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeklyScrollContent}>
            {weeklyIntentions.map((intention, index) => (
              <View
                key={intention.id}
                style={[
                  styles.weeklyIntention,
                  intention.isNorthStar && styles.weeklyNorthStar,
                ]}>
                <Text
                  style={[
                    styles.weeklyIntentionText,
                    intention.isNorthStar && styles.weeklyNorthStarText,
                  ]}>
                  {intention.title}
                  {intention.isNorthStar && ' (North Star)'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  northStarContainer: {
    marginBottom: spacing.md,
  },
  northStarLabel: {
    fontSize: spacing.xs,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  northStarText: {
    fontSize: spacing.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  setNorthStarButton: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  setNorthStarText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  weeklyContainer: {
    marginTop: spacing.xs,
  },
  weeklyLabel: {
    fontSize: spacing.xs,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  weeklyScrollContent: {
    paddingRight: spacing.md,
  },
  weeklyIntention: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.sm,
    marginRight: spacing.sm,
  },
  weeklyNorthStar: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  weeklyIntentionText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  weeklyNorthStarText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
