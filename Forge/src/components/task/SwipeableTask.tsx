import React, {useRef} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

interface SwipeableTaskProps {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onPress?: () => void;
}

export const SwipeableTask: React.FC<SwipeableTaskProps> = ({
  children,
  onSwipeRight,
  onPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = 100; // Threshold to trigger action

  const onGestureEvent = Animated.event(
    [{nativeEvent: {translationX: translateX}}],
    {useNativeDriver: true},
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const {translationX} = event.nativeEvent;

      // If swiped right beyond threshold
      if (translationX > swipeThreshold && onSwipeRight) {
        // Trigger haptic feedback
        ReactNativeHapticFeedback.trigger('impactMedium', {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });

        // Call the callback
        onSwipeRight();
      }

      // Reset position with animation
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }).start();
    }
  };

  // Calculate opacity for the action indicator based on swipe distance
  const actionOpacity = translateX.interpolate({
    inputRange: [0, swipeThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <GestureHandlerRootView>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={styles.container}>
          {/* Action indicator (timer icon) */}
          <Animated.View
            style={[
              styles.actionIndicator,
              {
                opacity: actionOpacity,
              },
            ]}>
            <Text style={styles.actionIcon}>⏱️</Text>
            <Text style={styles.actionText}>Start Timer</Text>
          </Animated.View>

          {/* Task content */}
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{translateX}],
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onPress}
              style={styles.touchable}>
              {children}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: spacing.xs,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  touchable: {
    width: '100%',
  },
  actionIndicator: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 0,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  actionText: {
    color: colors.header,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
