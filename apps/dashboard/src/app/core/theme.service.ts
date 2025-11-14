import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  readonly currentTheme = signal<Theme>('dark');

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const initialTheme = this.getInitialTheme();
      this.currentTheme.set(initialTheme);
      this.applyTheme(initialTheme);

      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (typeof localStorage !== 'undefined' && !localStorage.getItem(this.THEME_KEY)) {
            this.setTheme(e.matches ? 'dark' : 'light', false);
          }
        });
      }
    }
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'dark';
    }
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme, true);
  }

  setTheme(theme: Theme, save = true): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (save && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}

