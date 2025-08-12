import { colors } from './tokens';

// Type for color keys
type ColorKey = keyof typeof colors;
type ColorShade = keyof typeof colors.sage;

/**
 * Get a color value from the theme
 */
export const getColor = (color: ColorKey, shade?: ColorShade): string => {
  const colorObj = colors[color];
  
  if (typeof colorObj === 'string') {
    return colorObj;
  }
  
  if (shade && typeof colorObj === 'object' && shade in colorObj) {
    return colorObj[shade as keyof typeof colorObj];
  }
  
  // Default to 500 shade if available
  if (typeof colorObj === 'object' && '500' in colorObj) {
    return colorObj['500'];
  }
  
  return '#000000'; // Fallback
};

/**
 * Generate CSS custom properties for colors
 */
export const generateColorVariables = () => {
  const variables: Record<string, string> = {};
  
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'string') {
      variables[`--color-${colorName}`] = colorValue;
    } else {
      Object.entries(colorValue).forEach(([shade, value]) => {
        variables[`--color-${colorName}-${shade}`] = value;
      });
    }
  });
  
  return variables;
};

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  return rgbToHex(
    Math.min(255, r + amount),
    Math.min(255, g + amount),
    Math.min(255, b + amount)
  );
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  const amount = Math.round(2.55 * percent);
  
  return rgbToHex(
    Math.max(0, r - amount),
    Math.max(0, g - amount),
    Math.max(0, b - amount)
  );
};

/**
 * Add alpha transparency to a hex color
 */
export const addAlpha = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const { r, g, b } = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get contrast color (black or white) for a given background color
 */
export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  const { r, g, b } = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#ffffff';
};

/**
 * Check if a color is light or dark
 */
export const isLightColor = (hex: string): boolean => {
  return getContrastColor(hex) === '#000000';
};

/**
 * Generate a color palette from a base color
 */
export const generatePalette = (baseColor: string) => {
  return {
    50: lightenColor(baseColor, 45),
    100: lightenColor(baseColor, 35),
    200: lightenColor(baseColor, 25),
    300: lightenColor(baseColor, 15),
    400: lightenColor(baseColor, 5),
    500: baseColor,
    600: darkenColor(baseColor, 5),
    700: darkenColor(baseColor, 15),
    800: darkenColor(baseColor, 25),
    900: darkenColor(baseColor, 35),
  };
};

/**
 * Responsive breakpoint utilities
 */
export const breakpointUtils = {
  up: (breakpoint: keyof typeof import('./tokens').breakpoints) => 
    `@media (min-width: ${import('./tokens').breakpoints[breakpoint]})`,
  down: (breakpoint: keyof typeof import('./tokens').breakpoints) => 
    `@media (max-width: ${parseInt(import('./tokens').breakpoints[breakpoint]) - 1}px)`,
  between: (
    min: keyof typeof import('./tokens').breakpoints, 
    max: keyof typeof import('./tokens').breakpoints
  ) => 
    `@media (min-width: ${import('./tokens').breakpoints[min]}) and (max-width: ${parseInt(import('./tokens').breakpoints[max]) - 1}px)`,
};

/**
 * Animation utilities
 */
export const animationUtils = {
  transition: (properties: string[], duration = '200ms', easing = 'ease-in-out') =>
    `transition: ${properties.join(', ')} ${duration} ${easing}`,
  
  fadeIn: (duration = '300ms') => ({
    animation: `fadeIn ${duration} ease-in-out`,
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
  }),
  
  slideUp: (duration = '300ms') => ({
    animation: `slideUp ${duration} ease-out`,
    '@keyframes slideUp': {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  }),
  
  scaleIn: (duration = '200ms') => ({
    animation: `scaleIn ${duration} ease-out`,
    '@keyframes scaleIn': {
      from: { transform: 'scale(0.95)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
  }),
};