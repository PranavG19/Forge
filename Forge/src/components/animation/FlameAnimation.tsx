import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Animated, View, Dimensions} from 'react-native';
import {colors} from '../../theme/colors';
import {particleSystem, Particle} from '../../utils/animation/particleSystem';
import {FireParticle} from './FireParticle';

interface Props {
  style?: any;
  particleCount?: number;
}

export const FlameAnimation: React.FC<Props> = ({
  style,
  particleCount = 20,
}) => {
  // Multiple animations for different flame parts
  const [mainFlame] = useState(new Animated.Value(0));
  const [innerFlame] = useState(new Animated.Value(0));
  const [flicker] = useState(new Animated.Value(0));

  // Particle system state
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<View>(null);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
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

    // Initialize particle system
    initParticles();

    // Start animation loop
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = now;

      // Update particles
      updateParticles(deltaTime);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mainFlame.stopAnimation();
      innerFlame.stopAnimation();
      flicker.stopAnimation();

      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mainFlame, innerFlame, flicker, particleCount]);

  // Initialize particles
  const initParticles = () => {
    // Clear existing particles
    particleSystem.clear();

    // Create new particles
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    const newParticles = particleSystem.createFireParticles(
      centerX,
      centerY + 50, // Start from bottom center
      particleCount,
      {
        baseSize: 20,
        baseVelocity: 80,
        colors: ['#FF5722', '#FF9800', '#FFEB3B', '#FF6B00'],
      },
    );

    setParticles(newParticles);
  };

  // Update particles
  const updateParticles = (deltaTime: number) => {
    // Update existing particles
    particleSystem.update(deltaTime * 1000); // Convert to milliseconds

    // Add new particles occasionally
    if (Math.random() < 0.1) {
      const centerX = screenWidth / 2 + (Math.random() - 0.5) * 100;
      const centerY = screenHeight / 2 + 50 + (Math.random() - 0.5) * 20;

      const newParticles = particleSystem.createFireParticles(
        centerX,
        centerY,
        Math.floor(Math.random() * 3) + 1, // 1-3 particles
        {
          baseSize: 15 + Math.random() * 10,
          baseVelocity: 60 + Math.random() * 40,
          colors: ['#FF5722', '#FF9800', '#FFEB3B', '#FF6B00'],
        },
      );

      setParticles(prevParticles => [...prevParticles, ...newParticles]);
    }

    // Update state with current particles
    setParticles([...particleSystem.getParticles()]);
  };

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
    <View ref={containerRef} style={[styles.container, style]}>
      {/* Background gradient */}
      <View style={styles.background} />

      {/* Main flame */}
      <Animated.View style={[styles.flame, mainFlameStyle]} />

      {/* Inner flame (brighter) */}
      <Animated.View style={[styles.innerFlame, innerFlameStyle]} />

      {/* Flicker effect */}
      <Animated.View style={[styles.flicker, flickerStyle]} />

      {/* Particles */}
      {particles.map(particle => (
        <FireParticle key={particle.id} particle={particle} />
      ))}
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
