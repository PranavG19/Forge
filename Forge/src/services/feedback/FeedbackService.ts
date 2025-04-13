import {Vibration} from 'react-native';
import Sound from 'react-native-sound';
import {settingsService} from '../settings/SettingsService';

export enum SoundType {
  TIMER_START = 'timer_start',
  TIMER_END = 'timer_end',
  TASK_COMPLETE = 'task_complete',
  LEVEL_UP = 'level_up',
}

// Modified to allow undefined values for missing sound files
type SoundAssets = {
  [key in SoundType]?: number;
};

// Use a try-catch block to handle missing sound files
const soundAssets: SoundAssets = {};
try {
  // Attempt to load sound assets if they exist
  soundAssets[
    SoundType.TIMER_START
  ] = require('../../assets/sounds/timer-start.mp3');
} catch (e) {
  console.warn('Missing sound file: timer-start.mp3');
}

try {
  soundAssets[
    SoundType.TIMER_END
  ] = require('../../assets/sounds/timer-end.mp3');
} catch (e) {
  console.warn('Missing sound file: timer-end.mp3');
}

try {
  soundAssets[
    SoundType.TASK_COMPLETE
  ] = require('../../assets/sounds/task-complete.mp3');
} catch (e) {
  console.warn('Missing sound file: task-complete.mp3');
}

try {
  soundAssets[SoundType.LEVEL_UP] = require('../../assets/sounds/level-up.mp3');
} catch (e) {
  console.warn('Missing sound file: level-up.mp3');
}

export class FeedbackService {
  private static instance: FeedbackService;
  private sounds: Map<SoundType, Sound> = new Map();
  private initialized = false;

  private constructor() {
    this.initializeSounds().catch(console.error);
  }

  static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  private async initializeSounds(): Promise<void> {
    if (this.initialized) return;

    Sound.setCategory('Playback');

    try {
      // Initialize all sounds that were successfully loaded
      for (const [type, asset] of Object.entries(soundAssets)) {
        if (asset) {
          try {
            const sound = new Sound(asset, (error: Error | null) => {
              if (error) {
                console.error(`Error loading sound ${type}:`, error);
              }
            });
            this.sounds.set(type as SoundType, sound);
          } catch (e) {
            console.error(`Failed to initialize sound ${type}:`, e);
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing sounds:', error);
      throw error;
    }
  }

  async playSound(type: SoundType): Promise<void> {
    const soundEnabled = await settingsService.getSetting('soundEnabled');
    if (!soundEnabled) return;

    const sound = this.sounds.get(type);
    if (!sound) {
      // Just return silently if the sound doesn't exist
      // This allows the app to function without the sound files
      return;
    }

    return new Promise<void>((resolve, reject) => {
      sound.play((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject(new Error(`Error playing sound ${type}`));
        }
      });
    });
  }

  async vibrate(pattern?: number | number[]): Promise<void> {
    const hapticsEnabled = await settingsService.getSetting('hapticsEnabled');
    if (!hapticsEnabled) return;

    if (pattern) {
      Vibration.vibrate(pattern);
    } else {
      Vibration.vibrate(400); // Default duration
    }
  }

  // Predefined feedback patterns
  async timerStart(): Promise<void> {
    await Promise.all([
      this.playSound(SoundType.TIMER_START),
      this.vibrate([0, 100]),
    ]);
  }

  async timerEnd(): Promise<void> {
    await Promise.all([
      this.playSound(SoundType.TIMER_END),
      this.vibrate([0, 200, 100, 200]),
    ]);
  }

  async taskComplete(): Promise<void> {
    await Promise.all([
      this.playSound(SoundType.TASK_COMPLETE),
      this.vibrate([0, 100, 50, 100]),
    ]);
  }

  async levelUp(): Promise<void> {
    await Promise.all([
      this.playSound(SoundType.LEVEL_UP),
      this.vibrate([0, 200, 100, 200, 100, 200]),
    ]);
  }

  // Cleanup method to release sound resources
  cleanup(): void {
    for (const sound of this.sounds.values()) {
      sound.release();
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

export const feedbackService = FeedbackService.getInstance();
