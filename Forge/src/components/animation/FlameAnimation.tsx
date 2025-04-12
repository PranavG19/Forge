import React from 'react';
import {StyleSheet, Animated, View} from 'react-native';
import {colors} from '../../theme/colors';

interface Props {
  style?: any;
}

export const FlameAnimation: React.FC<Props> = ({style}) => {
  // Multiple animations for different flame parts
  const [mainFlame] = React.useState(new Animated.Value(0));
  const [innerFlame] = React.useState(new Animated.Value(0));
  const [flicker] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    // Main flame animation
    const animateMainFlame = () => {
      Animated.sequence([
        Animated.timing(mainFlame, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(mainFlame, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animateMainFlame());
    };

    // Inner flame animation (slightly faster)
    const animateInnerFlame = () => {
      Animated.sequence([
        Animated.timing(innerFlame, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(innerFlame, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => animateInnerFlame());
    };

    // Random flicker effect
    const animateFlicker = () => {
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: Math.random(),
          duration: 300 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: Math.random(),
          duration: 200 + Math.random() * 400,
          useNativeDriver: true,
        }),
      ]).start(() => animateFlicker());
    };

    animateMainFlame();
    animateInnerFlame();
    animateFlicker();

    return () => {
      mainFlame.stopAnimation();
      innerFlame.stopAnimation();
      flicker.stopAnimation();
    };
  }, [mainFlame, innerFlame, flicker]);

  const mainFlameStyle = {
    transform: [
      {
        scale: mainFlame.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.95, 1.05, 0.95],
        }),
      },
      {
        translateY: mainFlame.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [5, -5, 5],
        }),
      },
    ],
    opacity: mainFlame.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.85, 0.95, 0.85],
    }),
  };

  const innerFlameStyle = {
    transform: [
      {
        scale: innerFlame.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 0.9, 0.8],
        }),
      },
      {
        translateY: innerFlame.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -10, 0],
        }),
      },
    ],
    opacity: innerFlame.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.7, 0.9, 0.7],
    }),
  };

  const flickerStyle = {
    opacity: flicker.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.7, 0.9, 0.7],
    }),
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background gradient */}
      <View style={styles.background} />

      {/* Main flame */}
      <Animated.View style={[styles.flame, mainFlameStyle]} />

      {/* Inner flame (brighter) */}
      <Animated.View style={[styles.innerFlame, innerFlameStyle]} />

      {/* Flicker effect */}
      <Animated.View style={[styles.flicker, flickerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.timer.focus.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.timer.focus.background,
  },
  flame: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    backgroundColor: colors.timer.focus.background,
    borderRadius: 300,
  },
  innerFlame: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: '#FF3D00', // Brighter orange
    borderRadius: 200,
  },
  flicker: {
    position: 'absolute',
    width: '40%',
    height: '40%',
    backgroundColor: '#FFAB00', // Yellow core
    borderRadius: 100,
  },
});
