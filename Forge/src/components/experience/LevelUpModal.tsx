import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {feedbackService} from '../../services/feedback/FeedbackService';
import {SoundType} from '../../services/feedback/FeedbackService';

interface LevelUpModalProps {
  visible: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  onClose,
  oldLevel,
  newLevel,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Play level up sound
      feedbackService.levelUp();

      // Reset animations
      scaleAnim.setValue(0.5);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, rotateAnim, opacityAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}, {rotate: rotate}],
            },
          ]}>
          <View style={styles.starContainer}>
            <Text style={styles.starIcon}>⭐</Text>
          </View>

          <Text style={styles.title}>Level Up!</Text>

          <View style={styles.levelContainer}>
            <View style={styles.levelBox}>
              <Text style={styles.levelLabel}>From</Text>
              <Text style={styles.levelValue}>{oldLevel}</Text>
            </View>

            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>

            <View style={[styles.levelBox, styles.newLevelBox]}>
              <Text style={styles.levelLabel}>To</Text>
              <Text style={[styles.levelValue, styles.newLevelValue]}>
                {newLevel}
              </Text>
            </View>
          </View>

          <Text style={styles.message}>
            Congratulations! Your monk discipline is growing stronger.
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  starContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  starIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  levelBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newLevelBox: {
    backgroundColor: colors.primary,
  },
  levelLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  levelValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  newLevelValue: {
    color: '#000',
  },
  arrowContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: colors.text.primary,
  },
  message: {
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LevelUpModal;
