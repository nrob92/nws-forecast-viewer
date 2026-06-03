import { describe, expect, it } from 'vitest';
import { buildForecastAiContext } from './aiContext';
import type { AlertSummary, ForecastPeriod, LocationResult } from '../types/weather';

describe('buildForecastAiContext', () => {
  it('keeps AI context structured and limited to loaded data', () => {
    const location: LocationResult = {
      id: 'washington',
      label: 'Washington, District of Columbia, United States',
      name: 'Washington, DC',
      latitude: 38.9072,
      longitude: -77.0369,
      source: 'preset',
    };
    const forecastPeriods: ForecastPeriod[] = [
      {
        number: 1,
        name: 'Today',
        startTime: '2026-06-03T08:00:00-04:00',
        endTime: '2026-06-03T18:00:00-04:00',
        isDaytime: true,
        temperature: 82,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: 60,
        windSpeed: '12 mph',
        windDirection: 'NW',
        shortForecast: 'Showers Likely',
        detailedForecast: 'Showers likely after 3pm.',
      },
    ];
    const alerts: AlertSummary[] = [
      {
        id: 'wind',
        event: 'Wind Advisory',
        headline: 'Wind Advisory until 8 PM',
        severity: 'Minor',
        urgency: 'Expected',
        certainty: 'Likely',
        areaDescription: 'District of Columbia',
        effective: '2026-06-03T12:00:00-04:00',
        expires: '2026-06-03T20:00:00-04:00',
        description: 'Gusty winds expected.',
      },
    ];

    expect(buildForecastAiContext(location, forecastPeriods, alerts)).toEqual({
      location: {
        label: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
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
          instruction: undefined,
        },
      ],
    });
  });
});
