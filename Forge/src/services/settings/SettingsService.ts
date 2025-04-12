import {EventEmitter} from 'events';
import {databaseService} from '../storage/DatabaseService';
import {experienceService} from '../experience/ExperienceService';
import {intentionService} from '../intention/IntentionService';

export interface AppSettings {
  onboardingCompleted: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  weeklyResetDay: string;
  focusTimerPresets: number[];
  restTimerPresets: number[];
  lastResetDate?: string;
}

const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export class SettingsService extends EventEmitter {
  private static instance: SettingsService;
  private initialized = false;
  private settings: AppSettings;

  private static readonly DEFAULT_SETTINGS: AppSettings = {
    onboardingCompleted: false,
    soundEnabled: true,
    hapticsEnabled: true,
    weeklyResetDay: 'SUNDAY',
    focusTimerPresets: [25, 50, 90], // in minutes
    restTimerPresets: [5, 10, 30], // in minutes
    lastResetDate: new Date().toISOString(),
  };

  private constructor() {
    super();
    this.settings = {...SettingsService.DEFAULT_SETTINGS};
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Initialize default settings if not set
      const defaultSettings = SettingsService.DEFAULT_SETTINGS;
      for (const [key, value] of Object.entries(defaultSettings)) {
        await databaseService.executeSql(
          `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
          [key, JSON.stringify(value)],
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize settings database:', error);
      throw error;
    }
  }

  async getSoundEnabled(): Promise<boolean> {
    return this.getSetting('soundEnabled');
  }

  async getHapticsEnabled(): Promise<boolean> {
    return this.getSetting('hapticsEnabled');
  }

  async toggleSound(enabled: boolean): Promise<void> {
    await this.setSetting('soundEnabled', enabled);
    this.emit('soundToggled', enabled);
  }

  async toggleHaptics(enabled: boolean): Promise<void> {
    await this.setSetting('hapticsEnabled', enabled);
    this.emit('hapticsToggled', enabled);
  }

  private async setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    await this.initializeDatabase();

    try {
      await databaseService.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, JSON.stringify(value)],
      );
      this.settings[key] = value;
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }

  async getSetting<K extends keyof AppSettings>(
    key: K,
  ): Promise<AppSettings[K]> {
    await this.initializeDatabase();
    return this.settings[key];
  }

  async getAllSettings(): Promise<AppSettings> {
    await this.initializeDatabase();
    return {...this.settings};
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await this.setSetting('onboardingCompleted', completed);
  }

  async isOnboardingCompleted(): Promise<boolean> {
    return this.getSetting('onboardingCompleted');
  }

  async setSoundEnabled(enabled: boolean): Promise<void> {
    await this.setSetting('soundEnabled', enabled);
  }

  async setHapticsEnabled(enabled: boolean): Promise<void> {
    await this.setSetting('hapticsEnabled', enabled);
  }

  async setWeeklyResetDay(day: string): Promise<void> {
    if (!DAYS_OF_WEEK.includes(day.toUpperCase())) {
      throw new Error('Invalid day of week');
    }
    await this.setSetting('weeklyResetDay', day.toUpperCase());
  }

  async checkWeeklyReset(): Promise<void> {
    await this.initializeDatabase();
    const now = new Date();
    const resetDay = await this.getSetting('weeklyResetDay');
    const lastReset =
      (await this.getSetting('lastResetDate')) || now.toISOString();
    const lastResetDate = new Date(lastReset);

    // Calculate days since last reset
    const daysSinceReset = Math.floor(
      (now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Get current day name
    const currentDay = DAYS_OF_WEEK[now.getDay()];

    // Check if it's been a week and if today is the reset day
    if (daysSinceReset >= 7 && currentDay === resetDay) {
      // Perform weekly reset
      await Promise.all([
        experienceService.resetWeeklyExp(),
        this.setSetting('lastResetDate', now.toISOString()),
      ]);
    }
  }

  async setFocusTimerPresets(presets: number[]): Promise<void> {
    await this.setSetting('focusTimerPresets', presets);
  }

  async setRestTimerPresets(presets: number[]): Promise<void> {
    await this.setSetting('restTimerPresets', presets);
  }
}

export const settingsService = SettingsService.getInstance();
