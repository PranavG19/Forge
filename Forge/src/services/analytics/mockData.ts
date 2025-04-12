import {AnalyticsEvent} from './AnalyticsService';

// Generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

// Generate mock events for a single user
const generateUserEvents = (
  userId: string,
  startDate: Date,
): AnalyticsEvent[] => {
  const events: AnalyticsEvent[] = [];
  const now = new Date();
  let currentDate = new Date(startDate);

  // Simulate daily app opens (with some missed days)
  while (currentDate <= now) {
    if (Math.random() > 0.2) {
      // 80% chance of opening app each day
      events.push({
        id: `${userId}-app-open-${currentDate.toISOString()}`,
        name: 'app_open',
        timestamp: currentDate.toISOString(),
      });

      // 80% chance of setting North Star
      if (Math.random() > 0.2) {
        events.push({
          id: `${userId}-north-star-${currentDate.toISOString()}`,
          name: 'north_star_set',
          timestamp: new Date(
            currentDate.getTime() + 5 * 60 * 1000,
          ).toISOString(), // 5 minutes after opening
        });
      }

      // Random focus sessions throughout the day
      const sessionsCount = Math.floor(Math.random() * 5) + 1; // 1-5 sessions
      for (let i = 0; i < sessionsCount; i++) {
        const sessionTime = new Date(
          currentDate.getTime() + (2 + i * 3) * 60 * 60 * 1000,
        ); // Spread throughout day
        const focusMinutes = Math.floor(Math.random() * 90) + 25; // 25-115 minutes
        events.push({
          id: `${userId}-focus-${sessionTime.toISOString()}`,
          name: 'focus_time',
          params: {minutes: focusMinutes},
          timestamp: sessionTime.toISOString(),
        });
      }
    }
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
};

// Generate mock data for 100 beta users
export const generateMockAnalytics = async (): Promise<AnalyticsEvent[]> => {
  const events: AnalyticsEvent[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Start 30 days ago

  // Generate events for each user
  for (let i = 0; i < 100; i++) {
    const userId = `user-${i + 1}`;
    const userStartDate = randomDate(startDate, new Date()); // Random start within last 30 days
    events.push(...generateUserEvents(userId, userStartDate));
  }

  // Sort events by timestamp
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

// Calculate success metrics from events
export const calculateMetrics = (events: AnalyticsEvent[]) => {
  const dailyNorthStarCount = events.filter(
    e => e.name === 'north_star_set',
  ).length;
  const dailyAppOpenCount = events.filter(e => e.name === 'app_open').length;
  const focusTimeEvents = events.filter(e => e.name === 'focus_time');

  const totalFocusMinutes = focusTimeEvents.reduce(
    (sum, e) => sum + (e.params?.minutes || 0),
    0,
  );

  const uniqueUserDays = new Set(
    events
      .filter(e => e.name === 'app_open')
      .map(e => e.timestamp.split('T')[0]),
  ).size;

  return {
    northStarSetRate: (dailyNorthStarCount / dailyAppOpenCount) * 100, // Target: 80%
    averageWeeklyFocusHours: ((totalFocusMinutes / uniqueUserDays) * 7) / 60, // Target: 5+ hours
    retentionRate: (uniqueUserDays / 30) * 100, // Target: 70%
  };
};
