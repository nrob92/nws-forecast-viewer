import {
  normalizeAlerts,
  normalizeForecast,
  normalizeHourly,
  normalizeLocationResults,
  normalizePointMetadata,
} from '../lib/normalizers';
import type {
  AlertSummary,
  ForecastPeriod,
  HourlyPoint,
  LocationResult,
  NwsPointMetadata,
} from '../types/weather';

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const payload = await fetchJson(`/api/geocode?q=${encodeURIComponent(query)}`);
  return normalizeLocationResults(payload);
}

export async function getPointMetadata(
  latitude: number,
  longitude: number,
): Promise<NwsPointMetadata> {
  const payload = await fetchJson(
    `/api/nws?type=points&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
  );
  return normalizePointMetadata(payload);
}

export async function getForecast(forecastUrl: string): Promise<ForecastPeriod[]> {
  const payload = await fetchJson(`/api/nws?type=forecast&url=${encodeURIComponent(forecastUrl)}`);
  return normalizeForecast(payload);
}

export async function getHourlyForecast(hourlyUrl: string): Promise<HourlyPoint[]> {
  const payload = await fetchJson(`/api/nws?type=hourly&url=${encodeURIComponent(hourlyUrl)}`);
  return normalizeHourly(payload);
}

export async function getAlerts(latitude: number, longitude: number): Promise<AlertSummary[]> {
  const payload = await fetchJson(
    `/api/nws?type=alerts&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
  );
  return normalizeAlerts(payload);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    let message: string;

    try {
      const errorPayload = (await response.json()) as { error?: string };
      message = errorPayload.error || fallbackMessage;
    } catch (error) {
      throw new Error(fallbackMessage, { cause: error });
    }

    throw new Error(message);
  }

  return response.json();
}
