import React, { createContext, useContext, useEffect } from 'react';

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
  useEffect(() => {
    // Strictly enforce clean Light Mode across the entire application
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-font', 'modern');
    try {
      localStorage.setItem('mentico_theme', 'light');
      localStorage.setItem('mentico_font_pairing', 'modern');
    } catch {
      // ignore storage access errors
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        toggleTheme: () => {},
        isDark: false,
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
