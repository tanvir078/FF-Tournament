export const darkTheme = {
  background: '#111827',
  surface: '#1f2937',
  surfaceHover: '#374151',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#374151',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  cardGradient: 'linear-gradient(145deg, #1f2937 0%, #111827 100%)',
  glow: 'rgba(59, 130, 246, 0.5)',
};

export const lightTheme = {
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceHover: '#f3f4f6',
  text: '#111827',
  textSecondary: '#6b7280',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  border: '#e5e7eb',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  cardGradient: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
  glow: 'rgba(59, 130, 246, 0.3)',
};

export type Theme = typeof darkTheme;
