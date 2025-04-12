import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {intentionService} from '../../services/intention/IntentionService';
import {weeklyResetService} from '../../services/reset/WeeklyResetService';
import {experienceService} from '../../services/experience/ExperienceService';
import {feedbackService} from '../../services/feedback/FeedbackService';
import {SoundType} from '../../services/feedback/FeedbackService';

interface WeeklyResetModalProps {
  visible: boolean;
  onClose: () => void;
}

interface WeeklyStats {
  focusTime: number;
  restTime: number;
  tasksCompleted: number;
  northStarTasksCompleted: number;
  currentExp: number;
  maxExp: number;
  level: number;
}

const WeeklyResetModal: React.FC<WeeklyResetModalProps> = ({
  visible,
  onClose,
}) => {
  const [intentions, setIntentions] = useState<string[]>(['', '', '']);
  const [northStarIndex, setNorthStarIndex] = useState<number>(0);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [step, setStep] = useState<'review' | 'set'>(
    visible ? 'review' : 'set',
  );

  useEffect(() => {
    if (visible) {
      loadData();
      setStep('review');
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const stats = await experienceService.getWeeklyStats();
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Failed to load weekly stats:', error);
    }
  };

  const handleIntentionChange = (text: string, index: number) => {
    const newIntentions = [...intentions];
    newIntentions[index] = text;
    setIntentions(newIntentions);
  };

  const handleNorthStarSelect = (index: number) => {
    setNorthStarIndex(index);
  };

  const handleSubmit = async () => {
    try {
      // Format intentions for the service
      const formattedIntentions = intentions.map((title, index) => ({
        title: title.trim() || `Intention ${index + 1}`,
        isNorthStar: index === northStarIndex,
      }));

      // Ensure we have exactly 3 intentions as required by the service
      if (formattedIntentions.length !== 3) {
        console.error('Must have exactly 3 intentions');
        return;
      }

      // Ensure one intention is marked as North Star
      if (!formattedIntentions.some(i => i.isNorthStar)) {
        formattedIntentions[0].isNorthStar = true;
      }

      // Save weekly intentions
      await intentionService.setWeeklyIntentions(formattedIntentions);

      // Play success sound
      await feedbackService.playSound(SoundType.LEVEL_UP);

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Failed to save weekly intentions:', error);
    }
  };

  const renderReviewStep = () => {
    if (!weeklyStats) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading weekly summary...</Text>
        </View>
      );
    }

    const focusHours = Math.round(weeklyStats.focusTime / 3600);
    const restHours = Math.round(weeklyStats.restTime / 3600);

    return (
      <View style={styles.reviewContainer}>
        <Text style={styles.title}>Weekly Review</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{focusHours}h</Text>
            <Text style={styles.statLabel}>Focus</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{restHours}h</Text>
            <Text style={styles.statLabel}>Rest</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeklyStats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
        </View>

        <View style={styles.northStarContainer}>
          <Text style={styles.northStarLabel}>North Star Tasks Completed</Text>
          <Text style={styles.northStarValue}>
            {weeklyStats.northStarTasksCompleted}
          </Text>
        </View>

        <View style={styles.expContainer}>
          <Text style={styles.expLabel}>
            Experience Gained: {weeklyStats.currentExp} XP
          </Text>
          <Text style={styles.levelLabel}>Monk Level: {weeklyStats.level}</Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setStep('set')}>
          <Text style={styles.continueButtonText}>Set New Intentions</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSetStep = () => {
    return (
      <View style={styles.setContainer}>
        <Text style={styles.title}>Set Weekly Intentions</Text>
        <Text style={styles.subtitle}>
          Set up to 3 intentions for the week ahead. Choose one as your North
          Star.
        </Text>

        <ScrollView style={styles.intentionsContainer}>
          {[0, 1, 2].map(index => (
            <View key={index} style={styles.intentionRow}>
              <TextInput
                style={[
                  styles.intentionInput,
                  northStarIndex === index && styles.northStarInput,
                ]}
                placeholder={`Intention ${index + 1}`}
                placeholderTextColor="#666"
                value={intentions[index]}
                onChangeText={text => handleIntentionChange(text, index)}
              />
              <TouchableOpacity
                style={[
                  styles.northStarButton,
                  northStarIndex === index && styles.northStarButtonSelected,
                ]}
                onPress={() => handleNorthStarSelect(index)}>
                <Text
                  style={[
                    styles.northStarButtonText,
                    northStarIndex === index &&
                      styles.northStarButtonTextSelected,
                  ]}>
                  ★
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Set Intentions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {step === 'review' ? renderReviewStep() : renderSetStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  reviewContainer: {
    alignItems: 'center',
  },
  setContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  northStarContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  northStarLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  northStarValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  expContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  expLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  intentionsContainer: {
    width: '100%',
    maxHeight: 200,
  },
  intentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  intentionInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  northStarInput: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  northStarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  northStarButtonSelected: {
    backgroundColor: colors.primary,
  },
  northStarButtonText: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  northStarButtonTextSelected: {
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WeeklyResetModal;
