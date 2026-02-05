// Enhanced Theme Toggle Component - HCI Principles Implementation
// Provides accessible theme switching with visual feedback

import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false, size = 'md', rounded = false }: ThemeToggleProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldUseDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsTransitioning(true);
    const newTheme = !isDarkMode;
    
    // Smooth transition effect
    document.documentElement.style.transition = 'all 0.3s ease';
    
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Reset transition after animation
    setTimeout(() => {
      document.documentElement.style.transition = '';
      setIsTransitioning(false);
    }, 300);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 text-sm';
      case 'lg':
        return 'p-4 text-lg';
      default:
        return 'p-3 text-base';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-secondary font-primary">
          Theme:
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        disabled={isTransitioning}
        className={`
          btn-secondary ${getSizeClasses()}
          ${rounded ? 'rounded-full' : 'rounded-lg'}
          relative overflow-hidden
          transition-all duration-300
          hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isTransitioning ? 'animate-pulse' : ''}
        `}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-pressed={isDarkMode}
      >
        {/* Background Animation */}
        <div 
          className={`
            absolute inset-0 transition-all duration-300
            ${isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 opacity-20' 
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20'
            }
          `}
        />
        
        {/* Icon Container */}
        <div className="relative flex items-center justify-center">
          <div 
            className={`
              transition-all duration-300 transform
              ${isTransitioning ? 'rotate-180 scale-110' : ''}
            `}
          >
            {isDarkMode ? (
              <span className="flex items-center gap-1">
                ☀️
                {showLabel && <span className="text-xs">Light</span>}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                🌙
                {showLabel && <span className="text-xs">Dark</span>}
              </span>
            )}
          </div>
        </div>

        {/* Ripple Effect */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
        )}
      </button>

      {/* Theme Status Indicator */}
      <div className="flex items-center gap-1">
        <div 
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${isDarkMode ? 'bg-blue-400' : 'bg-yellow-400'}
          `}
        />
        {showLabel && (
          <span className="text-xs text-secondary font-primary capitalize">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    </div>
  );
}

// Hook for theme state management
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return { isDarkMode, toggleTheme };
}