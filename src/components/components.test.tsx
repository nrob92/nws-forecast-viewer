import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiForecastPanel } from './AiForecastPanel';
import { AlertsPanel } from './AlertsPanel';
import { ForecastCards } from './ForecastCards';
import { HourlyCharts } from './HourlyCharts';
import { LocationSearch } from './LocationSearch';
import type { AlertSummary, ForecastPeriod, HourlyPoint } from '../types/weather';
import type { ForecastAiContext } from '../lib/aiContext';

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

  it('requests AI summary and question answers with provided forecast context', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ text: 'Rain likely after 3 PM. Wind advisory until 8 PM.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ text: 'Yes, the forecast data shows rain likely.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    );

    renderWithQuery(<AiForecastPanel context={aiContext} />);

    await user.click(screen.getByRole('button', { name: /summarize/i }));
    expect(await screen.findByText(/Rain likely after 3 PM/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/forecast summary or question/i), 'Do I need an umbrella?');
    await user.click(screen.getByRole('button', { name: /^ask$/i }));
    expect(await screen.findByText(/forecast data shows rain likely/i)).toBeInTheDocument();

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      '/api/ai',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"mode":"summary"'),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/ai',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"question":"Do I need an umbrella?"'),
      }),
    );
  });

  it('fills the prompt when a rotating example question is selected', async () => {
    const user = userEvent.setup();

    renderWithQuery(<AiForecastPanel context={aiContext} />);

    await user.click(
      screen.getByRole('button', { name: /use example question: do i need an umbrella tomorrow/i }),
    );

    expect(screen.getByLabelText(/forecast summary or question/i)).toHaveValue(
      'Do I need an umbrella tomorrow?',
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

const aiContext: ForecastAiContext = {
  location: {
    label: 'Washington, District of Columbia, United States',
    latitude: 38.9072,
    longitude: -77.0369,
  },
  forecastPeriods: [
    {
      name: 'Today',
      startTime: '2026-06-03T08:00:00-04:00',
      endTime: '2026-06-03T18:00:00-04:00',
      temperature: '82F',
      precipitation: 60,
      wind: '12 mph NW',
      shortForecast: 'Showers Likely',
      detailedForecast: 'Showers likely after 3pm.',
    },
  ],
  alerts: [
    {
      event: 'Wind Advisory',
      headline: 'Wind Advisory until 8 PM',
      severity: 'Minor',
      urgency: 'Expected',
      expires: '2026-06-03T20:00:00-04:00',
      description: 'Gusty winds expected.',
    },
  ],
};
