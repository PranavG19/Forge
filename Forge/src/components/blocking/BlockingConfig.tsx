import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appBlockingService,
  BlockMode,
} from '../../services/blocking/AppBlockingService';
import {platformBlockingService} from '../../services/blocking/PlatformBlockingService';
import {colors} from '../../theme/colors';

interface BlockingConfigProps {
  mode: 'Focus' | 'Rest';
}

// Using AsyncStorage for settings that aren't part of the main settings service
const getLocalSetting = async (
  key: string,
  defaultValue: string,
): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.error('Error accessing AsyncStorage:', e);
    return defaultValue;
  }
};

const setLocalSetting = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Error setting AsyncStorage:', e);
  }
};

// Simple custom slider component
const SimpleSlider: React.FC<{
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  style?: any;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
}> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  style,
  minimumTrackTintColor = colors.primary,
  maximumTrackTintColor = '#000000',
}) => {
  const steps = Math.floor((maximumValue - minimumValue) / step) + 1;
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handlePress = (index: number) => {
    const newValue = minimumValue + index * step;
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  return (
    <View style={[styles.sliderContainer, style]}>
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            {
              width: `${
                ((localValue - minimumValue) / (maximumValue - minimumValue)) *
                100
              }%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
      </View>
      <View style={styles.stepsContainer}>
        {Array.from({length: steps}).map((_, index) => {
          const stepValue = minimumValue + index * step;
          const isActive = stepValue <= localValue;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.step,
                {
                  backgroundColor: isActive
                    ? minimumTrackTintColor
                    : maximumTrackTintColor,
                },
              ]}
              onPress={() => handlePress(index)}
            />
          );
        })}
      </View>
    </View>
  );
};

const BlockingConfig: React.FC<BlockingConfigProps> = ({mode}) => {
  const [initialized, setInitialized] = useState(false);
  const [blockingMode, setBlockingMode] = useState<BlockMode>('FULL');
  const [timerDuration, setTimerDuration] = useState(30); // Default 30 seconds
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const initializeBlocking = async () => {
      const hasPermission = await platformBlockingService.initialize();
      setInitialized(hasPermission);

      // Load saved settings from AsyncStorage
      const blockingModeKey = `${mode.toLowerCase()}BlockingMode`;
      const savedMode = await getLocalSetting(blockingModeKey, 'FULL');
      setBlockingMode(savedMode as BlockMode);

      const timerDurationKey = `${mode.toLowerCase()}TimerDuration`;
      const savedDuration = await getLocalSetting(timerDurationKey, '30');
      setTimerDuration(Number(savedDuration));

      const enabledKey = `${mode.toLowerCase()}BlockingEnabled`;
      const savedEnabled = await getLocalSetting(enabledKey, 'true');
      setIsEnabled(savedEnabled !== 'false');
    };

    initializeBlocking();
  }, [mode]);

  const handleModeChange = (newMode: BlockMode) => {
    setBlockingMode(newMode);
    const key = `${mode.toLowerCase()}BlockingMode`;
    setLocalSetting(key, newMode).catch(console.error);
  };

  const handleTimerDurationChange = (value: number) => {
    setTimerDuration(value);
    const key = `${mode.toLowerCase()}TimerDuration`;
    setLocalSetting(key, String(value)).catch(console.error);
  };

  const handleToggleEnabled = (value: boolean) => {
    setIsEnabled(value);
    const key = `${mode.toLowerCase()}BlockingEnabled`;
    setLocalSetting(key, String(value)).catch(console.error);
  };

  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{mode} Mode Blocking</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => platformBlockingService.initialize()}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <Text style={styles.permissionText}>
          App blocking requires permission to monitor app usage
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{mode} Mode Blocking</Text>
        <Switch
          value={isEnabled}
          onValueChange={handleToggleEnabled}
          trackColor={{false: '#767577', true: colors.primary}}
          thumbColor={isEnabled ? colors.primaryLight : '#f4f3f4'}
        />
      </View>

      {isEnabled && (
        <>
          <Text style={styles.sectionTitle}>Blocking Mode</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                blockingMode === 'FULL' && styles.selectedMode,
              ]}
              onPress={() => handleModeChange('FULL')}>
              <Text
                style={[
                  styles.modeButtonText,
                  blockingMode === 'FULL' && styles.selectedModeText,
                ]}>
                Full Block
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                blockingMode === 'REMINDER' && styles.selectedMode,
              ]}
              onPress={() => handleModeChange('REMINDER')}>
              <Text
                style={[
                  styles.modeButtonText,
                  blockingMode === 'REMINDER' && styles.selectedModeText,
                ]}>
                Reminder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                blockingMode === 'TIMER' && styles.selectedMode,
              ]}
              onPress={() => handleModeChange('TIMER')}>
              <Text
                style={[
                  styles.modeButtonText,
                  blockingMode === 'TIMER' && styles.selectedModeText,
                ]}>
                Timer
              </Text>
            </TouchableOpacity>
          </View>

          {blockingMode === 'TIMER' && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>
                Countdown: {timerDuration} seconds
              </Text>
              <SimpleSlider
                style={styles.slider}
                minimumValue={10}
                maximumValue={60}
                step={5}
                value={timerDuration}
                onValueChange={handleTimerDurationChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="#333333"
              />
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {blockingMode === 'FULL'
                ? 'Full Block: Completely prevents access to blocked apps'
                : blockingMode === 'REMINDER'
                ? 'Reminder: Shows a notification when you try to use blocked apps'
                : 'Timer: Allows access for a limited time before blocking'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  selectedModeText: {
    color: '#000',
  },
  timerContainer: {
    marginVertical: 16,
  },
  timerLabel: {
    color: '#ccc',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#222',
    borderRadius: 4,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 16,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  permissionText: {
    color: '#ccc',
    textAlign: 'center',
  },
  // Slider styles
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
  },
  step: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
});

export default BlockingConfig;
