import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  calendarService,
  CalendarEvent,
} from '../../services/calendar/CalendarService';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

interface CalendarEventsProps {
  onRequestAccess?: () => void;
}

export const CalendarEvents: React.FC<CalendarEventsProps> = ({
  onRequestAccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadEvents();
  }, []);

  // Check authorization status and load events if authorized
  const checkAuthAndLoadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if calendar access is authorized with Google
      const isAuth = await calendarService.checkAuthorizationStatus();
      setAuthorized(isAuth);

      if (isAuth) {
        await loadEvents();
      }
    } catch (err) {
      console.error('Error checking authorization:', err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's events
      const todayEvents = await calendarService.getTodayEvents();
      setEvents(todayEvents);
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const granted = await calendarService.requestCalendarAccess();
      setAuthorized(granted);

      if (granted) {
        // Get today's events
        const todayEvents = await calendarService.getTodayEvents();
        setEvents(todayEvents);
      } else {
        setError('Calendar access denied');
      }

      if (onRequestAccess) {
        onRequestAccess();
      }
    } catch (err) {
      console.error('Error requesting calendar access:', err);
      setError('Failed to request calendar access');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!authorized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Calendar Events</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <Text style={styles.description}>
          Connect your Google Calendar to see your events here and plan your
          focus time around your schedule.
        </Text>
        <TouchableOpacity
          style={styles.accessButton}
          onPress={handleRequestAccess}>
          <Text style={styles.accessButtonText}>Connect Google Calendar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Events</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {events.length === 0 ? (
        <Text style={styles.emptyText}>No events scheduled for today</Text>
      ) : (
        events.map(event => (
          <View key={event.id} style={styles.eventItem}>
            <View style={styles.eventTimeContainer}>
              <Text style={styles.eventTime}>
                {event.allDay ? 'All Day' : formatTime(event.startTime)}
              </Text>
            </View>
            <View style={styles.eventDetailsContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.location && (
                <Text style={styles.eventLocation}>{event.location}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  description: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: spacing.md * 1.2,
  },
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  title: {
    fontSize: spacing.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.status.error,
    fontSize: spacing.sm,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  eventTimeContainer: {
    width: 70,
    marginRight: spacing.sm,
  },
  eventTime: {
    color: colors.text.secondary,
    fontSize: spacing.sm,
  },
  eventDetailsContainer: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text.primary,
    fontSize: spacing.sm,
    fontWeight: 'bold',
  },
  eventLocation: {
    color: colors.text.secondary,
    fontSize: spacing.xs,
    marginTop: 2,
  },
  accessButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  accessButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: spacing.sm,
  },
});
