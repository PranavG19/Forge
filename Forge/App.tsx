import 'react-native-get-random-values';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TodoListScreen} from './src/screens/TodoList/TodoListScreen';
import {TaskDetailsScreen} from './src/screens/TaskDetails/TaskDetailsScreen';
import {TimerScreen} from './src/screens/Timer/TimerScreen';
import {OnboardingScreen} from './src/screens/Onboarding/OnboardingScreen';
import {ProfileScreen} from './src/screens/Profile/ProfileScreen';
import {ProjectsScreen} from './src/screens/Projects/ProjectsScreen';
import {colors} from './src/theme/colors';
import {databaseService} from './src/services/storage/DatabaseService';
import {settingsService} from './src/services/settings/SettingsService';
import {analyticsService} from './src/services/analytics/AnalyticsService';
import {experienceService} from './src/services/experience/ExperienceService';
import {weeklyResetService} from './src/services/reset/WeeklyResetService';
import WeeklyResetModal from './src/components/modals/WeeklyResetModal';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  TodoList: undefined;
  Projects: undefined;
  TaskDetails: {taskId: string};
  Timer: {taskId: string};
  Profile: undefined;
};

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Main tab navigator component
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.header,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border.default,
        },
        headerShown: false,
      }}>
      <Tab.Screen
        name="TodoList"
        component={TodoListScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({color, size}: {color: string; size: number}) => (
            <Icon name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({color, size}: {color: string; size: number}) => (
            <Icon name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}: {color: string; size: number}) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);
  const [showWeeklyResetModal, setShowWeeklyResetModal] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialization started');

        // Initialize database with a timeout to prevent hanging
        const dbInitPromise = databaseService.initDatabase();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Database initialization timed out')),
            5000,
          ),
        );

        try {
          await Promise.race([dbInitPromise, timeoutPromise]);
          console.log('Database initialized successfully');
        } catch (dbError) {
          console.error(
            'Database initialization failed or timed out:',
            dbError,
          );
          // Continue anyway - we'll try to work with what we have
        }

        console.log('Checking onboarding status');
        let onboardingCompleted = false;
        try {
          onboardingCompleted = await settingsService.isOnboardingCompleted();
          console.log('Onboarding completed:', onboardingCompleted);
        } catch (settingsError) {
          console.error('Failed to check onboarding status:', settingsError);
          // Default to onboarding if we can't determine status
        }

        setInitialRoute(onboardingCompleted ? 'MainTabs' : 'Onboarding');

        // Check for weekly reset
        if (onboardingCompleted) {
          console.log('Checking for weekly reset');
          try {
            // Use our new WeeklyResetService instead
            const shouldReset = await weeklyResetService.checkForReset();
            if (shouldReset) {
              setShowWeeklyResetModal(true);
            }
          } catch (resetError) {
            console.error('Failed to check weekly reset:', resetError);
            // Continue without showing reset modal
          }
        }

        // Track app open and check retention
        try {
          console.log('Logging app open and retention');
          await analyticsService.logAppOpen();
          await analyticsService.logRetention();
        } catch (analyticsError) {
          console.error('Failed to log analytics:', analyticsError);
          // Continue without analytics
        }

        console.log('App initialization completed');
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(
          'Failed to initialize app: ' +
            (err instanceof Error ? err.message : String(err)),
        );
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.header} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!initialRoute) {
    return null;
  }

  // Handle weekly reset modal close
  const handleWeeklyResetModalClose = () => {
    setShowWeeklyResetModal(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Timer',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text.primary,
          }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Task Details',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text.primary,
          }}
        />
      </Stack.Navigator>

      {/* Weekly Reset Modal */}
      <WeeklyResetModal
        visible={showWeeklyResetModal}
        onClose={handleWeeklyResetModalClose}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default App;
