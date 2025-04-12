import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import {
  timerService,
  TimerService,
  TimerMode,
  TimerState,
  TimerStatus,
} from '../../services/timer/TimerService';
import {taskService} from '../../services/task/TaskService';
import {Task} from '../../models/Task';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

export const TimerScreen: React.FC<Props> = ({route, navigation}) => {
  const {taskId} = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>(
    timerService.getStatus(),
  );
  const [animation] = useState(new Animated.Value(0));

  // Load task details
  useEffect(() => {
    const loadTask = async () => {
      try {
        const loadedTask = await taskService.getTask(taskId);
        setTask(loadedTask);
      } catch (error) {
        console.error('Error loading task:', error);
      }
    };
    loadTask();
  }, [taskId]);

  // Timer event listeners
  useEffect(() => {
    const handleTimerUpdate = (status: TimerStatus) => {
      setTimerStatus(status);
    };

    timerService.on('timerTick', handleTimerUpdate);
    timerService.on('timerStarted', handleTimerUpdate);
    timerService.on('timerPaused', handleTimerUpdate);
    timerService.on('timerResumed', handleTimerUpdate);
    timerService.on('timerCompleted', handleTimerUpdate);
    timerService.on('timerStopped', handleTimerUpdate);

    return () => {
      timerService.removeAllListeners();
    };
  }, []);

  // Background animation
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [animation]);

  const handleStartFocus = useCallback(() => {
    if (!taskId) return;
    timerService.startFocus(taskId);
  }, [taskId]);

  const handleStartRest = useCallback(() => {
    timerService.startRest();
  }, []);

  const handlePauseResume = useCallback(() => {
    if (timerStatus.state === TimerState.RUNNING) {
      timerService.pause();
    } else if (timerStatus.state === TimerState.PAUSED) {
      timerService.resume();
    }
  }, [timerStatus.state]);

  const handleStop = useCallback(() => {
    timerService.stop();
  }, []);

  const renderControls = () => {
    if (timerStatus.state === TimerState.IDLE) {
      return (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.focusButton]}
            onPress={handleStartFocus}>
            <Text style={styles.buttonText}>Start Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.restButton]}
            onPress={handleStartRest}>
            <Text style={styles.buttonText}>Start Rest</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.controlButton]}
          onPress={handlePauseResume}>
          <Text style={styles.buttonText}>
            {timerStatus.state === TimerState.RUNNING ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const backgroundStyle = {
    backgroundColor:
      timerStatus.mode === TimerMode.FOCUS
        ? colors.timer.focus.background
        : colors.timer.rest.background,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      <View style={styles.content}>
        <Text style={styles.modeText}>
          {timerStatus.mode === TimerMode.FOCUS ? 'Focus Time' : 'Rest Time'}
        </Text>

        {task && timerStatus.mode === TimerMode.FOCUS && (
          <Text style={styles.taskText}>{task.title}</Text>
        )}

        <Text style={styles.timerText}>
          {TimerService.formatTime(timerStatus.timeRemaining)}
        </Text>

        {renderControls()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modeText: {
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  taskText: {
    fontSize: spacing.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timerText: {
    fontSize: spacing.xxl * 2,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    minWidth: 120,
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: spacing.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  focusButton: {
    backgroundColor: colors.timer.focus.background,
  },
  restButton: {
    backgroundColor: colors.timer.rest.background,
  },
  controlButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.status.error,
  },
});
