import '@testing-library/jest-dom';

// Mock ResizeObserver which is not available in jsdom
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};