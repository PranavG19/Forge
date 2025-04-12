import {EventEmitter} from 'events';
import {databaseService} from '../storage/DatabaseService';
import {v4 as uuidv4} from 'uuid';

export interface WeeklyStats {
  focusTime: number;
  restTime: number;
  tasksCompleted: number;
  northStarTasksCompleted: number;
  currentExp: number;
  maxExp: number;
  level: number;
}

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
        CREATE TABLE IF NOT EXISTS experience_logs (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          value INTEGER NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);

      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS time_logs (
          id TEXT PRIMARY KEY,
          mode TEXT NOT NULL,
          duration INTEGER NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize experience database:', error);
      throw error;
    }
  }

  async logExperience(
    type: 'focus' | 'task' | 'northStar',
    value: number,
  ): Promise<void> {
    await databaseService.executeSql(
      `INSERT INTO experience_logs (id, type, value, timestamp)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), type, value, new Date().toISOString()],
    );
    this.emit('experienceLogged', {type, value});
  }

  async logTime(mode: 'focus' | 'rest', duration: number): Promise<void> {
    await databaseService.executeSql(
      `INSERT INTO time_logs (id, mode, duration, timestamp)
       VALUES (?, ?, ?, ?)`,
      [uuidv4(), mode, duration, new Date().toISOString()],
    );
    this.emit('timeLogged', {mode, duration});
  }

  async getWeeklyStats(): Promise<WeeklyStats> {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

    // Get time logs
    const [timeResult] = await databaseService.executeSql(
      `SELECT
         SUM(CASE WHEN mode = 'focus' THEN duration ELSE 0 END) as focusTime,
         SUM(CASE WHEN mode = 'rest' THEN duration ELSE 0 END) as restTime
       FROM time_logs
       WHERE timestamp >= ?`,
      [weekStart.toISOString()],
    );

    // Get task completion counts
    const [taskResult] = await databaseService.executeSql(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN type = 'northStar' THEN 1 ELSE 0 END) as northStar
       FROM experience_logs
       WHERE type IN ('task', 'northStar')
       AND timestamp >= ?`,
      [weekStart.toISOString()],
    );

    // Calculate experience and level
    const [expResult] = await databaseService.executeSql(
      `SELECT SUM(value) as total
       FROM experience_logs
       WHERE timestamp >= ?`,
      [weekStart.toISOString()],
    );

    const totalExp = expResult.rows.item(0).total || 0;
    const level = Math.floor(totalExp / 500) + 1;
    const currentExp = totalExp % 500;

    return {
      focusTime: timeResult.rows.item(0).focusTime || 0,
      restTime: timeResult.rows.item(0).restTime || 0,
      tasksCompleted: taskResult.rows.item(0).total || 0,
      northStarTasksCompleted: taskResult.rows.item(0).northStar || 0,
      currentExp,
      maxExp: 500,
      level,
    };
  }

  async resetWeeklyExp(): Promise<void> {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    await databaseService.executeSql(
      `DELETE FROM experience_logs WHERE timestamp < ?`,
      [weekStart.toISOString()],
    );
    this.emit('experienceReset');
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
