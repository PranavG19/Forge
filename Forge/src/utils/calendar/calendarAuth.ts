import {authorize, refresh, AuthConfiguration} from 'react-native-app-auth';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const AUTH_TOKEN_KEY = 'google_calendar_auth_token';
const REFRESH_TOKEN_KEY = 'google_calendar_refresh_token';
const TOKEN_EXPIRY_KEY = 'google_calendar_token_expiry';

// Google OAuth configuration
const getConfig = (): AuthConfiguration => {
  // These would be your actual Google API credentials
  // You would need to create a project in Google Cloud Console and enable the Calendar API
  const config: AuthConfiguration = {
    issuer: 'https://accounts.google.com',
    clientId: Platform.select({
      ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    }) as string,
    redirectUrl: Platform.select({
      ios: 'com.forge:/oauth2redirect/google',
      android: 'com.forge:/oauth2redirect/google',
    }) as string,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
    },
  };

  return config;
};

/**
 * Authenticate with Google Calendar
 */
export const authenticateWithGoogle = async (): Promise<boolean> => {
  try {
    const config = getConfig();
    const result = await authorize(config);

    // Store authentication result
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken || '');
    await AsyncStorage.setItem(
      TOKEN_EXPIRY_KEY,
      result.accessTokenExpirationDate,
    );

    return true;
  } catch (error) {
    console.error('Google authentication failed:', error);
    return false;
  }
};

/**
 * Get the current access token, refreshing if necessary
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const expiryDate = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    // If no access token, authentication is required
    if (!accessToken) {
      return null;
    }

    // Check if token is expired
    const now = new Date();
    const expiry = expiryDate ? new Date(expiryDate) : new Date();

    // If token is expired and we have a refresh token, refresh it
    if (now >= expiry && refreshToken) {
      try {
        const config = getConfig();
        const result = await refresh(config, {
          refreshToken,
        });

        // Store new tokens
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.accessToken);
        await AsyncStorage.setItem(
          TOKEN_EXPIRY_KEY,
          result.accessTokenExpirationDate,
        );

        return result.accessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Check if user is authenticated with Google Calendar
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken();
  return token !== null;
};

/**
 * Sign out from Google Calendar
 */
export const signOut = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
};
