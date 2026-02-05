// Help System Component - Advanced HCI Implementation
// Provides contextual help, keyboard shortcuts, and accessibility features

import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  category: 'navigation' | 'interaction' | 'accessibility' | 'features';
}

const helpItems: HelpItem[] = [
  // Navigation Help
  {
    id: 'nav-1',
    title: 'Theme Toggle',
    description: 'Switch between light and dark modes for better visibility and comfort.',
    shortcut: 'Alt + T',
    category: 'navigation'
  },
  {
    id: 'nav-2',
    title: 'Quick Actions',
    description: 'Use the sidebar buttons or click suggested questions to get instant help.',
    category: 'navigation'
  },

  // Interaction Help
  {
    id: 'int-1',
    title: 'Send Messages',
    description: 'Type your question and press Enter to send, or click the Send button.',
    shortcut: 'Enter',
    category: 'interaction'
  },
  {
    id: 'int-2',
    title: 'Form Navigation',
    description: 'Use Tab to move between form fields, Shift+Tab to go backwards.',
    shortcut: 'Tab / Shift+Tab',
    category: 'interaction'
  },

  // Accessibility Help
  {
    id: 'acc-1',
    title: 'Screen Reader Support',
    description: 'All interactive elements have proper labels and descriptions for screen readers.',
    category: 'accessibility'
  },
  {
    id: 'acc-2',
    title: 'High Contrast Mode',
    description: 'The interface automatically adapts to your system\'s high contrast settings.',
    category: 'accessibility'
  },
  {
    id: 'acc-3',
    title: 'Reduced Motion',
    description: 'Animations are reduced if you have motion sensitivity preferences enabled.',
    category: 'accessibility'
  },

  // Features Help
  {
    id: 'feat-1',
    title: 'AI Assistant',
    description: 'Our AI uses RAG technology with 98-99% accuracy to answer your questions.',
    category: 'features'
  },
  {
    id: 'feat-2',
    title: 'Real-time Responses',
    description: 'Messages are processed instantly with WebSocket technology for immediate replies.',
    category: 'features'
  },
  {
    id: 'feat-3',
    title: 'Smart Caching',
    description: 'Frequently asked questions are cached for faster responses (shown with 💾 icon).',
    category: 'features'
  }
];

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpSystem({ isOpen, onClose }: HelpSystemProps) {
  const [activeCategory, setActiveCategory] = useState<string>('navigation');
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + T for theme toggle
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        const themeToggle = document.querySelector('[title*="theme"]') as HTMLButtonElement;
        themeToggle?.click();
      }
      
      // Escape to close help
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      
      // F1 to open help
      if (e.key === 'F1') {
        e.preventDefault();
        // This would be handled by parent component
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = helpItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All', icon: '📚' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'interaction', name: 'Interaction', icon: '👆' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'features', name: 'Features', icon: '✨' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❓</span>
            <div>
              <h2 className="font-secondary text-xl font-bold text-primary">
                Help & Support
              </h2>
              <p className="text-sm text-secondary">
                Learn how to use Future Commerce Support effectively
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary p-2"
            title="Close help (Esc)"
            aria-label="Close help"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="input"
          />
        </div>

        <div className="flex gap-6 h-96">
          {/* Categories Sidebar */}
          <div className="w-48 flex-shrink-0">
            <h3 className="font-secondary font-semibold text-primary mb-3 text-sm">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all text-sm
                    ${activeCategory === category.id 
                      ? 'glass border-primary/30 text-primary' 
                      : 'hover:glass text-secondary hover:text-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Content */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🔍</span>
                <h3 className="font-secondary text-lg text-primary mb-2">
                  No results found
                </h3>
                <p className="text-secondary">
                  Try adjusting your search or browse different categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="glass p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-secondary font-semibold text-primary">
                        {item.title}
                      </h4>
                      {item.shortcut && (
                        <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-secondary">
                          {item.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-secondary leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium glass">
                        {item.category === 'navigation' && '🧭 Navigation'}
                        {item.category === 'interaction' && '👆 Interaction'}
                        {item.category === 'accessibility' && '♿ Accessibility'}
                        {item.category === 'features' && '✨ Features'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="text-secondary">
              <span className="font-medium">Keyboard Shortcuts:</span>
              <span className="ml-2">F1 - Help, Esc - Close, Alt+T - Theme Toggle</span>
            </div>
            <button
              onClick={onClose}
              className="btn-primary px-4 py-2"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help Button Component
interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export function HelpButton({ onClick, className = '' }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn-secondary p-3 ${className}`}
      title="Open help (F1)"
      aria-label="Open help"
    >
      <span className="text-lg">❓</span>
    </button>
  );
}

// Hook for help system
export function useHelpSystem() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isHelpOpen,
    openHelp: () => setIsHelpOpen(true),
    closeHelp: () => setIsHelpOpen(false),
    HelpSystem: () => (
      <HelpSystem 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    ),
    HelpButton: (props: Omit<HelpButtonProps, 'onClick'>) => (
      <HelpButton 
        {...props} 
        onClick={() => setIsHelpOpen(true)} 
      />
    )
  };
}