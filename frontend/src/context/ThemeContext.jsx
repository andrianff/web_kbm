import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  // Check local storage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('kbm-theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Default to dark mode for premium look, or check system
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    // Save to local storage
    localStorage.setItem('kbm-theme', theme);
    // Apply data-theme attribute to DOM element
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
