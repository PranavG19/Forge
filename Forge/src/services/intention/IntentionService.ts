import {EventEmitter} from 'events';
import {databaseService} from '../storage/DatabaseService';
import {v4 as uuidv4} from 'uuid';

export interface Intention {
  id: string;
  title: string;
  isNorthStar: boolean;
  type: 'daily' | 'weekly';
  createdAt: string;
  completedAt?: string;
  weekStartDate?: string; // For weekly intentions
}

export interface IntentionStats {
  dailyNorthStarSet: boolean;
  weeklyIntentionsSet: boolean;
  weeklyNorthStarSet: boolean;
  completedDailyCount: number;
  completedWeeklyCount: number;
  totalDailyCount: number;
  totalWeeklyCount: number;
}

export class IntentionService extends EventEmitter {
  private static instance: IntentionService;
  private initialized = false;

  private constructor() {
    super();
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): IntentionService {
    if (!IntentionService.instance) {
      IntentionService.instance = new IntentionService();
    }
    return IntentionService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS intentions (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          isNorthStar BOOLEAN NOT NULL,
          type TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          completedAt TEXT,
          weekStartDate TEXT
        )
      `);

      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Initialize weekly reset day if not set
      const resetDay = await this.getWeeklyResetDay();
      if (!resetDay) {
        await this.setWeeklyResetDay('SUNDAY');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize intention database:', error);
      throw error;
    }
  }

  async setDailyNorthStar(title: string): Promise<Intention> {
    const now = new Date().toISOString();
    const intention: Intention = {
      id: uuidv4(),
      title,
      isNorthStar: true,
      type: 'daily',
      createdAt: now,
    };

    await databaseService.executeSql(
      `INSERT INTO intentions (id, title, isNorthStar, type, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [intention.id, intention.title, 1, intention.type, intention.createdAt],
    );

    this.emit('dailyNorthStarSet', intention);
    return intention;
  }

  async setWeeklyIntentions(
    intentions: {title: string; isNorthStar: boolean}[],
  ): Promise<Intention[]> {
    if (intentions.length !== 3) {
      throw new Error('Must provide exactly 3 weekly intentions');
    }

    if (!intentions.some(i => i.isNorthStar)) {
      throw new Error('One intention must be marked as North Star');
    }

    if (intentions.filter(i => i.isNorthStar).length > 1) {
      throw new Error('Only one intention can be North Star');
    }

    const now = new Date();
    const weekStartDate = this.getWeekStartDate(now);
    const createdAt = now.toISOString();

    const createdIntentions: Intention[] = [];

    for (const {title, isNorthStar} of intentions) {
      const intention: Intention = {
        id: uuidv4(),
        title,
        isNorthStar,
        type: 'weekly',
        createdAt,
        weekStartDate: weekStartDate.toISOString(),
      };

      await databaseService.executeSql(
        `INSERT INTO intentions (id, title, isNorthStar, type, createdAt, weekStartDate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          intention.id,
          intention.title,
          isNorthStar ? 1 : 0,
          intention.type,
          intention.createdAt,
          intention.weekStartDate,
        ],
      );

      createdIntentions.push(intention);
    }

    this.emit('weeklyIntentionsSet', createdIntentions);
    return createdIntentions;
  }

  async getDailyNorthStar(): Promise<Intention | null> {
    const today = new Date().toISOString().split('T')[0];
    const [result] = await databaseService.executeSql(
      `SELECT * FROM intentions 
       WHERE type = 'daily' 
       AND isNorthStar = 1 
       AND date(createdAt) = ?
       ORDER BY createdAt DESC 
       LIMIT 1`,
      [today],
    );

    return result.rows.length > 0 ? result.rows.item(0) : null;
  }

  async getWeeklyIntentions(): Promise<Intention[]> {
    const weekStartDate = this.getWeekStartDate(new Date()).toISOString();
    const [result] = await databaseService.executeSql(
      `SELECT * FROM intentions 
       WHERE type = 'weekly' 
       AND weekStartDate = ?
       ORDER BY isNorthStar DESC`,
      [weekStartDate],
    );

    const intentions: Intention[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      intentions.push(result.rows.item(i));
    }
    return intentions;
  }

  async completeIntention(id: string): Promise<void> {
    const completedAt = new Date().toISOString();
    await databaseService.executeSql(
      `UPDATE intentions SET completedAt = ? WHERE id = ?`,
      [completedAt, id],
    );
    this.emit('intentionCompleted', id);
  }

  async getStats(): Promise<IntentionStats> {
    const today = new Date().toISOString().split('T')[0];
    const weekStartDate = this.getWeekStartDate(new Date()).toISOString();

    const [dailyResult] = await databaseService.executeSql(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completedAt IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN isNorthStar = 1 THEN 1 ELSE 0 END) as northStar
       FROM intentions 
       WHERE type = 'daily' AND date(createdAt) = ?`,
      [today],
    );

    const [weeklyResult] = await databaseService.executeSql(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completedAt IS NOT NULL THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN isNorthStar = 1 THEN 1 ELSE 0 END) as northStar
       FROM intentions 
       WHERE type = 'weekly' AND weekStartDate = ?`,
      [weekStartDate],
    );

    const daily = dailyResult.rows.item(0);
    const weekly = weeklyResult.rows.item(0);

    return {
      dailyNorthStarSet: daily.northStar > 0,
      weeklyIntentionsSet: weekly.total === 3,
      weeklyNorthStarSet: weekly.northStar > 0,
      completedDailyCount: daily.completed,
      completedWeeklyCount: weekly.completed,
      totalDailyCount: daily.total,
      totalWeeklyCount: weekly.total,
    };
  }

  async setWeeklyResetDay(day: string): Promise<void> {
    await databaseService.executeSql(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      ['weeklyResetDay', day],
    );
  }

  async getWeeklyResetDay(): Promise<string> {
    const [result] = await databaseService.executeSql(
      `SELECT value FROM settings WHERE key = ?`,
      ['weeklyResetDay'],
    );
    return result.rows.length > 0 ? result.rows.item(0).value : 'SUNDAY';
  }

  private getWeekStartDate(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }
}

export const intentionService = IntentionService.getInstance();
