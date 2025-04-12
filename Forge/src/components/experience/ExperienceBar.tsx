import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../../theme/colors';

interface Props {
  current: number;
  max: number;
  style?: ViewStyle;
}

export const ExperienceBar: React.FC<Props> = ({current, max, style}) => {
  const progress = Math.min(1, current / max);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.progress,
          {
            width: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
