import {Vibration} from 'react-native';
import Sound from 'react-native-sound';
import {settingsService} from '../settings/SettingsService';

export enum SoundType {
  TIMER_START = 'timer_start',
  TIMER_END = 'timer_end',
  TASK_COMPLETE = 'task_complete',
  LEVEL_UP = 'level_up',
}

type SoundAssets = {
  [key in SoundType]: number;
};

const soundAssets: SoundAssets = {
  [SoundType.TIMER_START]: require('../../assets/sounds/timer-start.mp3'),
  [SoundType.TIMER_END]: require('../../assets/sounds/timer-end.mp3'),
  [SoundType.TASK_COMPLETE]: require('../../assets/sounds/task-complete.mp3'),
  [SoundType.LEVEL_UP]: require('../../assets/sounds/level-up.mp3'),
};

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
      // Initialize all sounds
      for (const [type, asset] of Object.entries(soundAssets)) {
        const sound = new Sound(asset, (error: Error | null) => {
          if (error) {
            console.error(`Error loading sound ${type}:`, error);
          }
        });
        this.sounds.set(type as SoundType, sound);
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
      console.error(`Sound ${type} not found`);
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
