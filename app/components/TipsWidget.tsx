// Tips Widget Component - HCI Principles Implementation
// Provides contextual help and guidance to users

import React, { useState, useEffect } from 'react';
import '../styles/theme.css';

interface Tip {
  id: string;
  title: string;
  content: string;
  icon: string;
  category: 'navigation' | 'chat' | 'features' | 'shortcuts';
  page?: string[];
}

const tips: Tip[] = [
  // Navigation Tips
  {
    id: 'nav-1',
    title: 'Quick Navigation',
    content: 'Use the theme toggle (🌙/☀️) in the top right to switch between light and dark modes for better visibility.',
    icon: '🧭',
    category: 'navigation',
    page: ['login', 'register', 'dashboard']
  },
  {
    id: 'nav-2',
    title: 'Account Management',
    content: 'Your account information is always visible in the header. Click "Logout" to securely end your session.',
    icon: '👤',
    category: 'navigation',
    page: ['dashboard']
  },

  // Chat Tips
  {
    id: 'chat-1',
    title: 'AI Assistant',
    content: 'I\'m powered by RAG technology with 98-99% accuracy. Ask me about products, shipping, returns, or any policies!',
    icon: '🤖',
    category: 'chat',
    page: ['dashboard']
  },
  {
    id: 'chat-2',
    title: 'Quick Actions',
    content: 'Use the quick action buttons or sidebar shortcuts to ask common questions instantly.',
    icon: '⚡',
    category: 'chat',
    page: ['dashboard']
  },
  {
    id: 'chat-3',
    title: 'Message Status',
    content: 'Watch for connection status indicators (🟢 Connected) and response metadata for transparency.',
    icon: '📊',
    category: 'chat',
    page: ['dashboard']
  },

  // Feature Tips
  {
    id: 'feature-1',
    title: 'Real-time Support',
    content: 'Your messages are processed in real-time with WebSocket technology for instant responses.',
    icon: '⚡',
    category: 'features',
    page: ['dashboard']
  },
  {
    id: 'feature-2',
    title: 'Smart Caching',
    content: 'Frequently asked questions are cached (💾 icon) for faster responses and better performance.',
    icon: '💾',
    category: 'features',
    page: ['dashboard']
  },
  {
    id: 'feature-3',
    title: 'Context Awareness',
    content: 'I remember our conversation context to provide more relevant and personalized assistance.',
    icon: '🧠',
    category: 'features',
    page: ['dashboard']
  },

  // Shortcuts Tips
  {
    id: 'shortcut-1',
    title: 'Keyboard Shortcuts',
    content: 'Press Enter to send messages quickly, or Tab to navigate between form fields efficiently.',
    icon: '⌨️',
    category: 'shortcuts',
    page: ['login', 'register', 'dashboard']
  },
  {
    id: 'shortcut-2',
    title: 'Form Validation',
    content: 'Real-time validation helps you fix errors immediately. Look for helpful hints below input fields.',
    icon: '✅',
    category: 'shortcuts',
    page: ['login', 'register']
  }
];

interface TipsWidgetProps {
  currentPage: string;
}

export function TipsWidget({ currentPage }: TipsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasSeenTips, setHasSeenTips] = useState(false);

  // Filter tips based on current page
  const relevantTips = tips.filter(tip => 
    !tip.page || tip.page.includes(currentPage)
  );

  // Auto-show tips for new users (HCI: Progressive Disclosure)
  useEffect(() => {
    const hasSeenTipsKey = `tips-seen-${currentPage}`;
    const seen = localStorage.getItem(hasSeenTipsKey);
    
    if (!seen && relevantTips.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasSeenTips(false);
      }, 2000); // Show after 2 seconds for new users
      
      return () => clearTimeout(timer);
    } else {
      setHasSeenTips(true);
    }
  }, [currentPage, relevantTips.length]);

  const handleClose = () => {
    setIsOpen(false);
    const hasSeenTipsKey = `tips-seen-${currentPage}`;
    localStorage.setItem(hasSeenTipsKey, 'true');
    setHasSeenTips(true);
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % relevantTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + relevantTips.length) % relevantTips.length);
  };

  const currentTip = relevantTips[currentTipIndex];

  if (relevantTips.length === 0) return null;

  return (
    <>
      {/* Tips Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="btn-primary p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 floating"
            title="Show helpful tips"
            aria-label="Show helpful tips"
          >
            <span className="text-xl">💡</span>
            {!hasSeenTips && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </button>
        )}
      </div>

      {/* Tips Modal */}
      {isOpen && currentTip && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <div className="card shadow-2xl border-2 border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentTip.icon}</span>
                <div>
                  <h3 className="font-secondary font-semibold text-primary text-sm">
                    {currentTip.title}
                  </h3>
                  <p className="text-xs text-secondary">
                    Tip {currentTipIndex + 1} of {relevantTips.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-secondary hover:text-primary transition-colors p-1"
                title="Close tips"
                aria-label="Close tips"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-sm text-secondary leading-relaxed font-primary">
                {currentTip.content}
              </p>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium glass">
                {currentTip.category === 'navigation' && '🧭 Navigation'}
                {currentTip.category === 'chat' && '💬 Chat'}
                {currentTip.category === 'features' && '✨ Features'}
                {currentTip.category === 'shortcuts' && '⌨️ Shortcuts'}
              </span>
            </div>

            {/* Navigation */}
            {relevantTips.length > 1 && (
              <div className="flex items-center justify-between">
                <button
                  onClick={prevTip}
                  className="btn-secondary px-3 py-2 text-sm"
                  disabled={relevantTips.length <= 1}
                >
                  ← Previous
                </button>
                
                <div className="flex gap-1">
                  {relevantTips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTipIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTipIndex 
                          ? 'bg-primary-start scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to tip ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTip}
                  className="btn-secondary px-3 py-2 text-sm"
                  disabled={relevantTips.length <= 1}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={handleClose}
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Don't show again
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary px-3 py-1 text-xs"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for easy integration
export function useTips(currentPage: string) {
  return { TipsWidget: () => <TipsWidget currentPage={currentPage} /> };
}