import { describe, expect, it } from 'vitest';
import {
  buildNwsApiUrl,
  formatNwsCoordinate,
  isAllowedNwsUrl,
  validateNwsGridUrl,
} from './proxyValidation';

describe('proxy validation', () => {
  it('builds rounded point and alert URLs', () => {
    expect(
      buildNwsApiUrl(new URLSearchParams({ type: 'points', lat: '38.907245', lon: '-77.03695' })),
    ).toBe('https://api.weather.gov/points/38.9072,-77.037');

    expect(
      buildNwsApiUrl(new URLSearchParams({ type: 'alerts', lat: '38.9072', lon: '-77.0369' })),
    ).toBe('https://api.weather.gov/alerts/active?point=38.9072,-77.0369');
  });

  it('validates grid forecast URLs by origin, path, and request type', () => {
    expect(
      validateNwsGridUrl('https://api.weather.gov/gridpoints/LWX/96,70/forecast', 'forecast'),
    ).toBe('https://api.weather.gov/gridpoints/LWX/96,70/forecast');

    expect(() =>
      validateNwsGridUrl(
        'https://api.weather.gov/gridpoints/LWX/96,70/forecast/hourly',
        'forecast',
      ),
    ).toThrow('Hourly URL');

    expect(() =>
      validateNwsGridUrl('https://example.com/gridpoints/LWX/96,70/forecast', 'forecast'),
    ).toThrow('api.weather.gov');
  });

  it('checks allowed NWS URLs and coordinate formatting', () => {
    expect(isAllowedNwsUrl('https://api.weather.gov/points/38.9072,-77.0369')).toBe(true);
    expect(isAllowedNwsUrl('https://api.weather.gov/radar/stations')).toBe(false);
    expect(formatNwsCoordinate(38.9)).toBe('38.9');
  });
});
