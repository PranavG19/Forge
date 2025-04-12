import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Particle} from '../../utils/animation/particleSystem';

interface FireParticleProps {
  particle: Particle;
}

export const FireParticle: React.FC<FireParticleProps> = ({particle}) => {
  const opacity = useRef(new Animated.Value(particle.opacity)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate opacity based on lifetime
    Animated.timing(opacity, {
      toValue: 0,
      duration: particle.lifetime,
      useNativeDriver: true,
    }).start();

    // Animate scale for a growing effect
    Animated.timing(scale, {
      toValue: 0.2,
      duration: particle.lifetime,
      useNativeDriver: true,
    }).start();

    return () => {
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, [particle.lifetime, opacity, scale]);

  // Create a radial gradient-like effect with multiple layers
  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity,
          transform: [{scale}, {rotate: `${particle.rotation}rad`}],
        },
      ]}>
      <View
        style={[
          styles.core,
          {backgroundColor: lightenColor(particle.color, 50)},
        ]}
      />
    </Animated.View>
  );
};

// Helper function to lighten a color
const lightenColor = (color: string, percent: number): string => {
  // For simplicity, only handle hex colors
  if (!color.startsWith('#')) return color;

  // Convert hex to RGB
  let r = parseInt(color.substr(1, 2), 16);
  let g = parseInt(color.substr(3, 2), 16);
  let b = parseInt(color.substr(5, 2), 16);

  // Lighten
  r = Math.min(255, r + percent);
  g = Math.min(255, g + percent);
  b = Math.min(255, b + percent);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 100, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  core: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
  },
});
