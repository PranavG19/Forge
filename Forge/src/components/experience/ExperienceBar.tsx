import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ViewStyle, Animated} from 'react-native';
import {colors} from '../../theme/colors';

interface Props {
  current: number;
  max: number;
  level?: number;
  style?: ViewStyle;
  showLevel?: boolean;
  showValues?: boolean;
  animated?: boolean;
}

export const ExperienceBar: React.FC<Props> = ({
  current,
  max,
  level,
  style,
  showLevel = false,
  showValues = false,
  animated = true,
}) => {
  const progress = Math.min(1, current / max);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrapper}>
      {showLevel && level && (
        <Text style={styles.levelText}>Level {level}</Text>
      )}

      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.progress,
            {
              width,
            },
          ]}
        />

        {showValues && (
          <Text style={styles.valueText}>
            {current} / {max} XP
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  levelText: {
    color: colors.text.primary,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  valueText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    // textShadow is not supported in React Native
    // Use a different approach for text shadow
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 2,
    lineHeight: 8,
  },
});
