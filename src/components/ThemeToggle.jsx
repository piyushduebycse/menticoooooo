import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-switch"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light (Day)' : 'Dark (Night)'} Mode`}
    >
      <div className="theme-switch-slider">
        {isDark ? (
          <Moon size={14} strokeWidth={2.5} />
        ) : (
          <Sun size={14} strokeWidth={2.5} />
        )}
      </div>
    </button>
  );
}
