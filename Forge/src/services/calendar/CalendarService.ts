import {EventEmitter} from 'events';
import {Platform} from 'react-native';
import {googleCalendarService} from './GoogleCalendarService';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  allDay: boolean;
}

export class CalendarService extends EventEmitter {
  private static instance: CalendarService;
  private initialized = false;
  private authorized = false;

  private constructor() {
    super();
  }

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  /**
   * Request calendar access permissions
   */
  async requestCalendarAccess(): Promise<boolean> {
    try {
      // Use Google Calendar service for authorization
      const granted = await googleCalendarService.requestCalendarAccess();
      this.authorized = granted;
      return granted;
    } catch (error) {
      console.error('Failed to request calendar access:', error);
      return false;
    }
  }

  /**
   * Check if calendar access is authorized
   */
  isAuthorized(): boolean {
    return this.authorized;
  }

  /**
   * Check authorization status with Google Calendar
   */
  async checkAuthorizationStatus(): Promise<boolean> {
    try {
      const isAuth = await googleCalendarService.isAuthorized();
      this.authorized = isAuth;
      return isAuth;
    } catch (error) {
      console.error('Failed to check authorization status:', error);
      this.authorized = false;
      return false;
    }
  }

  /**
   * Get events for today
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    if (!this.authorized) {
      throw new Error('Calendar access not authorized');
    }

    try {
      // Use Google Calendar service to get today's events
      return await googleCalendarService.getTodayEvents();
    } catch (error) {
      console.error('Failed to get today events:', error);
      return [];
    }
  }

  /**
   * Get events for a specific date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.authorized) {
      throw new Error('Calendar access not authorized');
    }

    try {
      // Use Google Calendar service to get events for the date range
      return await googleCalendarService.getEvents(startDate, endDate);
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }
}

export const calendarService = CalendarService.getInstance();
