import {EventEmitter} from 'events';
import {Platform} from 'react-native';
import {databaseService} from '../storage/DatabaseService';

export type BlockMode = 'FULL' | 'REMINDER' | 'TIMER';
export type BlockedApp = {
  packageName: string; // Android package name or iOS bundle ID
  name: string;
  mode: BlockMode;
  timerDuration?: number; // in seconds, for TIMER mode
};

export class AppBlockingService extends EventEmitter {
  private static instance: AppBlockingService;
  private initialized = false;
  private focusBlockedApps: BlockedApp[] = [];
  private restBlockedApps: BlockedApp[] = [];

  private constructor() {
    super();
    // Don't initialize database here - wait for explicit initialization
  }

  static getInstance(): AppBlockingService {
    if (!AppBlockingService.instance) {
      AppBlockingService.instance = new AppBlockingService();
    }
    return AppBlockingService.instance;
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.initializeDatabase();
    }
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create tables for blocked apps and breach logs
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS blocked_apps (
          packageName TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          mode TEXT NOT NULL,
          timerDuration INTEGER,
          isForFocus BOOLEAN NOT NULL
        )
      `);

      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS breach_logs (
          id TEXT PRIMARY KEY,
          packageName TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          mode TEXT NOT NULL,
          FOREIGN KEY (packageName) REFERENCES blocked_apps (packageName)
        )
      `);

      // Load default blocked apps if none exist
      const [result] = await databaseService.executeSql(
        'SELECT COUNT(*) as count FROM blocked_apps',
      );

      if (result.rows.item(0).count === 0) {
        await this.setDefaultBlockedApps();
      }

      await this.loadBlockedApps();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize app blocking database:', error);
      throw error;
    }
  }

  private async setDefaultBlockedApps(): Promise<void> {
    const defaultApps = Platform.select({
      ios: [
        {packageName: 'com.twitter.ios', name: 'X'},
        {packageName: 'com.instagram.ios', name: 'Instagram'},
        {packageName: 'com.google.ios.youtube', name: 'YouTube'},
      ],
      android: [
        {packageName: 'com.twitter.android', name: 'X'},
        {packageName: 'com.instagram.android', name: 'Instagram'},
        {packageName: 'com.google.android.youtube', name: 'YouTube'},
      ],
      default: [],
    });

    for (const app of defaultApps) {
      await databaseService.executeSql(
        `INSERT INTO blocked_apps (packageName, name, mode, isForFocus)
         VALUES (?, ?, ?, ?)`,
        [app.packageName, app.name, 'FULL', true],
      );
    }
  }

  private async loadBlockedApps(): Promise<void> {
    const [focusResult] = await databaseService.executeSql(
      'SELECT * FROM blocked_apps WHERE isForFocus = 1',
    );
    const [restResult] = await databaseService.executeSql(
      'SELECT * FROM blocked_apps WHERE isForFocus = 0',
    );

    this.focusBlockedApps = [];
    this.restBlockedApps = [];

    for (let i = 0; i < focusResult.rows.length; i++) {
      this.focusBlockedApps.push(focusResult.rows.item(i));
    }
    for (let i = 0; i < restResult.rows.length; i++) {
      this.restBlockedApps.push(restResult.rows.item(i));
    }
  }

  async setBlockedApps(apps: BlockedApp[], isForFocus: boolean): Promise<void> {
    try {
      // Ensure database is initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Clear existing apps
      await databaseService.executeSql(
        'DELETE FROM blocked_apps WHERE isForFocus = ?',
        [isForFocus ? 1 : 0],
      );

      // Insert new apps
      for (const app of apps) {
        await databaseService.executeSql(
          `INSERT INTO blocked_apps (packageName, name, mode, timerDuration, isForFocus)
           VALUES (?, ?, ?, ?, ?)`,
          [
            app.packageName,
            app.name,
            app.mode,
            app.timerDuration || null,
            isForFocus ? 1 : 0,
          ],
        );
      }

      await this.loadBlockedApps();
      this.emit('blockedAppsChanged');
    } catch (error) {
      console.error('Error setting blocked apps:', error);
      throw error;
    }
  }

  async logBreach(packageName: string, mode: 'FOCUS' | 'REST'): Promise<void> {
    // Ensure database is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    await databaseService.executeSql(
      `INSERT INTO breach_logs (id, packageName, timestamp, mode)
       VALUES (?, ?, ?, ?)`,
      [Date.now().toString(), packageName, new Date().toISOString(), mode],
    );
    this.emit('breachLogged', {packageName, mode});
  }

  async getBreachCount(since: Date): Promise<number> {
    // Ensure database is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    const [result] = await databaseService.executeSql(
      `SELECT COUNT(*) as count FROM breach_logs
       WHERE timestamp >= ?`,
      [since.toISOString()],
    );
    return result.rows.item(0).count;
  }

  getFocusBlockedApps(): BlockedApp[] {
    return [...this.focusBlockedApps];
  }

  getRestBlockedApps(): BlockedApp[] {
    return [...this.restBlockedApps];
  }
}

export const appBlockingService = AppBlockingService.getInstance();
