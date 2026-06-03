import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlertsPanel } from './AlertsPanel';
import { ForecastCards } from './ForecastCards';
import { HourlyCharts } from './HourlyCharts';
import { LocationSearch } from './LocationSearch';
import type { AlertSummary, ForecastPeriod, HourlyPoint } from '../types/weather';

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

const alert: AlertSummary = {
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
  instruction: 'Move indoors.',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('forecast components', () => {
  it('renders forecast period metrics', () => {
    render(<ForecastCards periods={forecast} />);

    expect(screen.getByRole('heading', { name: '7-day forecast' })).toBeInTheDocument();
    expect(screen.getByText('84F')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('renders hourly charts with accessible table content', () => {
    render(<HourlyCharts points={hourly} />);

    expect(screen.getByRole('img', { name: /hourly temperature/i })).toBeInTheDocument();
    expect(screen.getByText('Partly Cloudy')).toBeInTheDocument();
  });

  it('renders active and empty alert states', () => {
    const { rerender } = render(<AlertsPanel alerts={[]} />);

    expect(screen.getByText(/No active alerts/i)).toBeInTheDocument();

    rerender(<AlertsPanel alerts={[alert]} />);

    expect(screen.getByText(/Severe Thunderstorm Warning issued/i)).toBeInTheDocument();
  });

  it('searches locations on explicit submit and selects a result', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              place_id: 1,
              display_name: 'New York, New York, United States',
              name: 'New York',
              lat: '40.7128',
              lon: '-74.0060',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    renderWithQuery(<LocationSearch onSelect={onSelect} recentLocations={[]} />);

    await user.type(screen.getByLabelText(/city, state/i), '10001');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await user.click(await screen.findByRole('button', { name: /New York/i }));

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'New York' })),
    );
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
