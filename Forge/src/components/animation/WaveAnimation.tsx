import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Animated, View, Dimensions} from 'react-native';
import {colors} from '../../theme/colors';
import {fluidSimulation, FluidPoint} from '../../utils/animation/fluidDynamics';
import {particleSystem, Particle} from '../../utils/animation/particleSystem';
import {WaterParticle} from './WaterParticle';

interface Props {
  style?: any;
  particleCount?: number;
}

export const WaveAnimation: React.FC<Props> = ({style, particleCount = 30}) => {
  // Multiple animations for different wave parts
  const [wave1Position] = useState(new Animated.Value(0));
  const [wave2Position] = useState(new Animated.Value(0));
  const [wave3Position] = useState(new Animated.Value(0));
  const [shimmer] = useState(new Animated.Value(0));

  // Fluid simulation state
  const [fluidPoints, setFluidPoints] = useState<FluidPoint[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<View>(null);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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

    // Initialize fluid simulation
    initFluidSimulation();

    // Start animation loop
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
      lastUpdateTimeRef.current = now;

      // Update fluid simulation
      updateFluidSimulation(deltaTime);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Add random disturbances to the fluid
    const disturbanceInterval = setInterval(() => {
      const x = Math.random() * screenWidth;
      const y = Math.random() * screenHeight * 0.7 + screenHeight * 0.3; // Bottom 70%
      fluidSimulation.addDisturbance(x, y, 2 + Math.random() * 3);
    }, 2000);

    return () => {
      wave1Position.stopAnimation();
      wave2Position.stopAnimation();
      wave3Position.stopAnimation();
      shimmer.stopAnimation();

      // Clean up animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clear interval
      clearInterval(disturbanceInterval);

      // Clear timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [wave1Position, wave2Position, wave3Position, shimmer, particleCount]);

  // Initialize fluid simulation
  const initFluidSimulation = () => {
    // Configure fluid simulation
    fluidSimulation.setParameters({
      gravity: 0.02,
      damping: 0.99,
      pressureStrength: 0.2,
      densityStrength: 0.2,
      interactionRadius: 60,
    });

    // Clear existing points
    fluidSimulation.clear();

    // Add fluid points
    for (let i = 0; i < 40; i++) {
      fluidSimulation.addPoint(
        Math.random() * screenWidth,
        Math.random() * screenHeight * 0.7 + screenHeight * 0.3, // Bottom 70%
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
    }

    // Initialize particles
    particleSystem.clear();
    const newParticles = particleSystem.createWaterParticles(
      screenWidth / 2,
      screenHeight / 2,
      particleCount,
      {
        baseSize: 15,
        baseVelocity: 30,
        colors: ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA'],
      },
    );

    setParticles(newParticles);
  };

  // Update fluid simulation
  const updateFluidSimulation = (deltaTime: number) => {
    // Update fluid simulation
    fluidSimulation.update(deltaTime);
    setFluidPoints([...fluidSimulation.getPoints()]);

    // Update existing particles
    particleSystem.update(deltaTime * 1000); // Convert to milliseconds

    // Add new particles occasionally
    if (Math.random() < 0.05) {
      const x = Math.random() * screenWidth;
      const y = screenHeight * 0.7 + Math.random() * screenHeight * 0.3; // Bottom 30%

      const newParticles = particleSystem.createWaterParticles(
        x,
        y,
        Math.floor(Math.random() * 2) + 1, // 1-2 particles
        {
          baseSize: 10 + Math.random() * 8,
          baseVelocity: 20 + Math.random() * 20,
          colors: ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA'],
        },
      );

      setParticles(prevParticles => [...prevParticles, ...newParticles]);
    }

    // Update state with current particles
    setParticles([...particleSystem.getParticles()]);
  };

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
    <View
      ref={containerRef}
      style={[styles.container, style]}
      onTouchStart={e => {
        // Add disturbance on touch
        const {locationX, locationY} = e.nativeEvent;
        fluidSimulation.addDisturbance(locationX, locationY, 8);

        // Add water particles on touch
        const newParticles = particleSystem.createWaterParticles(
          locationX,
          locationY,
          5,
          {
            baseSize: 15,
            baseVelocity: 40,
            colors: ['#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA'],
          },
        );

        setParticles(prevParticles => [...prevParticles, ...newParticles]);

        // Clear previous timeout
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }

        // Add ripple effect for a short time
        touchTimeoutRef.current = setTimeout(() => {
          fluidSimulation.addDisturbance(locationX, locationY, 3);
        }, 200);
      }}>
      {/* Background */}
      <View style={styles.background} />

      {/* Main waves */}
      <Animated.View style={[styles.wave, styles.wave1, wave1Style]} />
      <Animated.View style={[styles.wave, styles.wave2, wave2Style]} />
      <Animated.View style={[styles.wave, styles.wave3, wave3Style]} />

      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmer, shimmerStyle]} />

      {/* Fluid points visualization */}
      {fluidPoints.map((point, index) => (
        <View
          key={`fluid_${index}`}
          style={[
            styles.fluidPoint,
            {
              left: point.x,
              top: point.y,
              opacity: 0.1 + point.density * 0.2,
              transform: [{scale: 0.5 + point.density * 0.5}],
            },
          ]}
        />
      ))}

      {/* Water particles */}
      {particles.map(particle => (
        <WaterParticle key={particle.id} particle={particle} />
      ))}
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
  fluidPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81D4FA',
  },
});
