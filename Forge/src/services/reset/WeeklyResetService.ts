import {EventEmitter} from 'events';
import {settingsService} from '../settings/SettingsService';
import {experienceService} from '../experience/ExperienceService';
import {intentionService} from '../intention/IntentionService';
import {databaseService} from '../storage/DatabaseService';

/**
 * Service responsible for managing weekly resets in the app
 * Handles checking for reset day, archiving data, and triggering reset events
 */
export class WeeklyResetService extends EventEmitter {
  private static instance: WeeklyResetService;
  private initialized = false;
  private lastCheckedDate: Date | null = null;

  private constructor() {
    super();
    this.initializeDatabase().catch(console.error);
  }

  static getInstance(): WeeklyResetService {
    if (!WeeklyResetService.instance) {
      WeeklyResetService.instance = new WeeklyResetService();
    }
    return WeeklyResetService.instance;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create table for archived data
      await databaseService.executeSql(`
        CREATE TABLE IF NOT EXISTS weekly_archives (
          id TEXT PRIMARY KEY,
          week_ending TEXT NOT NULL,
          focus_time INTEGER NOT NULL,
          rest_time INTEGER NOT NULL,
          tasks_completed INTEGER NOT NULL,
          north_star_completed INTEGER NOT NULL,
          breach_count INTEGER NOT NULL,
          exp_gained INTEGER NOT NULL,
          data JSON
        )
      `);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize weekly reset database:', error);
      throw error;
    }
  }

  /**
   * Checks if today is the reset day and triggers a reset if needed
   * @returns true if reset was triggered, false otherwise
   */
  public async checkForReset(): Promise<boolean> {
    await this.initializeDatabase();

    try {
      // Get the reset day from settings (0 = Sunday, 1 = Monday, etc.)
      const resetDay = await settingsService.getSetting('weeklyResetDay');
      const resetDayIndex = this.getDayIndex(resetDay);

      // Get the current day
      const today = new Date();
      const currentDayIndex = today.getDay();

      // Get the last reset date
      const lastResetDate = await this.getLastResetDate();

      // If today is the reset day and we haven't reset yet this week
      if (
        currentDayIndex === resetDayIndex &&
        (!lastResetDate || this.isDifferentWeek(today, lastResetDate))
      ) {
        await this.performReset();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for reset:', error);
      return false;
    }
  }

  /**
   * Performs the weekly reset
   * Archives data, resets experience, and updates last reset date
   */
  private async performReset(): Promise<void> {
    try {
      // Archive current week's data
      await this.archiveCurrentWeekData();

      // Reset experience
      await experienceService.resetWeeklyExp();

      // Update last reset date
      await this.updateLastResetDate();

      // Emit reset event
      this.emit('weeklyReset');
    } catch (error) {
      console.error('Error performing reset:', error);
      throw error;
    }
  }

  /**
   * Archives the current week's data
   */
  private async archiveCurrentWeekData(): Promise<void> {
    try {
      const weeklyStats = await experienceService.getWeeklyStats();
      const breachCount = await this.getWeeklyBreachCount();

      // Create archive record
      const archiveId = `week_${new Date().toISOString()}`;
      const weekEnding = new Date().toISOString();

      // Store additional data as JSON
      const additionalData = {
        intentions: await intentionService.getWeeklyIntentions(),
        // Add any other data you want to archive
      };

      await databaseService.executeSql(
        `INSERT INTO weekly_archives (
          id, week_ending, focus_time, rest_time, 
          tasks_completed, north_star_completed, 
          breach_count, exp_gained, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          archiveId,
          weekEnding,
          weeklyStats.focusTime,
          weeklyStats.restTime,
          weeklyStats.tasksCompleted,
          weeklyStats.northStarTasksCompleted,
          breachCount,
          weeklyStats.currentExp,
          JSON.stringify(additionalData),
        ],
      );
    } catch (error) {
      console.error('Error archiving weekly data:', error);
      throw error;
    }
  }

  /**
   * Gets the breach count for the current week
   */
  private async getWeeklyBreachCount(): Promise<number> {
    const lastResetDate = await this.getLastResetDate();
    const startDate =
      lastResetDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Use the app blocking service to get breach count
    const appBlockingService = (await import('../blocking/AppBlockingService'))
      .appBlockingService;
    return appBlockingService.getBreachCount(startDate);
  }

  /**
   * Updates the last reset date to today
   */
  private async updateLastResetDate(): Promise<void> {
    const today = new Date();
    // Store the last reset date in local storage since we can't use the private setSetting method
    try {
      localStorage.setItem('lastResetDate', today.toISOString());
      this.lastCheckedDate = today;
    } catch (error) {
      console.error('Error updating last reset date:', error);
    }
  }

  /**
   * Gets the last reset date from settings
   */
  private async getLastResetDate(): Promise<Date | null> {
    if (this.lastCheckedDate) {
      return this.lastCheckedDate;
    }

    try {
      // Get from localStorage instead of settings service
      const lastResetDateStr = localStorage.getItem('lastResetDate');
      if (!lastResetDateStr) {
        return null;
      }

      const date = new Date(lastResetDateStr);
      this.lastCheckedDate = date;
      return date;
    } catch (error) {
      console.error('Error parsing last reset date:', error);
      return null;
    }
  }

  /**
   * Converts a day name to a day index (0 = Sunday, 1 = Monday, etc.)
   */
  private getDayIndex(dayName: string): number {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const index = days.indexOf(dayName.toUpperCase());
    return index >= 0 ? index : 0; // Default to Sunday if invalid
  }

  /**
   * Checks if two dates are in different weeks
   */
  private isDifferentWeek(date1: Date, date2: Date): boolean {
    // Get the week number for each date
    const getWeekNumber = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      return Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
      );
    };

    return (
      getWeekNumber(date1) !== getWeekNumber(date2) ||
      date1.getFullYear() !== date2.getFullYear()
    );
  }

  /**
   * Gets archived weekly data
   * @param limit Number of weeks to retrieve (default: 4)
   */
  public async getArchivedWeeks(limit: number = 4): Promise<any[]> {
    await this.initializeDatabase();

    try {
      const [result] = await databaseService.executeSql(
        `SELECT * FROM weekly_archives ORDER BY week_ending DESC LIMIT ?`,
        [limit],
      );

      const archives = [];
      for (let i = 0; i < result.rows.length; i++) {
        const archive = result.rows.item(i);
        // Parse JSON data
        archive.data = JSON.parse(archive.data);
        archives.push(archive);
      }

      return archives;
    } catch (error) {
      console.error('Error getting archived weeks:', error);
      return [];
    }
  }
}

export const weeklyResetService = WeeklyResetService.getInstance();
