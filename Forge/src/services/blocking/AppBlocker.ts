import {Platform} from 'react-native';
import {appBlockingService} from './AppBlockingService';
import {ScreenTime, UsageStats} from './native';

/**
 * A simplified interface for app blocking functionality
 */
export class AppBlocker {
  private static instance: AppBlocker;
  private initialized = false;

  private constructor() {}

  static getInstance(): AppBlocker {
    if (!AppBlocker.instance) {
      AppBlocker.instance = new AppBlocker();
    }
    return AppBlocker.instance;
  }

  /**
   * Initialize app blocking functionality
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      if (Platform.OS === 'ios') {
        // Request Screen Time authorization
        const result = await this.executeNativeCommand('requestScreenTimeAuth');
        this.initialized = result === true;
      } else {
        // Request Usage Stats permission
        const result = await this.executeNativeCommand(
          'requestUsageStatsPermission',
        );
        this.initialized = result === true;
      }
      return this.initialized;
    } catch (error) {
      console.error('Failed to initialize app blocking:', error);
      return false;
    }
  }

  /**
   * Enable blocking for Focus mode
   */
  async enableFocusMode(): Promise<void> {
    if (!this.initialized) {
      throw new Error('App blocker not initialized');
    }

    const blockedApps = appBlockingService.getFocusBlockedApps();
    for (const app of blockedApps) {
      try {
        await this.executeNativeCommand('blockApp', {
          packageName: app.packageName,
          mode: app.mode,
          duration: app.timerDuration,
        });
      } catch (error) {
        console.error(`Failed to block app ${app.packageName}:`, error);
        await appBlockingService.logBreach(app.packageName, 'FOCUS');
      }
    }
  }

  /**
   * Enable blocking for Rest mode
   */
  async enableRestMode(): Promise<void> {
    if (!this.initialized) {
      throw new Error('App blocker not initialized');
    }

    const blockedApps = appBlockingService.getRestBlockedApps();
    for (const app of blockedApps) {
      try {
        await this.executeNativeCommand('blockApp', {
          packageName: app.packageName,
          mode: app.mode,
          duration: app.timerDuration,
        });
      } catch (error) {
        console.error(`Failed to block app ${app.packageName}:`, error);
        await appBlockingService.logBreach(app.packageName, 'REST');
      }
    }
  }

  /**
   * Disable all app blocking
   */
  async disableBlocking(): Promise<void> {
    if (!this.initialized) return;

    const focusApps = appBlockingService.getFocusBlockedApps();
    const restApps = appBlockingService.getRestBlockedApps();
    const allApps = [...focusApps, ...restApps];

    for (const app of allApps) {
      try {
        await this.executeNativeCommand('unblockApp', {
          packageName: app.packageName,
        });
      } catch (error) {
        console.error(`Failed to unblock app ${app.packageName}:`, error);
      }
    }
  }

  /**
   * Execute platform-specific native commands
   */
  private async executeNativeCommand(
    command: string,
    params?: any,
  ): Promise<any> {
    if (Platform.OS === 'ios') {
      switch (command) {
        case 'requestScreenTimeAuth':
          return ScreenTime.requestScreenTimeAuth();
        case 'blockApp':
          return ScreenTime.blockApp(
            params.packageName,
            params.mode,
            params.duration,
          );
        case 'unblockApp':
          return ScreenTime.unblockApp(params.packageName);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } else {
      switch (command) {
        case 'requestUsageStatsPermission':
          return UsageStats.requestUsageStatsPermission();
        case 'blockApp':
          return UsageStats.blockApp(
            params.packageName,
            params.mode,
            params.duration,
          );
        case 'unblockApp':
          return UsageStats.unblockApp(params.packageName);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    }
  }
}

export const appBlocker = AppBlocker.getInstance();
