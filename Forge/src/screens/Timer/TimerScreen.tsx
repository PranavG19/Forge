import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../App';
import Sound from 'react-native-sound';
import {
  timerService,
  TimerService,
  TimerMode,
  TimerState,
  TimerStatus,
} from '../../services/timer/TimerService';
import {taskService} from '../../services/task/TaskService';
import {appBlocker} from '../../services/blocking/AppBlocker';
import {Task} from '../../models/Task';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';
import {FlameAnimation} from '../../components/animation/FlameAnimation';
import {WaveAnimation} from '../../components/animation/WaveAnimation';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

export const TimerScreen: React.FC<Props> = ({route, navigation}) => {
  const {taskId} = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>(
    timerService.getStatus(),
  );
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number>(25);
  const [customRestDuration, setCustomRestDuration] = useState<number>(5);

  // Timer presets in minutes [focus, rest]
  const TIMER_PRESETS = [
    [25, 5],
    [90, 30],
    [50, 10],
  ];

  // Initialize app blocking
  useEffect(() => {
    appBlocker.initialize().catch(error => {
      console.error('Failed to initialize app blocking:', error);
    });
  }, []);

  // Sound setup
  useEffect(() => {
    Sound.setCategory('Playback');
    const chime = new Sound(
      'chime.mp3',
      (error: Error | null) => {
        if (error) {
          console.error('Failed to load sound', error);
        }
      },
      {mainBundle: true},
    );
    return () => chime.release();
  }, []);

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

  // Handle timer completion
  useEffect(() => {
    if (timerStatus.state === TimerState.COMPLETED) {
      // Play chime
      const chime = new Sound(
        'chime.mp3',
        (error: Error | null) => {
          if (!error) {
            chime.play(() => chime.release());
          }
        },
        {mainBundle: true},
      );

      // Vibrate
      Vibration.vibrate([0, 500]);
    }
  }, [timerStatus.state]);

  const handleStartFocus = useCallback(async () => {
    if (!taskId) return;
    const duration =
      selectedPreset === TIMER_PRESETS.length
        ? customDuration
        : TIMER_PRESETS[selectedPreset][0];

    try {
      await appBlocker.enableFocusMode();
      timerService.startFocus(taskId, duration * 60); // Convert to seconds
      Vibration.vibrate([0, 200]); // Short vibration on start
    } catch (error) {
      console.error('Failed to enable focus mode:', error);
    }
  }, [taskId, selectedPreset, customDuration]);

  const handleStartRest = useCallback(async () => {
    const duration =
      selectedPreset === TIMER_PRESETS.length
        ? customRestDuration
        : TIMER_PRESETS[selectedPreset][1];

    try {
      await appBlocker.enableRestMode();
      timerService.startRest(duration * 60); // Convert to seconds
      Vibration.vibrate([0, 200]); // Short vibration on start
    } catch (error) {
      console.error('Failed to enable rest mode:', error);
    }
  }, [selectedPreset, customRestDuration]);

  const handlePauseResume = useCallback(() => {
    if (timerStatus.state === TimerState.RUNNING) {
      timerService.pause();
    } else if (timerStatus.state === TimerState.PAUSED) {
      timerService.resume();
    }
  }, [timerStatus.state]);

  const handleStop = useCallback(async () => {
    try {
      await appBlocker.disableBlocking();
      timerService.stop();
    } catch (error) {
      console.error('Failed to disable blocking:', error);
    }
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

  const renderPresets = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.presetContainer}>
      {TIMER_PRESETS.map(([focus, rest], index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.presetButton,
            selectedPreset === index && styles.presetButtonSelected,
          ]}
          onPress={() => setSelectedPreset(index)}>
          <Text style={styles.presetText}>{`${focus}/${rest}`}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.presetButton,
          selectedPreset === TIMER_PRESETS.length &&
            styles.presetButtonSelected,
        ]}
        onPress={() => setSelectedPreset(TIMER_PRESETS.length)}>
        <Text style={styles.presetText}>Custom</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {timerStatus.mode === TimerMode.FOCUS ? (
        <FlameAnimation style={styles.background} />
      ) : (
        <WaveAnimation style={styles.background} />
      )}
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

        {timerStatus.state === TimerState.IDLE && renderPresets()}
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
  presetContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  presetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
    minWidth: 80,
  },
  presetButtonSelected: {
    backgroundColor: colors.primary,
  },
  presetText: {
    color: colors.text.primary,
    fontSize: spacing.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
