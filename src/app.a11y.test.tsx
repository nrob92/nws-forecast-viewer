import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { AlertsPanel } from './components/AlertsPanel';
import { AppShell } from './components/AppShell';
import { ForecastCards } from './components/ForecastCards';
import { HourlyCharts } from './components/HourlyCharts';
import { LocationSearch } from './components/LocationSearch';
import type { AlertSummary, ForecastPeriod, HourlyPoint } from './types/weather';

const forecast: ForecastPeriod[] = [
  {
    number: 1,
    name: 'Today',
    startTime: '2026-06-03T08:00:00-04:00',
    endTime: '2026-06-03T18:00:00-04:00',
    isDaytime: true,
    temperature: 84,
    temperatureUnit: 'F',
    probabilityOfPrecipitation: 30,
    windSpeed: '8 mph',
    windDirection: 'SW',
    shortForecast: 'Chance Showers',
    detailedForecast: 'A chance of showers.',
  },
];

const hourly: HourlyPoint[] = [
  {
    time: '2026-06-03T08:00:00-04:00',
    hourLabel: '8 AM',
    temperature: 72,
    temperatureUnit: 'F',
    probabilityOfPrecipitation: 20,
    windSpeed: '5 mph',
    shortForecast: 'Partly Cloudy',
  },
];

const alerts: AlertSummary[] = [
  {
    id: 'alert-1',
    event: 'Severe Thunderstorm Warning',
    headline: 'Severe Thunderstorm Warning issued',
    severity: 'Severe',
    urgency: 'Immediate',
    certainty: 'Likely',
    areaDescription: 'District of Columbia',
    effective: '2026-06-03T14:00:00-04:00',
    expires: '2026-06-03T15:00:00-04:00',
    description: 'Severe thunderstorms are moving through the area.',
  },
];

describe('accessibility', () => {
  it('has no axe violations in the app shell', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div className="p-4">Forecast workspace test content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('has no axe violations in search and forecast surfaces', async () => {
    const { container } = renderWithQuery(
      <div>
        <LocationSearch onSelect={() => {}} recentLocations={[]} />
        <ForecastCards periods={forecast} />
        <HourlyCharts points={hourly} />
      </div>,
    );

    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('has no axe violations in the alerts panel', async () => {
    const { container } = render(<AlertsPanel alerts={alerts} />);

    expect((await axe(container)).violations).toHaveLength(0);
  });
});

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}
