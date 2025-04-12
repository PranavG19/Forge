import {NativeEventEmitter} from 'react-native';
import {BlockingServiceInterface} from './BlockingServiceInterface';
import {iOSBlockingService} from './iOSBlockingService';
import {androidBlockingService} from './AndroidBlockingService';

/**
 * iOS-specific adapter to ensure consistent interface
 */
export class IOSBlockingAdapter implements BlockingServiceInterface {
  private service = iOSBlockingService;
  readonly eventEmitter: NativeEventEmitter;
  readonly authorized: boolean;

  constructor() {
    // Access private properties safely
    this.eventEmitter = (this.service as any)._eventEmitter;
    this.authorized = (this.service as any)._authorized;
  }

  async initialize(): Promise<boolean> {
    return this.service.initialize();
  }

  async blockApp(
    packageName: string,
    mode: string,
    duration?: number,
  ): Promise<void> {
    return this.service.blockApp(packageName, mode, duration);
  }

  async unblockApp(packageName: string): Promise<void> {
    return this.service.unblockApp(packageName);
  }

  async isAppBlocked(packageName: string): Promise<boolean> {
    return this.service.isAppBlocked(packageName);
  }

  setupListeners(): void {
    // Already called in the constructor of the service
  }
}

/**
 * Android-specific adapter to ensure consistent interface
 */
export class AndroidBlockingAdapter implements BlockingServiceInterface {
  private service = androidBlockingService;
  readonly eventEmitter: NativeEventEmitter;
  readonly hasPermission: boolean;

  constructor() {
    // Access private properties safely
    this.eventEmitter = new NativeEventEmitter();
    this.hasPermission = (this.service as any).hasPermission || false;
  }

  async initialize(): Promise<boolean> {
    return this.service.initialize();
  }

  async blockApp(
    packageName: string,
    mode: string,
    duration?: number,
  ): Promise<void> {
    return this.service.blockApp(packageName, mode, duration);
  }

  async unblockApp(packageName: string): Promise<void> {
    return this.service.unblockApp(packageName);
  }

  async isAppBlocked(packageName: string): Promise<boolean> {
    return this.service.isAppBlocked(packageName);
  }

  setupListeners(): void {
    // Already called in the constructor of the service
  }

  async getUsageStats(startTime: number, endTime: number): Promise<any> {
    return this.service.getUsageStats(startTime, endTime);
  }
}

// Create and export adapter instances
export const iOSAdapter = new IOSBlockingAdapter();
export const androidAdapter = new AndroidBlockingAdapter();
