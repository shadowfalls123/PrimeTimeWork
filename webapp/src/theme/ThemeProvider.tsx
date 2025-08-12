import React, { createContext, useContext, useState, useEffect } from 'react';
import { colors, typography, spacing, borderRadius, boxShadow, breakpoints, zIndex, animation } from './tokens';

// Theme interface
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  boxShadow: typeof boxShadow;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
  animation: typeof animation;
  mode: 'light' | 'dark';
}

// Theme context
const ThemeContext = createContext<{
  theme: Theme;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
} | null>(null);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  const [mode, setModeState] = useState<'light' | 'dark'>(defaultMode);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark' | null;
    if (savedMode) {
      setModeState(savedMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setModeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update document class and localStorage when mode changes
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(mode);
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const theme: Theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    boxShadow,
    breakpoints,
    zIndex,
    animation,
    mode,
  };

  const toggleMode = () => {
    setModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setMode = (newMode: 'light' | 'dark') => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to get theme values
export const useThemeValues = () => {
  const { theme } = useTheme();
  return theme;
};