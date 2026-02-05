// Login Page - Future of Commerce Theme
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { TipsWidget } from '../components/TipsWidget';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Route } from './+types/login';
import '../styles/theme.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Login - Future Commerce' },
    { name: 'description', content: 'Sign in to access AI-powered customer support' },
  ];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize theme
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'var(--bg-light)' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 gradient-primary rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 gradient-ocean rounded-full opacity-8 blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 gradient-primary rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative max-w-lg w-full my-8">
        {/* Theme Toggle */}
        <div className="absolute top-0 right-5 z-10 rounded-2xl" style={{ marginBottom: '5px', marginLeft: '5px' }}>
          <ThemeToggle showLabel={false} size="lg" />
        </div>

        {/* Main Card */}
        <div className="glass p-8 rounded-3xl shadow-2xl" style={{ borderRadius: '2rem', backdropFilter: 'blur(20px)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center text-3xl shadow-xl">
              🚀
            </div>
            <h1 className="font-secondary text-3xl font-bold text-primary mb-3">
              Welcome Back
            </h1>
            <p className="text-secondary font-primary text-base leading-relaxed">
              Sign in to access your AI-powered customer support
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="glass p-4 rounded-2xl border-red-400/30 bg-red-50/80 backdrop-blur-12 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span className="text-red-700 font-medium text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2 font-primary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full text-base py-4 px-6 rounded-2xl shadow-lg"
                placeholder="you@example.com"
                style={{ fontSize: '16px', height: '50px', width: '100%', display: 'block' }}
              />
            </div>

            <div className="w-full">
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2 font-primary">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input w-full text-base py-4 px-6 rounded-2xl shadow-lg"
                placeholder="Enter your password"
                style={{ fontSize: '16px', height: '50px', width: '100%', display: 'block' }}
              />
            </div>

            <div className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-base font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{ height: '55px', fontSize: '16px', width: '100%', display: 'block' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="loading-dots">
                      <div className="loading-dot bg-white"></div>
                      <div className="loading-dot bg-white"></div>
                      <div className="loading-dot bg-white"></div>
                    </div>
                    <span className="text-base">Signing you in...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <span className="text-xl">🔐</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
              <span className="text-secondary text-sm font-primary px-2">or</span>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            </div>
            
            <p className="text-secondary font-primary text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary font-bold hover:opacity-80 transition-opacity text-base"
                style={{ 
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* System Status Preview */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-secondary mb-4 font-primary font-semibold">
              System Status:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-secondary p-2 glass rounded-lg">
                <span className="text-green-400 text-sm">🟢</span>
                <span className="font-medium">AI Online</span>
              </div>
              <div className="flex items-center gap-2 text-secondary p-2 glass rounded-lg">
                <span className="text-green-400 text-sm">🟢</span>
                <span className="font-medium">RAG Active</span>
              </div>
              <div className="flex items-center gap-2 text-secondary p-2 glass rounded-lg">
                <span className="text-green-400 text-sm">🟢</span>
                <span className="font-medium">99.2% Uptime</span>
              </div>
              <div className="flex items-center gap-2 text-secondary p-2 glass rounded-lg">
                <span className="text-green-400 text-sm">🟢</span>
                <span className="font-medium">Fast Response</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Widget */}
      <TipsWidget currentPage="login" />
    </div>
  );
}

