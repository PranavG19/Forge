import {EventEmitter} from 'events';
import {databaseService} from '../storage/DatabaseService';

export interface ExperienceStats {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  weeklyExp: number;
}

export class ExperienceService extends EventEmitter {
  private static instance: ExperienceService;
  private initialized = false;

  // Experience points configuration
  private static readonly EXP_PER_FOCUS_HOUR = 10;
  private static readonly EXP_PER_TASK = 20;
  private static readonly NORTH_STAR_MULTIPLIER = 2;
  private static readonly EXP_PER_LEVEL = 500;

  private constructor() {
    super();
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): ExperienceService {
    if (!ExperienceService.instance) {
      ExperienceService.instance = new ExperienceService();
    }
    return ExperienceService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS experience (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          totalExp INTEGER NOT NULL DEFAULT 0,
          weeklyExp INTEGER NOT NULL DEFAULT 0,
          lastResetDate TEXT
        )
      `);

      // Initialize experience record if it doesn't exist
      await databaseService.executeSql(`
        INSERT OR IGNORE INTO experience (id, totalExp, weeklyExp, lastResetDate)
        VALUES (1, 0, 0, datetime('now'))
      `);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize experience database:', error);
      throw error;
    }
  }

  async addFocusTimeExp(minutes: number): Promise<void> {
    await this.initializeDatabase();
    const hours = minutes / 60;
    const exp = Math.floor(hours * ExperienceService.EXP_PER_FOCUS_HOUR);
    await this.addExp(exp);
  }

  async addTaskCompletionExp(isNorthStar: boolean): Promise<void> {
    await this.initializeDatabase();
    const baseExp = ExperienceService.EXP_PER_TASK;
    const exp = isNorthStar
      ? baseExp * ExperienceService.NORTH_STAR_MULTIPLIER
      : baseExp;
    await this.addExp(exp);
  }

  private async addExp(amount: number): Promise<void> {
    try {
      await databaseService.executeSql(
        `
        UPDATE experience
        SET totalExp = totalExp + ?,
            weeklyExp = weeklyExp + ?
        WHERE id = 1
      `,
        [amount, amount],
      );

      const stats = await this.getStats();
      this.emit('experienceGained', {amount, stats});
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  async getStats(): Promise<ExperienceStats> {
    await this.initializeDatabase();

    try {
      const [result] = await databaseService.executeSql(
        'SELECT totalExp, weeklyExp FROM experience WHERE id = 1',
      );

      const {totalExp, weeklyExp} = result.rows.item(0);
      const level = Math.floor(totalExp / ExperienceService.EXP_PER_LEVEL) + 1;
      const currentExp = totalExp % ExperienceService.EXP_PER_LEVEL;

      return {
        level,
        currentExp,
        nextLevelExp: ExperienceService.EXP_PER_LEVEL,
        weeklyExp,
      };
    } catch (error) {
      console.error('Error getting experience stats:', error);
      throw error;
    }
  }

  async resetWeeklyExp(): Promise<void> {
    await this.initializeDatabase();

    try {
      await databaseService.executeSql(`
        UPDATE experience
        SET weeklyExp = 0,
            lastResetDate = datetime('now')
        WHERE id = 1
      `);

      const stats = await this.getStats();
      this.emit('weeklyExpReset', stats);
    } catch (error) {
      console.error('Error resetting weekly experience:', error);
      throw error;
    }
  }

  async checkAndResetWeeklyExp(): Promise<void> {
    await this.initializeDatabase();

    try {
      const [result] = await databaseService.executeSql(
        'SELECT lastResetDate FROM experience WHERE id = 1',
      );

      const lastReset = new Date(result.rows.item(0).lastResetDate);
      const now = new Date();
      const daysSinceReset = Math.floor(
        (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceReset >= 7) {
        await this.resetWeeklyExp();
      }
    } catch (error) {
      console.error('Error checking weekly experience reset:', error);
      throw error;
    }
  }
}

export const experienceService = ExperienceService.getInstance();
