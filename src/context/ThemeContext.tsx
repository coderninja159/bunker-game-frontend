import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocationContext } from '../types';

export interface ThemeStyles {
  glow: string;
  primary: string;
  bg: string;
  text: string;
  glowClass: string;
  title: string;
  themeColor: string;
  bgClass: string;
  headerClass: string;
  accentBg: string;
  accentText: string;
  cardBorder: string;
}

interface ThemeContextType {
  theme: ThemeStyles;
  setLocation: (location: LocationContext | null) => void;
}

const defaultTheme: ThemeStyles = {
  glow: 'rgba(249, 115, 22, 0.6)', // default underground bunker orange
  primary: 'text-orange-400 border-orange-500/30 shadow-orange-500/10',
  bg: 'bg-orange-950/20',
  text: 'text-orange-200',
  glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
  title: 'SECURE BUNKER',
  themeColor: '#f97316',
  bgClass: 'bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950',
  headerClass: 'text-orange-400 font-bold border-orange-500/20',
  accentBg: 'bg-orange-500/10',
  accentText: 'text-orange-300',
  cardBorder: 'border-orange-500/30',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialLocation?: LocationContext | null }> = ({ children, initialLocation }) => {
  const [location, setLocationState] = useState<LocationContext | null>(initialLocation || null);
  const [theme, setTheme] = useState<ThemeStyles>(defaultTheme);

  const setLocation = (loc: LocationContext | null) => {
    setLocationState(loc);
  };

  useEffect(() => {
    if (!location) {
      setTheme(defaultTheme);
      // Set CSS variable on body
      document.body.style.setProperty('--theme-glow', '#f97316');
      return;
    }

    let newTheme: ThemeStyles;

    switch (location.type) {
      case 'FOREST':
        newTheme = {
          glow: 'rgba(16, 185, 129, 0.6)',
          primary: 'text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-200',
          glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          title: location.name.toUpperCase(),
          themeColor: '#10b981',
          bgClass: 'bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-950',
          headerClass: 'text-emerald-400 border-emerald-500/20',
          accentBg: 'bg-emerald-500/10',
          accentText: 'text-emerald-300',
          cardBorder: 'border-emerald-500/20',
        };
        break;

      case 'ALIEN_PLANET':
        newTheme = {
          glow: 'rgba(217, 70, 239, 0.6)',
          primary: 'text-fuchsia-400 border-fuchsia-500/30 shadow-fuchsia-500/10',
          bg: 'bg-fuchsia-950/20',
          text: 'text-fuchsia-200',
          glowClass: 'shadow-[0_0_20px_rgba(217,70,239,0.2)]',
          title: location.name.toUpperCase(),
          themeColor: '#d946ef',
          bgClass: 'bg-gradient-to-br from-slate-950 via-fuchsia-950/30 to-slate-950',
          headerClass: 'text-fuchsia-400 border-fuchsia-500/20',
          accentBg: 'bg-fuchsia-500/10',
          accentText: 'text-fuchsia-300',
          cardBorder: 'border-fuchsia-500/20',
        };
        break;

      case 'UNDERWATER_DOME':
        newTheme = {
          glow: 'rgba(6, 182, 212, 0.6)',
          primary: 'text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
          bg: 'bg-cyan-950/20',
          text: 'text-cyan-200',
          glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
          title: location.name.toUpperCase(),
          themeColor: '#06b6d4',
          bgClass: 'bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-950',
          headerClass: 'text-cyan-400 border-cyan-500/20',
          accentBg: 'bg-cyan-500/10',
          accentText: 'text-cyan-300',
          cardBorder: 'border-cyan-500/20',
        };
        break;

      case 'DESERT_OUTPOST':
        newTheme = {
          glow: 'rgba(234, 179, 8, 0.6)',
          primary: 'text-yellow-400 border-yellow-500/30 shadow-yellow-500/10',
          bg: 'bg-yellow-950/20',
          text: 'text-yellow-200',
          glowClass: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]',
          title: location.name.toUpperCase(),
          themeColor: '#eab308',
          bgClass: 'bg-gradient-to-br from-slate-950 via-yellow-950/20 to-slate-950',
          headerClass: 'text-yellow-400 border-yellow-500/20',
          accentBg: 'bg-yellow-500/10',
          accentText: 'text-yellow-300',
          cardBorder: 'border-yellow-500/20',
        };
        break;

      case 'UNDERGROUND_BUNKER':
      default:
        newTheme = {
          glow: 'rgba(249, 115, 22, 0.6)',
          primary: 'text-orange-400 border-orange-500/30 shadow-orange-500/10',
          bg: 'bg-orange-950/20',
          text: 'text-orange-200',
          glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
          title: location.name.toUpperCase(),
          themeColor: '#f97316',
          bgClass: 'bg-gradient-to-br from-slate-950 via-orange-950/20 to-slate-950',
          headerClass: 'text-orange-400 border-orange-500/20',
          accentBg: 'bg-orange-500/10',
          accentText: 'text-orange-300',
          cardBorder: 'border-orange-500/20',
        };
        break;
    }

    setTheme(newTheme);
    document.body.style.setProperty('--theme-glow', newTheme.themeColor);
  }, [location]);

  return (
    <ThemeContext.Provider value={{ theme, setLocation }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
