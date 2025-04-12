import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface TaskSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  count,
  children,
  initiallyExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [rotateAnimation] = useState(
    new Animated.Value(initiallyExpanded ? 1 : 0),
  );

  const toggleExpanded = () => {
    // Configure animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Rotate arrow animation
    Animated.timing(rotateAnimation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setExpanded(!expanded);
  };

  const arrowRotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countContainer}>
            <Text style={styles.count}>{count}</Text>
          </View>
        </View>
        <Animated.Text
          style={[
            styles.arrow,
            {
              transform: [{rotate: arrowRotation}],
            },
          ]}>
          ▶
        </Animated.Text>
      </TouchableOpacity>

      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  countContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  count: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 16,
    color: colors.text.primary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
