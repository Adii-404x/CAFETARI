import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'emerald' | 'saffron' | 'indigo' | 'crimson' | 'midnight';
export type UiArchetype = 'neo-bento' | 'cyber-kds' | 'warm-artisan' | 'swiss-minimal';

export interface UiArchetypeConfig {
  id: UiArchetype;
  name: string;
  tagline: string;
  badge: string;
  fontHeading: string;
  fontBody: string;
  containerBg: string;
  cardRadius: string;
  aesthetic: string;
  accentTag: string;
  heroGreetingStyle: string;
  orderCardStyle: string;
}

export const UI_ARCHETYPES: Record<UiArchetype, UiArchetypeConfig> = {
  'neo-bento': {
    id: 'neo-bento',
    name: 'Neo-Bento Editorial',
    tagline: 'High-Velocity Hospitality & Nordic Clean Aesthetics',
    badge: '✨ Bento Editorial',
    fontHeading: 'font-serif',
    fontBody: 'font-sans',
    containerBg: 'bg-[#F6F4EF] dark:bg-[#121316]',
    cardRadius: 'rounded-3xl',
    aesthetic: 'Warm cream & espresso palette with editorial serif headings, glass bento grids and smooth micro-springs.',
    accentTag: 'bg-amber-900/10 dark:bg-amber-100/10 text-amber-900 dark:text-amber-200 border-amber-800/20',
    heroGreetingStyle: 'font-serif tracking-tight',
    orderCardStyle: 'bg-white/90 dark:bg-[#18191E] border border-slate-200/80 dark:border-slate-800/80 shadow-md'
  },
  'cyber-kds': {
    id: 'cyber-kds',
    name: 'Cyber Terminal & HUD',
    tagline: 'Tactical High-Density Order Hub & Telemetry',
    badge: '⚡ Cyber KDS',
    fontHeading: 'font-sans font-extrabold',
    fontBody: 'font-sans',
    containerBg: 'bg-[#0B0F17] dark:bg-[#070A0F]',
    cardRadius: 'rounded-2xl',
    aesthetic: 'Obsidian cockpit styling with glowing radar indicators, split-flap counters, and real-time station metrics.',
    accentTag: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    heroGreetingStyle: 'font-sans font-black tracking-tight',
    orderCardStyle: 'bg-[#101726] border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
  },
  'warm-artisan': {
    id: 'warm-artisan',
    name: 'Warm Artisan Bistro',
    tagline: 'Boutique Roast, Saffron Spices & Craft Kitchen',
    badge: '🍂 Artisan Craft',
    fontHeading: 'font-serif',
    fontBody: 'font-sans',
    containerBg: 'bg-[#FAF6F0] dark:bg-[#191412]',
    cardRadius: 'rounded-3xl',
    aesthetic: 'Toasted caramel, warm saffron glows, terracotta highlights, and handcrafted culinary badges.',
    accentTag: 'bg-amber-700/15 text-amber-800 dark:text-amber-300 border-amber-600/30',
    heroGreetingStyle: 'font-serif italic font-normal',
    orderCardStyle: 'bg-[#FFFDF9] dark:bg-[#201A17] border border-amber-900/15 dark:border-amber-700/30 shadow-sm'
  },
  'swiss-minimal': {
    id: 'swiss-minimal',
    name: 'Swiss Precision Fast-Lane',
    tagline: 'Frictionless Contrast, Zero Clutter & Maximum Speed',
    badge: '📐 Swiss Precision',
    fontHeading: 'font-sans font-black',
    fontBody: 'font-sans',
    containerBg: 'bg-[#FAFAFA] dark:bg-[#09090B]',
    cardRadius: 'rounded-xl',
    aesthetic: 'Ultra-crisp monochrome with high-contrast typography, rapid 1-tap selectors, and bold structural lines.',
    accentTag: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    heroGreetingStyle: 'font-sans font-black tracking-tighter uppercase',
    orderCardStyle: 'bg-white dark:bg-zinc-900 border-2 border-slate-900 dark:border-zinc-700 shadow-none'
  }
};

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
  archetype: UiArchetype;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ThemeColor) => void;
  setArchetype: (archetype: UiArchetype) => void;
  toggleDarkMode: () => void;
  currentConfig: ThemeConfig;
  currentArchetype: UiArchetypeConfig;
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

  const [archetype, setArchetypeState] = useState<UiArchetype>('cyber-kds');

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
    localStorage.setItem('cafetari_ui_archetype', 'cyber-kds');

    // Apply or remove dark class on HTML element
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set data attributes for css selector hooks - locked to cyber-kds
    root.setAttribute('data-theme', colorTheme);
    root.setAttribute('data-archetype', 'cyber-kds');
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

  const setArchetype = (_newArchetype: UiArchetype) => {
    // Locked to cyber-kds
    setArchetypeState('cyber-kds');
  };

  const toggleDarkMode = () => {
    setModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colorTheme,
        archetype: 'cyber-kds',
        isDark,
        setMode,
        setColorTheme,
        setArchetype,
        toggleDarkMode,
        currentConfig: THEME_PRESETS[colorTheme] || THEME_PRESETS.emerald,
        currentArchetype: UI_ARCHETYPES['cyber-kds']
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
