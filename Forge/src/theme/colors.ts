export const colors = {
  // Base colors - Light mode (Things3-inspired)
  background: '#F5F5F5',
  surface: '#FFFFFF',

  // Primary colors
  header: '#4A90E2', // Blue for headers and accents
  northStar: '#50C878', // Green for North Star tasks
  overdue: '#FF4444', // Red for overdue tasks

  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#AAAAAA',
  },

  // Border colors
  border: {
    default: '#E0E0E0',
    focused: '#4A90E2',
  },

  // Status colors
  status: {
    success: '#50C878',
    error: '#FF4444',
    warning: '#FFC107',
  },

  // Task category colors
  category: {
    today: '#4A90E2',
    upcoming: '#50C878',
    someday: '#666666',
  },

  // Timer mode colors
  timer: {
    focus: {
      background: '#FF6B6B', // Softer red fire background
      text: '#FFFFFF',
    },
    rest: {
      background: '#6BB5FF', // Softer blue water background
      text: '#FFFFFF',
    },
  },

  // Dark mode variants (for future toggle)
  darkMode: {
    background: '#1C2526',
    surface: '#2D3748',
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
      disabled: '#718096',
    },
    border: {
      default: '#4A5568',
      focused: '#63B3ED',
    },
  },
};

export const opacity = {
  pressed: 0.7,
  disabled: 0.5,
  overlay: 0.5,
};

export const gradients = {
  header: ['#4A90E2', '#63B3ED'],
  northStar: ['#50C878', '#7DCEA0'],
  focus: ['#FF6B6B', '#FF8F8F'],
  rest: ['#6BB5FF', '#90CAF9'],
};
