import {Platform, NativeEventEmitter, DeviceEventEmitter} from 'react-native';
import {BlockingServiceInterface} from './platform/BlockingServiceInterface';
import {iOSAdapter, androidAdapter} from './platform/BlockingServiceAdapter';
import {appBlockingService, BlockMode, BlockedApp} from './AppBlockingService';

class PlatformBlockingService {
  private static instance: PlatformBlockingService;
  private initialized = false;
  private platformService: BlockingServiceInterface;

  private constructor() {
    // Get the appropriate service based on platform
    if (Platform.OS === 'ios') {
      this.platformService = iOSAdapter;
    } else if (Platform.OS === 'android') {
      this.platformService = androidAdapter;
    } else {
      // Default fallback - use a mock implementation
      this.platformService = this.createMockBlockingService();
    }
  }

  // Create a mock implementation for unsupported platforms
  private createMockBlockingService(): BlockingServiceInterface {
    return {
      initialize: async () => true,
      blockApp: async () => {},
      unblockApp: async () => {},
      isAppBlocked: async () => false,
      eventEmitter: DeviceEventEmitter, // Use DeviceEventEmitter instead of NativeEventEmitter
      setupListeners: () => {},
    };
  }

  static getInstance(): PlatformBlockingService {
    if (!PlatformBlockingService.instance) {
      PlatformBlockingService.instance = new PlatformBlockingService();
    }
    return PlatformBlockingService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      const hasPermission = await this.platformService.initialize();
      this.initialized = hasPermission;
      return hasPermission;
    } catch (error) {
      console.error('Failed to initialize platform blocking service:', error);
      return false;
    }
  }

  async enableFocusMode(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Platform blocking service not initialized');
    }

    const blockedApps = appBlockingService.getFocusBlockedApps();
    await this.blockApps(blockedApps);
  }

  async enableRestMode(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Platform blocking service not initialized');
    }

    const blockedApps = appBlockingService.getRestBlockedApps();
    await this.blockApps(blockedApps);
  }

  async disableBlocking(): Promise<void> {
    if (!this.initialized) return;

    const focusApps = appBlockingService.getFocusBlockedApps();
    const restApps = appBlockingService.getRestBlockedApps();
    const allApps = [...focusApps, ...restApps];

    for (const app of allApps) {
      try {
        await this.platformService.unblockApp(app.packageName);
      } catch (error) {
        console.error(`Failed to unblock app ${app.packageName}:`, error);
      }
    }
  }

  private async blockApps(apps: BlockedApp[]): Promise<void> {
    for (const app of apps) {
      try {
        await this.platformService.blockApp(
          app.packageName,
          app.mode,
          app.timerDuration,
        );
      } catch (error) {
        console.error(`Failed to block app ${app.packageName}:`, error);
        // Log breach attempt
        await appBlockingService.logBreach(
          app.packageName,
          Platform.OS === 'ios' ? 'FOCUS' : 'REST',
        );
      }
    }
  }

  async handleAppLaunchAttempt(packageName: string): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      const isBlocked = await this.platformService.isAppBlocked(packageName);
      if (isBlocked) {
        // Log breach attempt
        await appBlockingService.logBreach(
          packageName,
          Platform.OS === 'ios' ? 'FOCUS' : 'REST',
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Failed to check if app ${packageName} is blocked:`, error);
      return true;
    }
  }
}

export const platformBlockingService = PlatformBlockingService.getInstance();
