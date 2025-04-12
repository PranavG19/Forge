import {databaseService} from '../storage/DatabaseService';
import {v4 as uuidv4} from 'uuid';

export interface AnalyticsEvent {
  id: string;
  name: string;
  params?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;

  private constructor() {
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          params TEXT,
          timestamp TEXT NOT NULL
        )
      `);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics database:', error);
      throw error;
    }
  }

  async logEvent(name: string, params?: Record<string, any>): Promise<void> {
    const event: AnalyticsEvent = {
      id: uuidv4(),
      name,
      params,
      timestamp: new Date().toISOString(),
    };

    // Store locally
    await databaseService.executeSql(
      `INSERT INTO analytics_events (id, name, params, timestamp)
       VALUES (?, ?, ?, ?)`,
      [event.id, event.name, JSON.stringify(params), event.timestamp],
    );
  }

  // Method to export analytics data (for future cloud sync)
  async exportEvents(
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsEvent[]> {
    const [result] = await databaseService.executeSql(
      `SELECT * FROM analytics_events
       WHERE timestamp >= ? AND timestamp <= ?
       ORDER BY timestamp ASC`,
      [startDate.toISOString(), endDate.toISOString()],
    );

    const events: AnalyticsEvent[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      events.push({
        id: row.id,
        name: row.name,
        params: JSON.parse(row.params || '{}'),
        timestamp: row.timestamp,
      });
    }
    return events;
  }

  // Success metric tracking methods
  async logAppOpen(): Promise<void> {
    await this.logEvent('app_open');
  }

  async logNorthStarSet(): Promise<void> {
    await this.logEvent('north_star_set');
  }

  async logFocusTime(minutes: number): Promise<void> {
    await this.logEvent('focus_time', {minutes});
  }

  async logRetention(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [result] = await databaseService.executeSql(
      `SELECT COUNT(*) as count 
       FROM analytics_events 
       WHERE name = 'app_open' 
       AND timestamp <= ?`,
      [thirtyDaysAgo.toISOString()],
    );

    const hasOldEvents = result.rows.item(0).count > 0;
    if (hasOldEvents) {
      await this.logEvent('retention_30_days');
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
