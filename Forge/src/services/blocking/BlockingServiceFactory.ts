import {Platform} from 'react-native';
import {BlockingServiceInterface} from './platform/BlockingServiceInterface';
import {iOSBlockingService} from './platform/iOSBlockingService';
import {androidBlockingService} from './platform/AndroidBlockingService';

class BlockingServiceFactory {
  private static instance: BlockingServiceFactory;
  private service: BlockingServiceInterface;

  private constructor() {
    // Create a wrapper that implements BlockingServiceInterface
    this.service = {
      eventEmitter: Platform.select({
        ios: iOSBlockingService.eventEmitter,
        android: androidBlockingService.eventEmitter,
      })!,

      async initialize(): Promise<boolean> {
        return Platform.select({
          ios: () => iOSBlockingService.initialize(),
          android: () => androidBlockingService.initialize(),
        })!();
      },

      async blockApp(
        packageName: string,
        mode: string,
        duration?: number,
      ): Promise<void> {
        return Platform.select({
          ios: () => iOSBlockingService.blockApp(packageName, mode, duration),
          android: () =>
            androidBlockingService.blockApp(packageName, mode, duration),
        })!();
      },

      async unblockApp(packageName: string): Promise<void> {
        return Platform.select({
          ios: () => iOSBlockingService.unblockApp(packageName),
          android: () => androidBlockingService.unblockApp(packageName),
        })!();
      },

      async isAppBlocked(packageName: string): Promise<boolean> {
        return Platform.select({
          ios: () => iOSBlockingService.isAppBlocked(packageName),
          android: () => androidBlockingService.isAppBlocked(packageName),
        })!();
      },

      setupListeners(): void {
        Platform.select({
          ios: () => iOSBlockingService.setupListeners(),
          android: () => androidBlockingService.setupListeners(),
        })!();
      },

      // Optional platform-specific methods
      getUsageStats:
        Platform.OS === 'android'
          ? androidBlockingService.getUsageStats.bind(androidBlockingService)
          : undefined,

      // Platform-specific properties
      authorized:
        Platform.OS === 'ios' ? iOSBlockingService.authorized : undefined,
      hasPermission:
        Platform.OS === 'android'
          ? androidBlockingService.hasPermission
          : undefined,
    };
  }

  static getInstance(): BlockingServiceFactory {
    if (!BlockingServiceFactory.instance) {
      BlockingServiceFactory.instance = new BlockingServiceFactory();
    }
    return BlockingServiceFactory.instance;
  }

  getService(): BlockingServiceInterface {
    return this.service;
  }
}

export const blockingServiceFactory = BlockingServiceFactory.getInstance();
export const blockingService = blockingServiceFactory.getService();
