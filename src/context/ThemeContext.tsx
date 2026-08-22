import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'emerald' | 'saffron' | 'indigo' | 'crimson' | 'midnight';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  badge: string;
  gradient: string;
  ringColor: string;
}

export const THEME_PRESETS: Record<ThemeColor, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Campus Emerald',
    description: 'Fresh mint & organic campus green',
    primaryColor: '#059669',
    accentColor: '#10b981',
    badge: '🌿 Fresh Mint',
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    ringColor: 'ring-emerald-500'
  },
  saffron: {
    id: 'saffron',
    name: 'Saffron & Spices',
    description: 'Warm Indian chai & golden turmeric glow',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    badge: '🌶️ Warm Turmeric',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    ringColor: 'ring-amber-500'
  },
  indigo: {
    id: 'indigo',
    name: 'Cyber Indigo',
    description: 'High-tech electric violet & student mesh',
    primaryColor: '#4f46e5',
    accentColor: '#6366f1',
    badge: '⚡ Electric Violet',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    ringColor: 'ring-indigo-500'
  },
  crimson: {
    id: 'crimson',
    name: 'Ruby Bistro',
    description: 'Gourmet spicy crimson & grill red',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    badge: '🔥 Ruby Bistro',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #db2777 100%)',
    ringColor: 'ring-rose-500'
  },
  midnight: {
    id: 'midnight',
    name: 'Ocean Cyan',
    description: 'Sleek azure ocean & cyan breeze',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    badge: '🌊 Ocean Cyan',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    ringColor: 'ring-cyan-500'
  }
};

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ThemeColor;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ThemeColor) => void;
  toggleDarkMode: () => void;
  currentConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Default to clean light mode unless user saved a preference
    const saved = localStorage.getItem('cafetari_theme_mode');
    return (saved as ThemeMode) || 'light';
  });

  const [colorTheme, setColorThemeState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('cafetari_color_theme');
    return (saved as ThemeColor) || 'emerald';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemIsDark(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('cafetari_theme_mode', mode);
    localStorage.setItem('cafetari_color_theme', colorTheme);

    // Apply or remove dark class on HTML element
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set data attributes for css selector hooks
    root.setAttribute('data-theme', colorTheme);
    root.setAttribute('data-mode', isDark ? 'dark' : 'light');

    // Update CSS variables for root
    const config = THEME_PRESETS[colorTheme] || THEME_PRESETS.emerald;
    root.style.setProperty('--primary-brand', config.primaryColor);
    root.style.setProperty('--accent-brand', config.accentColor);
  }, [mode, colorTheme, isDark]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setColorTheme = (newColor: ThemeColor) => {
    setColorThemeState(newColor);
  };

  const toggleDarkMode = () => {
    setModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorTheme,
        isDark,
        setMode,
        setColorTheme,
        toggleDarkMode,
        currentConfig: THEME_PRESETS[colorTheme] || THEME_PRESETS.emerald
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
