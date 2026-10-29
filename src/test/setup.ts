import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';

// Polyfill window.matchMedia for headless tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeEach(() => {
  localStorage.clear();
});

