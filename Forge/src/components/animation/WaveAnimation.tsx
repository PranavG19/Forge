import React from 'react';
import {StyleSheet, Animated, View} from 'react-native';
import {colors} from '../../theme/colors';

interface Props {
  style?: any;
}

export const WaveAnimation: React.FC<Props> = ({style}) => {
  // Multiple animations for different wave parts
  const [wave1Position] = React.useState(new Animated.Value(0));
  const [wave2Position] = React.useState(new Animated.Value(0));
  const [wave3Position] = React.useState(new Animated.Value(0));
  const [shimmer] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    // Primary wave animation
    const animateWave1 = () => {
      Animated.sequence([
        Animated.timing(wave1Position, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Position, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => animateWave1());
    };

    // Secondary wave animation (slightly faster)
    const animateWave2 = () => {
      Animated.sequence([
        Animated.timing(wave2Position, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(wave2Position, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ]).start(() => animateWave2());
    };

    // Tertiary wave animation (even faster)
    const animateWave3 = () => {
      Animated.sequence([
        Animated.timing(wave3Position, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave3Position, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => animateWave3());
    };

    // Shimmer effect animation
    const animateShimmer = () => {
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animateShimmer());
    };

    // Start all animations with slight delays
    animateWave1();
    setTimeout(() => animateWave2(), 500);
    setTimeout(() => animateWave3(), 1000);
    setTimeout(() => animateShimmer(), 1500);

    return () => {
      wave1Position.stopAnimation();
      wave2Position.stopAnimation();
      wave3Position.stopAnimation();
      shimmer.stopAnimation();
    };
  }, [wave1Position, wave2Position, wave3Position, shimmer]);

  const wave1Style = {
    transform: [
      {
        translateY: wave1Position.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 15, 0],
        }),
      },
      {
        translateX: wave1Position.interpolate({
          inputRange: [0, 0.25, 0.75, 1],
          outputRange: [0, 10, -10, 0],
        }),
      },
    ],
    opacity: wave1Position.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.7, 0.9, 0.7],
    }),
  };

  const wave2Style = {
    transform: [
      {
        translateY: wave2Position.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -15, 0],
        }),
      },
      {
        translateX: wave2Position.interpolate({
          inputRange: [0, 0.25, 0.75, 1],
          outputRange: [0, -15, 15, 0],
        }),
      },
    ],
    opacity: wave2Position.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.6, 0.8, 0.6],
    }),
  };

  const wave3Style = {
    transform: [
      {
        translateY: wave3Position.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 10, 0],
        }),
      },
      {
        translateX: wave3Position.interpolate({
          inputRange: [0, 0.25, 0.75, 1],
          outputRange: [0, 5, -5, 0],
        }),
      },
    ],
    opacity: wave3Position.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.7, 0.5],
    }),
  };

  const shimmerStyle = {
    opacity: shimmer.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.2, 0.4, 0.2],
    }),
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background */}
      <View style={styles.background} />

      {/* Main waves */}
      <Animated.View style={[styles.wave, styles.wave1, wave1Style]} />
      <Animated.View style={[styles.wave, styles.wave2, wave2Style]} />
      <Animated.View style={[styles.wave, styles.wave3, wave3Style]} />

      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: colors.timer.rest.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.timer.rest.background,
  },
  wave: {
    position: 'absolute',
    left: -100,
    right: -100,
    height: '40%',
    borderRadius: 100,
  },
  wave1: {
    top: '30%',
    backgroundColor: '#1E88E5', // Slightly darker blue
    opacity: 0.8,
  },
  wave2: {
    top: '45%',
    backgroundColor: '#42A5F5', // Medium blue
    opacity: 0.7,
  },
  wave3: {
    top: '60%',
    backgroundColor: '#64B5F6', // Lighter blue
    opacity: 0.6,
  },
  shimmer: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#BBDEFB', // Very light blue
  },
});
