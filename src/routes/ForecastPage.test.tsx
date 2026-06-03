import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocationProvider } from '../context/LocationContext';
import { ForecastPage } from './ForecastPage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('ForecastPage URL location parsing', () => {
  it('uses the default location when the URL has no lat/lon query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          properties: {
            gridId: 'LWX',
            gridX: 96,
            gridY: 70,
            forecast: 'https://api.weather.gov/gridpoints/LWX/96,70/forecast',
            forecastHourly: 'https://api.weather.gov/gridpoints/LWX/96,70/forecast/hourly',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<ForecastPage />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('lat=38.9072')),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('lat=0'));
  });
});

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </LocationProvider>
    </QueryClientProvider>,
  );
}
