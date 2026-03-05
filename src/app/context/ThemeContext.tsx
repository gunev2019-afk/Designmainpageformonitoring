import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Проверяем сохраненную тему в localStorage
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    // Применяем класс dark к document.documentElement
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setLightTheme = () => {
    setIsDarkMode(false);
  };

  const setDarkTheme = () => {
    setIsDarkMode(true);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setLightTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
