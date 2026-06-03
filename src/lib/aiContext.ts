import type { AlertSummary, ForecastPeriod, LocationResult } from '../types/weather';

export type ForecastAiContext = {
  location: {
    label: string;
    latitude: number;
    longitude: number;
  };
  forecastPeriods: Array<{
    name: string;
    startTime: string;
    endTime: string;
    temperature: string;
    precipitation: number | null;
    wind: string;
    shortForecast: string;
    detailedForecast: string;
  }>;
  alerts: Array<{
    event: string;
    headline: string;
    severity: string;
    urgency: string;
    expires: string;
    description: string;
    instruction?: string;
  }>;
};

export function buildForecastAiContext(
  location: LocationResult,
  forecastPeriods: ForecastPeriod[],
  alerts: AlertSummary[],
): ForecastAiContext {
  return {
    location: {
      label: location.label,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    forecastPeriods: forecastPeriods.slice(0, 14).map((period) => ({
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime,
      temperature: `${period.temperature}${period.temperatureUnit}`,
      precipitation: period.probabilityOfPrecipitation,
      wind: `${period.windSpeed} ${period.windDirection}`.trim(),
      shortForecast: period.shortForecast,
      detailedForecast: period.detailedForecast,
    })),
    alerts: alerts.slice(0, 8).map((alert) => ({
      event: alert.event,
      headline: alert.headline,
      severity: alert.severity,
      urgency: alert.urgency,
      expires: alert.expires,
      description: alert.description,
      instruction: alert.instruction,
    })),
  };
}
