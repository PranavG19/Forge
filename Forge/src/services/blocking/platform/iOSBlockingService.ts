import {
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
} from 'react-native';
import {BlockingServiceInterface} from './BlockingServiceInterface';

// This would be implemented as a native module in Swift
const {ScreenTimeManager} = NativeModules;

interface ScreenTimeManagerType {
  requestAuthorization(): Promise<boolean>;
  blockApp(bundleId: string, mode: string, duration?: number): Promise<void>;
  unblockApp(bundleId: string): Promise<void>;
  isAppBlocked(bundleId: string): Promise<boolean>;
}

class IOSBlockingService implements BlockingServiceInterface {
  private static instance: IOSBlockingService;
  private _authorized = false;
  private _eventEmitter: NativeEventEmitter;

  private constructor() {
    // Check if ScreenTimeManager exists before creating NativeEventEmitter
    if (ScreenTimeManager) {
      this._eventEmitter = new NativeEventEmitter(ScreenTimeManager);
    } else {
      // Use DeviceEventEmitter as a fallback if ScreenTimeManager is not available
      console.warn(
        'ScreenTimeManager native module not found, using DeviceEventEmitter as fallback',
      );
      this._eventEmitter = DeviceEventEmitter as any;
    }
    this.setupListeners();
  }

  static getInstance(): IOSBlockingService {
    if (!IOSBlockingService.instance) {
      IOSBlockingService.instance = new IOSBlockingService();
    }
    return IOSBlockingService.instance;
  }

  setupListeners(): void {
    this.eventEmitter.addListener(
      'appBlockingStateChanged',
      ({bundleId, isBlocked}) => {
        console.log(`App ${bundleId} blocking state changed: ${isBlocked}`);
      },
    );

    this.eventEmitter.addListener('appBlockingError', ({bundleId, error}) => {
      console.error(`App blocking error for ${bundleId}:`, error);
    });
  }

  // Public getters
  get eventEmitter(): NativeEventEmitter {
    return this._eventEmitter;
  }

  get authorized(): boolean {
    return this._authorized;
  }

  async initialize(): Promise<boolean> {
    try {
      this._authorized = await ScreenTimeManager.requestAuthorization();
      return this._authorized;
    } catch (error) {
      console.error('Failed to initialize iOS blocking service:', error);
      return false;
    }
  }

  async blockApp(
    bundleId: string,
    mode: string,
    duration?: number,
  ): Promise<void> {
    if (!this.authorized) {
      throw new Error('Screen Time authorization not granted');
    }

    try {
      await ScreenTimeManager.blockApp(bundleId, mode, duration);
    } catch (error) {
      console.error(`Failed to block app ${bundleId}:`, error);
      throw error;
    }
  }

  async unblockApp(bundleId: string): Promise<void> {
    if (!this.authorized) {
      throw new Error('Screen Time authorization not granted');
    }

    try {
      await ScreenTimeManager.unblockApp(bundleId);
    } catch (error) {
      console.error(`Failed to unblock app ${bundleId}:`, error);
      throw error;
    }
  }

  async isAppBlocked(bundleId: string): Promise<boolean> {
    if (!this.authorized) {
      return false;
    }

    try {
      return await ScreenTimeManager.isAppBlocked(bundleId);
    } catch (error) {
      console.error(`Failed to check if app ${bundleId} is blocked:`, error);
      return false;
    }
  }
}

export const iOSBlockingService = IOSBlockingService.getInstance();
