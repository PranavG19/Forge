import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {intentionService} from '../../services/intention/IntentionService';

const EXAMPLE_INTENTIONS = [
  'Close 1 sales call',
  'Record 1 YouTube script',
  'Outline $10K offer',
  'Meditate 20 min',
];

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export const DailyNorthStarModal: React.FC<Props> = ({visible, onComplete}) => {
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exampleIndex, setExampleIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex(prev => (prev + 1) % EXAMPLE_INTENTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!intention.trim()) {
      setError('Please set your daily North Star intention');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await intentionService.setDailyNorthStar(intention.trim());
      setIntention('');
      onComplete();
    } catch (err) {
      console.error('Error setting daily North Star:', err);
      setError('Failed to save intention');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Set Your North Star</Text>
          <Text style={styles.subtitle}>
            What's the one win you want today?
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            value={intention}
            onChangeText={setIntention}
            placeholder={EXAMPLE_INTENTIONS[exampleIndex]}
            placeholderTextColor={colors.text.secondary}
          />

          <TouchableOpacity
            style={[styles.button, styles.northStarButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>Set Daily North Star</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.container.padding,
    width: '90%',
    maxWidth: 400,
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
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  northStarButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.status.error,
    fontSize: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
