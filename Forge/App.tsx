import 'react-native-get-random-values';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import {TodoListScreen} from './src/screens/TodoList/TodoListScreen';
import {TaskDetailsScreen} from './src/screens/TaskDetails/TaskDetailsScreen';
import {TimerScreen} from './src/screens/Timer/TimerScreen';
import {OnboardingScreen} from './src/screens/Onboarding/OnboardingScreen';
import {ProfileScreen} from './src/screens/Profile/ProfileScreen';
import {colors} from './src/theme/colors';
import {databaseService} from './src/services/storage/DatabaseService';
import {settingsService} from './src/services/settings/SettingsService';
import {analyticsService} from './src/services/analytics/AnalyticsService';

export type RootStackParamList = {
  Onboarding: undefined;
  TodoList: undefined;
  TaskDetails: {taskId: string};
  Timer: {taskId: string};
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await databaseService.initDatabase();
        const onboardingCompleted =
          await settingsService.isOnboardingCompleted();
        setInitialRoute(onboardingCompleted ? 'TodoList' : 'Onboarding');

        // Track app open and check retention
        await analyticsService.logAppOpen();
        await analyticsService.logRetention();

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize app');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          name="TodoList"
          component={TodoListScreen}
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
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerTitle: 'Profile',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text.primary,
          }}
        />
      </Stack.Navigator>
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
