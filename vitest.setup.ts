import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

type ResponsiveChildren = ReactNode | ((size: { width: number; height: number }) => ReactNode);

vi.mock('recharts', async () => {
  const React = await import('react');
  const Wrapper = ({ children }: { children?: ReactNode }) =>
    React.createElement('div', null, children);
  const Empty = () => null;

  return {
    Area: Empty,
    AreaChart: Wrapper,
    CartesianGrid: Empty,
    Line: Empty,
    LineChart: Wrapper,
    ResponsiveContainer: ({ children }: { children?: ResponsiveChildren }) =>
      React.createElement(
        'div',
        null,
        typeof children === 'function' ? children({ width: 720, height: 300 }) : children,
      ),
    Tooltip: Empty,
    XAxis: Empty,
    YAxis: Empty,
  };
});

class ResizeObserverMock {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: {
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            right: 720,
            bottom: 300,
            width: 720,
            height: 300,
            toJSON: () => ({}),
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }

  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
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

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 720,
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 300,
});

Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: () => ({
    x: 0,
    y: 0,
    width: 720,
    height: 300,
    top: 0,
    right: 720,
    bottom: 300,
    left: 0,
    toJSON: () => ({}),
  }),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(() => null),
});
