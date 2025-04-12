import {
  getAccessToken,
  isAuthenticated,
  authenticateWithGoogle,
} from '../../utils/calendar/calendarAuth';
import {CalendarEvent} from './CalendarService';

/**
 * Service for interacting with Google Calendar API
 */
export class GoogleCalendarService {
  private static instance: GoogleCalendarService;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  private constructor() {}

  static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  /**
   * Check if user is authenticated with Google Calendar
   */
  async isAuthorized(): Promise<boolean> {
    return await isAuthenticated();
  }

  /**
   * Request calendar access permissions
   */
  async requestCalendarAccess(): Promise<boolean> {
    return await authenticateWithGoogle();
  }

  /**
   * Get events for today
   */
  async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set time to start of day for today and start of day for tomorrow
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    return this.getEvents(today, tomorrow);
  }

  /**
   * Get events for a specific date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Not authenticated with Google Calendar');
      }

      // Format dates for Google Calendar API
      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      // Build the URL with query parameters
      const url = `${
        this.baseUrl
      }/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin,
      )}&timeMax=${encodeURIComponent(
        timeMax,
      )}&singleEvents=true&orderBy=startTime`;

      // Make the API request
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform Google Calendar events to our app's format
      return this.transformEvents(data.items || []);
    } catch (error) {
      console.error('Failed to get events from Google Calendar:', error);
      return [];
    }
  }

  /**
   * Transform Google Calendar API events to our app's format
   */
  private transformEvents(googleEvents: any[]): CalendarEvent[] {
    return googleEvents.map(event => {
      const startTime = event.start.dateTime || `${event.start.date}T00:00:00`;
      const endTime = event.end.dateTime || `${event.end.date}T23:59:59`;
      const allDay = !event.start.dateTime;

      return {
        id: event.id,
        title: event.summary || 'Untitled Event',
        startTime,
        endTime,
        location: event.location || undefined,
        allDay,
      };
    });
  }
}

export const googleCalendarService = GoogleCalendarService.getInstance();
