export const colors = {
  // Base colors
  background: "#000000",
  surface: "#1E1E1E",

  // Primary colors
  primary: "#FF6B00", // Orange for North Star tasks and highlights
  primaryDark: "#CC5500",
  primaryLight: "#FF8533",

  // Text colors
  text: {
    primary: "#FFFFFF",
    secondary: "#666666",
    disabled: "#444444",
  },

  // Border colors
  border: {
    default: "#333333",
    focused: "#FF6B00",
  },

  // Status colors
  status: {
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FFC107",
  },

  // Task category colors
  category: {
    today: "#FF6B00",
    next: "#666666",
    later: "#444444",
  },

  // Timer mode colors
  timer: {
    focus: {
      background: "#FF6B00",
      text: "#FFFFFF",
    },
    rest: {
      background: "#0088CC",
      text: "#FFFFFF",
    },
  },
};

export const opacity = {
  pressed: 0.7,
  disabled: 0.5,
  overlay: 0.5,
};

export const gradients = {
  primary: ["#FF6B00", "#FF8533"],
  focus: ["#FF6B00", "#CC5500"],
  rest: ["#0088CC", "#006699"],
};
