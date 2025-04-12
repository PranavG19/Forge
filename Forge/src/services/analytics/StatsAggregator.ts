import {databaseService} from '../storage/DatabaseService';
import {analyticsService} from './AnalyticsService';
import {appBlockingService} from '../blocking/AppBlockingService';
import {experienceService} from '../experience/ExperienceService';
import {taskService} from '../task/TaskService';
import {TaskStatus, TaskPriority} from '../../models/Task';

export interface DailyStats {
  date: string;
  focusTime: number; // in minutes
  restTime: number; // in minutes
  breachCount: number;
  tasksCompleted: number;
  northStarTasksCompleted: number;
  expGained: number;
}

export interface WeeklyStats {
  startDate: string;
  endDate: string;
  totalFocusTime: number; // in minutes
  totalRestTime: number; // in minutes
  totalBreachCount: number;
  totalTasksCompleted: number;
  totalNorthStarTasksCompleted: number;
  totalExpGained: number;
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  startDate: string;
  endDate: string;
  weeklyStats: WeeklyStats[];
  totalFocusTime: number; // in minutes
  totalRestTime: number; // in minutes
  averageDailyFocusTime: number; // in minutes
  mostProductiveDay: string;
  leastProductiveDay: string;
}

class StatsAggregator {
  private static instance: StatsAggregator;
  private initialized = false;

  private constructor() {
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): StatsAggregator {
    if (!StatsAggregator.instance) {
      StatsAggregator.instance = new StatsAggregator();
    }
    return StatsAggregator.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS daily_stats (
          date TEXT PRIMARY KEY,
          focus_time INTEGER NOT NULL DEFAULT 0,
          rest_time INTEGER NOT NULL DEFAULT 0,
          breach_count INTEGER NOT NULL DEFAULT 0,
          tasks_completed INTEGER NOT NULL DEFAULT 0,
          north_star_tasks_completed INTEGER NOT NULL DEFAULT 0,
          exp_gained INTEGER NOT NULL DEFAULT 0
        )
      `);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize stats database:', error);
      throw error;
    }
  }

  /**
   * Get stats for a specific day
   */
  async getDailyStats(date: Date): Promise<DailyStats> {
    await this.initializeDatabase();

    const dateStr = date.toISOString().split('T')[0];

    // Check if we have stats for this day
    const [result] = await databaseService.executeSql(
      'SELECT * FROM daily_stats WHERE date = ?',
      [dateStr],
    );

    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return {
        date: row.date,
        focusTime: row.focus_time,
        restTime: row.rest_time,
        breachCount: row.breach_count,
        tasksCompleted: row.tasks_completed,
        northStarTasksCompleted: row.north_star_tasks_completed,
        expGained: row.exp_gained,
      };
    }

    // If no stats exist, generate them from raw data
    return this.generateDailyStats(date);
  }

  /**
   * Generate stats for a specific day from raw data
   */
  private async generateDailyStats(date: Date): Promise<DailyStats> {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(dateStr);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // Get focus and rest time from analytics events
    const events = await analyticsService.exportEvents(startOfDay, endOfDay);

    const focusTimeEvents = events.filter(e => e.name === 'focus_time');
    const focusTime = focusTimeEvents.reduce(
      (sum, e) => sum + (e.params?.minutes || 0),
      0,
    );

    const restTimeEvents = events.filter(e => e.name === 'rest_time');
    const restTime = restTimeEvents.reduce(
      (sum, e) => sum + (e.params?.minutes || 0),
      0,
    );

    // Get breach count - using the start date only since the method doesn't support date ranges
    const breachCount = await appBlockingService.getBreachCount(startOfDay);

    // Get task completion stats by querying completed tasks directly
    // Since getCompletedTasksInRange doesn't exist, we'll implement the logic here
    const [taskResult] = await databaseService.executeSql(
      `SELECT * FROM tasks
       WHERE status = ?
       AND updatedAt >= ?
       AND updatedAt <= ?`,
      [TaskStatus.COMPLETED, startOfDay.toISOString(), endOfDay.toISOString()],
    );

    const completedTasks = [];
    for (let i = 0; i < taskResult.rows.length; i++) {
      completedTasks.push(taskResult.rows.item(i));
    }

    const tasksCompleted = completedTasks.length;
    const northStarTasksCompleted = completedTasks.filter(
      task => task.priority === TaskPriority.NORTH_STAR,
    ).length;

    // Get experience gained from analytics events
    const expEvents = events.filter(
      e =>
        e.name === 'experienceGained' ||
        e.name === 'focus_time' ||
        e.name === 'task_completed',
    );

    const expGained = expEvents.reduce(
      (sum, e) => sum + (e.params?.amount || 0),
      0,
    );

    // Save the stats
    const stats: DailyStats = {
      date: dateStr,
      focusTime,
      restTime,
      breachCount,
      tasksCompleted,
      northStarTasksCompleted,
      expGained,
    };

    await this.saveDailyStats(stats);

    return stats;
  }

  /**
   * Save daily stats to the database
   */
  private async saveDailyStats(stats: DailyStats): Promise<void> {
    await databaseService.executeSql(
      `INSERT OR REPLACE INTO daily_stats 
       (date, focus_time, rest_time, breach_count, tasks_completed, north_star_tasks_completed, exp_gained)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stats.date,
        stats.focusTime,
        stats.restTime,
        stats.breachCount,
        stats.tasksCompleted,
        stats.northStarTasksCompleted,
        stats.expGained,
      ],
    );
  }

  /**
   * Get stats for a specific week
   */
  async getWeeklyStats(startDate: Date): Promise<WeeklyStats> {
    // Ensure startDate is the beginning of the week (Sunday)
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const dailyStats: DailyStats[] = [];
    let totalFocusTime = 0;
    let totalRestTime = 0;
    let totalBreachCount = 0;
    let totalTasksCompleted = 0;
    let totalNorthStarTasksCompleted = 0;
    let totalExpGained = 0;

    // Get stats for each day in the week
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const stats = await this.getDailyStats(currentDate);
      dailyStats.push(stats);

      totalFocusTime += stats.focusTime;
      totalRestTime += stats.restTime;
      totalBreachCount += stats.breachCount;
      totalTasksCompleted += stats.tasksCompleted;
      totalNorthStarTasksCompleted += stats.northStarTasksCompleted;
      totalExpGained += stats.expGained;

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalFocusTime,
      totalRestTime,
      totalBreachCount,
      totalTasksCompleted,
      totalNorthStarTasksCompleted,
      totalExpGained,
      dailyStats,
    };
  }

  /**
   * Get stats for the current week
   */
  async getCurrentWeekStats(): Promise<WeeklyStats> {
    const today = new Date();
    return this.getWeeklyStats(today);
  }

  /**
   * Get stats for a specific month
   */
  async getMonthlyStats(month: number, year: number): Promise<MonthlyStats> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Get weekly stats for each week that overlaps with the month
    const weeklyStats: WeeklyStats[] = [];
    let currentWeekStart = new Date(startDate);
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay(),
    );

    while (currentWeekStart <= endDate) {
      const weekStats = await this.getWeeklyStats(currentWeekStart);
      weeklyStats.push(weekStats);

      // Move to next week
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    // Calculate monthly totals
    const totalFocusTime = weeklyStats.reduce(
      (sum, week) => sum + week.totalFocusTime,
      0,
    );

    const totalRestTime = weeklyStats.reduce(
      (sum, week) => sum + week.totalRestTime,
      0,
    );

    // Calculate average daily focus time
    const daysInMonth = endDate.getDate();
    const averageDailyFocusTime = totalFocusTime / daysInMonth;

    // Find most and least productive days
    const allDailyStats = weeklyStats
      .flatMap(week => week.dailyStats)
      .filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= startDate && dayDate <= endDate;
      });

    allDailyStats.sort((a, b) => b.focusTime - a.focusTime);

    const mostProductiveDay =
      allDailyStats.length > 0 ? allDailyStats[0].date : '';
    const leastProductiveDay =
      allDailyStats.length > 0
        ? allDailyStats[allDailyStats.length - 1].date
        : '';

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      weeklyStats,
      totalFocusTime,
      totalRestTime,
      averageDailyFocusTime,
      mostProductiveDay,
      leastProductiveDay,
    };
  }

  /**
   * Get stats for the current month
   */
  async getCurrentMonthStats(): Promise<MonthlyStats> {
    const today = new Date();
    return this.getMonthlyStats(today.getMonth(), today.getFullYear());
  }

  /**
   * Get productivity score (0-100) based on focus time, task completion, and breach count
   */
  calculateProductivityScore(stats: DailyStats | WeeklyStats): number {
    // Define target values
    const targetDailyFocusMinutes = 120; // 2 hours
    const targetDailyTasks = 5;
    const maxDailyBreaches = 10;

    // Calculate multipliers based on whether it's daily or weekly stats
    const dayMultiplier = 'dailyStats' in stats ? stats.dailyStats.length : 1;

    // Calculate focus time score (0-40 points)
    const focusTime =
      'totalFocusTime' in stats ? stats.totalFocusTime : stats.focusTime;
    const focusTimeScore = Math.min(
      40,
      (focusTime / (targetDailyFocusMinutes * dayMultiplier)) * 40,
    );

    // Calculate task completion score (0-40 points)
    const tasksCompleted =
      'totalTasksCompleted' in stats
        ? stats.totalTasksCompleted
        : stats.tasksCompleted;
    const northStarTasksCompleted =
      'totalNorthStarTasksCompleted' in stats
        ? stats.totalNorthStarTasksCompleted
        : stats.northStarTasksCompleted;

    const taskScore = Math.min(
      40,
      (tasksCompleted / (targetDailyTasks * dayMultiplier)) * 30,
    );
    const northStarBonus = Math.min(10, northStarTasksCompleted * 2);

    // Calculate breach penalty (0-20 points deduction)
    const breachCount =
      'totalBreachCount' in stats ? stats.totalBreachCount : stats.breachCount;
    const breachPenalty = Math.min(
      20,
      (breachCount / (maxDailyBreaches * dayMultiplier)) * 20,
    );

    // Calculate total score
    const totalScore = Math.max(
      0,
      Math.min(
        100,
        focusTimeScore + taskScore + northStarBonus - breachPenalty,
      ),
    );

    return Math.round(totalScore);
  }
}

export const statsAggregator = StatsAggregator.getInstance();
