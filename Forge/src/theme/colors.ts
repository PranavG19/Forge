export const colors = {
  // Base colors
  background: '#000000',
  surface: '#1E1E1E',

  // Primary colors
  primary: '#FF6200', // Orange for North Star tasks and highlights
  primaryDark: '#CC4E00',
  primaryLight: '#FF7A33',

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#666666',
    disabled: '#444444',
  },

  // Border colors
  border: {
    default: '#333333',
    focused: '#FF6B00',
  },

  // Status colors
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
  },

  // Task category colors
  category: {
    today: '#FF6B00',
    next: '#666666',
    later: '#444444',
  },

  // Timer mode colors
  timer: {
    focus: {
      background: '#FF0000', // Red fire background
      text: '#FFFFFF',
    },
    rest: {
      background: '#00B7EB', // Blue water background
      text: '#FFFFFF',
    },
  },
};

export const opacity = {
  pressed: 0.7,
  disabled: 0.5,
  overlay: 0.5,
};

export const gradients = {
  primary: ['#FF6200', '#FF7A33'],
  focus: ['#FF0000', '#CC0000'],
  rest: ['#00B7EB', '#0091BC'],
};
