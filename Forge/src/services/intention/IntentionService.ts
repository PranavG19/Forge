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
    // Don't initialize in constructor to avoid circular dependencies
    // Initialization will happen on first use
  }

  static getInstance(): IntentionService {
    if (!IntentionService.instance) {
      IntentionService.instance = new IntentionService();
    }
    return IntentionService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) {
      console.log('Intention service already initialized');
      return;
    }

    console.log('Initializing intention service...');

    try {
      // We don't need to create tables here anymore since DatabaseService handles it
      // Just initialize weekly reset day if not set
      try {
        console.log('Checking weekly reset day...');
        const resetDay = await this.getWeeklyResetDay();
        if (!resetDay) {
          console.log('Setting default weekly reset day to SUNDAY');
          await this.setWeeklyResetDay('SUNDAY');
        }
      } catch (resetDayError) {
        console.error('Error setting weekly reset day:', resetDayError);
        // Continue anyway
      }

      this.initialized = true;
      console.log('Intention service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize intention service:', error);
      // Don't throw - mark as initialized anyway to prevent repeated attempts
      this.initialized = true;
    }
  }

  async setDailyNorthStar(title: string): Promise<Intention> {
    try {
      console.log('IntentionService: Setting daily North Star:', title);
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

      console.log('IntentionService: Daily North Star set successfully');
      this.emit('dailyNorthStarSet', intention);
      return intention;
    } catch (error) {
      console.error('IntentionService: Error setting daily North Star:', error);
      throw error; // Re-throw to allow UI to show error message
    }
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
    try {
      console.log('IntentionService: Getting daily North Star');
      const today = new Date().toISOString().split('T')[0];
      console.log('IntentionService: Today is', today);

      // Simplify the query to avoid using date() function
      const [result] = await databaseService.executeSql(
        `SELECT * FROM intentions 
         WHERE type = 'daily' 
         AND isNorthStar = 1 
         AND createdAt LIKE ?
         ORDER BY createdAt DESC 
         LIMIT 1`,
        [`${today}%`], // Use LIKE with % wildcard to match the date part
      );

      const hasNorthStar = result.rows.length > 0;
      console.log('IntentionService: North Star found?', hasNorthStar);

      return hasNorthStar ? result.rows.item(0) : null;
    } catch (error) {
      console.error('IntentionService: Error getting daily North Star:', error);
      return null; // Return null instead of throwing to prevent crashes
    }
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
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStartDate = this.getWeekStartDate(new Date()).toISOString();

      // Fix the query to avoid using date() function
      const [dailyResult] = await databaseService.executeSql(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completedAt IS NOT NULL THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN isNorthStar = 1 THEN 1 ELSE 0 END) as northStar
         FROM intentions 
         WHERE type = 'daily' AND createdAt LIKE ?`,
        [`${today}%`],
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
    } catch (error) {
      console.error('Error getting intention stats:', error);
      return {
        dailyNorthStarSet: false,
        weeklyIntentionsSet: false,
        weeklyNorthStarSet: false,
        completedDailyCount: 0,
        completedWeeklyCount: 0,
        totalDailyCount: 0,
        totalWeeklyCount: 0,
      };
    }
  }

  async setWeeklyResetDay(day: string): Promise<void> {
    await databaseService.executeSql(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
      ['weeklyResetDay', day],
    );
  }

  async getWeeklyResetDay(): Promise<string> {
    try {
      const [result] = await databaseService.executeSql(
        `SELECT value FROM settings WHERE key = ?`,
        ['weeklyResetDay'],
      );
      return result.rows.length > 0 ? result.rows.item(0).value : 'SUNDAY';
    } catch (error) {
      console.error('Error getting weekly reset day:', error);
      return 'SUNDAY'; // Default to Sunday on error
    }
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
