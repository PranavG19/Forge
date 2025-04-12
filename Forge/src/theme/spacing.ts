export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Specific use cases
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },

  // Layout
  container: {
    padding: 16,
    gutter: 16,
  },

  // Component specific
  task: {
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
  },

  // Icon sizes
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
  },
};

// Helper function to ensure consistent spacing
export const getSpacing = (multiplier: number): number =>
  spacing.md * multiplier;
