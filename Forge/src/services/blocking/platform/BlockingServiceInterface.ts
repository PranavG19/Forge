import {NativeEventEmitter} from 'react-native';

export interface BlockingServiceInterface {
  // Core methods required by both platforms
  initialize(): Promise<boolean>;
  blockApp(packageName: string, mode: string, duration?: number): Promise<void>;
  unblockApp(packageName: string): Promise<void>;
  isAppBlocked(packageName: string): Promise<boolean>;

  // Platform-specific properties
  readonly eventEmitter: NativeEventEmitter;
  readonly hasPermission?: boolean;
  readonly authorized?: boolean;

  // Platform-specific methods
  setupListeners(): void;
  getUsageStats?(startTime: number, endTime: number): Promise<any>;
}

// Helper type for Platform.select
export type PlatformBlockingService = BlockingServiceInterface & {
  getInstance(): BlockingServiceInterface;
};
