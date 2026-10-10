import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const FONT_PAIRINGS = {
  modern: {
    id: 'modern',
    name: 'Modern Executive',
    subtitle: 'Oswald + DM Sans',
    headingFont: "'Oswald', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('mentico_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // High-impact dark mode default
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', 'modern');
    localStorage.setItem('mentico_theme', theme);
    localStorage.setItem('mentico_font_pairing', 'modern');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === 'dark',
        fontPairing: 'modern',
        activeFontDetails: FONT_PAIRINGS.modern,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
