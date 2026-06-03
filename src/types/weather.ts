export type LocationResult = {
  id: string;
  label: string;
  name: string;
  latitude: number;
  longitude: number;
  source: 'nominatim' | 'preset' | 'url';
  attribution?: string;
};

export type NwsPointMetadata = {
  office: string;
  gridX: number;
  gridY: number;
  forecastUrl: string;
  hourlyForecastUrl: string;
  city?: string;
  state?: string;
  timeZone?: string;
  radarStation?: string;
};

export type ForecastPeriod = {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  probabilityOfPrecipitation: number | null;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  icon?: string;
};

export type HourlyPoint = {
  time: string;
  hourLabel: string;
  temperature: number;
  temperatureUnit: string;
  probabilityOfPrecipitation: number | null;
  windSpeed: string;
  shortForecast: string;
};

export type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';

export type AlertSummary = {
  id: string;
  event: string;
  headline: string;
  severity: AlertSeverity;
  urgency: string;
  certainty: string;
  areaDescription: string;
  effective: string;
  expires: string;
  description: string;
  instruction?: string;
};
