import {NativeModules} from 'react-native';

// Native module interfaces
interface ScreenTimeModule {
  requestScreenTimeAuth(): Promise<boolean>;
  blockApp(packageName: string, mode: string, duration?: number): Promise<void>;
  unblockApp(packageName: string): Promise<void>;
}

interface UsageStatsModule {
  requestUsageStatsPermission(): Promise<boolean>;
  blockApp(packageName: string, mode: string, duration?: number): Promise<void>;
  unblockApp(packageName: string): Promise<void>;
}

// Export native modules with type safety
export const ScreenTime = NativeModules.ScreenTime as ScreenTimeModule;
export const UsageStats = NativeModules.UsageStats as UsageStatsModule;

// These interfaces will be implemented in native code (Swift/Kotlin)
// The actual implementation will use platform-specific APIs:
// - iOS: ScreenTime API
// - Android: UsageStatsManager API
