import {NativeModules, NativeEventEmitter} from 'react-native';
import {BlockingServiceInterface} from './BlockingServiceInterface';

// This would be implemented as a native module in Kotlin
const {UsageStatsManager} = NativeModules;

interface UsageStatsManagerType {
  requestPermission(): Promise<boolean>;
  setAppRestriction(
    packageName: string,
    mode: string,
    duration?: number,
  ): Promise<void>;
  removeAppRestriction(packageName: string): Promise<void>;
  isAppRestricted(packageName: string): Promise<boolean>;
  getUsageStats(startTime: number, endTime: number): Promise<any>;
}

class AndroidBlockingService implements BlockingServiceInterface {
  private static instance: AndroidBlockingService;
  private hasPermission = false;
  private eventEmitter: NativeEventEmitter;

  private constructor() {
    this.eventEmitter = new NativeEventEmitter(UsageStatsManager);
    this.setupListeners();
  }

  static getInstance(): AndroidBlockingService {
    if (!AndroidBlockingService.instance) {
      AndroidBlockingService.instance = new AndroidBlockingService();
    }
    return AndroidBlockingService.instance;
  }

  private setupListeners(): void {
    this.eventEmitter.addListener(
      'appRestrictionChanged',
      ({packageName, isRestricted}) => {
        console.log(
          `App ${packageName} restriction state changed: ${isRestricted}`,
        );
      },
    );

    this.eventEmitter.addListener(
      'appRestrictionError',
      ({packageName, error}) => {
        console.error(`App restriction error for ${packageName}:`, error);
      },
    );
  }

  async initialize(): Promise<boolean> {
    try {
      this.hasPermission = await UsageStatsManager.requestPermission();
      return this.hasPermission;
    } catch (error) {
      console.error('Failed to initialize Android blocking service:', error);
      return false;
    }
  }

  async blockApp(
    packageName: string,
    mode: string,
    duration?: number,
  ): Promise<void> {
    if (!this.hasPermission) {
      throw new Error('Usage stats permission not granted');
    }

    try {
      await UsageStatsManager.setAppRestriction(packageName, mode, duration);
    } catch (error) {
      console.error(`Failed to block app ${packageName}:`, error);
      throw error;
    }
  }

  async unblockApp(packageName: string): Promise<void> {
    if (!this.hasPermission) {
      throw new Error('Usage stats permission not granted');
    }

    try {
      await UsageStatsManager.removeAppRestriction(packageName);
    } catch (error) {
      console.error(`Failed to unblock app ${packageName}:`, error);
      throw error;
    }
  }

  async isAppBlocked(packageName: string): Promise<boolean> {
    if (!this.hasPermission) {
      return false;
    }

    try {
      return await UsageStatsManager.isAppRestricted(packageName);
    } catch (error) {
      console.error(`Failed to check if app ${packageName} is blocked:`, error);
      return false;
    }
  }

  async getUsageStats(startTime: number, endTime: number): Promise<any> {
    if (!this.hasPermission) {
      throw new Error('Usage stats permission not granted');
    }

    try {
      return await UsageStatsManager.getUsageStats(startTime, endTime);
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw error;
    }
  }
}

export const androidBlockingService = AndroidBlockingService.getInstance();
