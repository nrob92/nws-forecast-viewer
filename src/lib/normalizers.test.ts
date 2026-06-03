import { describe, expect, it } from 'vitest';
import {
  normalizeAlerts,
  normalizeForecast,
  normalizeHourly,
  normalizeLocationResults,
  normalizePointMetadata,
  normalizeSeverity,
} from './normalizers';

describe('normalizers', () => {
  it('normalizes Nominatim results into app locations', () => {
    const results = normalizeLocationResults([
      {
        place_id: 42,
        osm_type: 'relation',
        osm_id: 5396194,
        display_name: 'Washington, District of Columbia, United States',
        name: 'Washington',
        lat: '38.8950368',
        lon: '-77.0365427',
      },
    ]);

    expect(results).toEqual([
      expect.objectContaining({
        id: 'relation-5396194',
        name: 'Washington',
        latitude: 38.8950368,
        longitude: -77.0365427,
        source: 'nominatim',
      }),
    ]);
  });

  it('normalizes point metadata and forecast periods', () => {
    const point = normalizePointMetadata({
      properties: {
        gridId: 'LWX',
        gridX: 96,
        gridY: 70,
        forecast: 'https://api.weather.gov/gridpoints/LWX/96,70/forecast',
        forecastHourly: 'https://api.weather.gov/gridpoints/LWX/96,70/forecast/hourly',
        timeZone: 'America/New_York',
        relativeLocation: {
          properties: {
            city: 'Washington',
            state: 'DC',
          },
        },
      },
    });

    expect(point.office).toBe('LWX');
    expect(point.hourlyForecastUrl).toContain('/forecast/hourly');

    const periods = normalizeForecast({
      properties: {
        periods: [
          {
            number: 1,
            name: 'Today',
            startTime: '2026-06-03T08:00:00-04:00',
            endTime: '2026-06-03T18:00:00-04:00',
            isDaytime: true,
            temperature: 82,
            temperatureUnit: 'F',
            probabilityOfPrecipitation: { value: 40 },
            windSpeed: '10 mph',
            windDirection: 'S',
            shortForecast: 'Chance Showers',
            detailedForecast: 'A chance of showers after noon.',
          },
        ],
      },
    });

    expect(periods[0]).toEqual(
      expect.objectContaining({
        name: 'Today',
        probabilityOfPrecipitation: 40,
        windDirection: 'S',
      }),
    );
  });

  it('limits hourly periods and supplies chart labels', () => {
    const hourly = normalizeHourly(
      {
        properties: {
          periods: Array.from({ length: 3 }, (_, index) => ({
            startTime: `2026-06-03T0${index}:00:00-04:00`,
            temperature: 70 + index,
            temperatureUnit: 'F',
            probabilityOfPrecipitation: { value: null },
            shortForecast: 'Partly Cloudy',
          })),
        },
      },
      2,
    );

    expect(hourly).toHaveLength(2);
    expect(hourly[0].hourLabel).toMatch(/AM|PM/);
    expect(hourly[0].probabilityOfPrecipitation).toBeNull();
  });

  it('normalizes and sorts alerts by severity', () => {
    const alerts = normalizeAlerts({
      features: [
        {
          id: 'minor',
          properties: {
            event: 'Flood Advisory',
            headline: 'Flood Advisory issued',
            severity: 'Minor',
          },
        },
        {
          id: 'severe',
          properties: {
            event: 'Severe Thunderstorm Warning',
            headline: 'Severe Thunderstorm Warning issued',
            severity: 'Severe',
          },
        },
      ],
    });

    expect(alerts.map((alert) => alert.severity)).toEqual(['Severe', 'Minor']);
    expect(normalizeSeverity('Bogus')).toBe('Unknown');
  });
});
