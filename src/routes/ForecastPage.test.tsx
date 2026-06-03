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
    const fetchMock = mockWeatherFetch();
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<ForecastPage />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('lat=38.9072')),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('lat=0'));
  });

  it('rejects shared Null Island coordinates and keeps the default location', async () => {
    const fetchMock = mockWeatherFetch();
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<ForecastPage />, '/?lat=0&lon=0&label=Shared%20location');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('lat=38.9072')),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('lat=0'));
  });

  it('accepts supported shared coordinates from the URL', async () => {
    const fetchMock = mockWeatherFetch();
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(<ForecastPage />, '/?lat=40.7128&lon=-74.006&label=New%20York');

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('lat=40.7128')),
    );
  });
});

function renderWithProviders(ui: ReactElement, route = '/') {
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
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </LocationProvider>
    </QueryClientProvider>,
  );
}

function mockWeatherFetch() {
  return vi.fn().mockResolvedValue(
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
}
