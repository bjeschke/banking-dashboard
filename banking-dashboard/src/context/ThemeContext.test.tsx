import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    // Reset matchMedia to default (light mode)
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide initial theme state', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBeDefined();
      expect(['light', 'dark']).toContain(result.current.theme);
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.isDark).toBe('boolean');
    });
  });

  describe('theme initialization', () => {
    it('should default to light theme when no preference stored', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should load theme from localStorage', () => {
      localStorage.setItem('banking-dashboard-theme', 'dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should respect system preference when no stored preference', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('banking-dashboard-theme', 'dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should persist theme to localStorage after toggle', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorage.getItem('banking-dashboard-theme')).toBe('dark');
    });

    it('should set data-theme attribute on document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('isDark computed property', () => {
    it('should return true when theme is dark', () => {
      localStorage.setItem('banking-dashboard-theme', 'dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(true);
    });

    it('should return false when theme is light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);
    });

    it('should update isDark when theme toggles', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('should ignore invalid stored values', () => {
      localStorage.setItem('banking-dashboard-theme', 'invalid-theme');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(['light', 'dark']).toContain(result.current.theme);
    });

    it('should save theme on every change', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.toggleTheme();
      });
      expect(localStorage.getItem('banking-dashboard-theme')).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });
      expect(localStorage.getItem('banking-dashboard-theme')).toBe('light');
    });
  });
});
