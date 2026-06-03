import type {
  AlertSeverity,
  AlertSummary,
  ForecastPeriod,
  HourlyPoint,
  LocationResult,
  NwsPointMetadata,
} from '../types/weather';

export const OSM_ATTRIBUTION = 'Geocoding data © OpenStreetMap contributors';

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  display_name?: string;
  name?: string;
  lat?: string;
  lon?: string;
  licence?: string;
};

type NwsPeriod = {
  number?: number;
  name?: string;
  startTime?: string;
  endTime?: string;
  isDaytime?: boolean;
  temperature?: number;
  temperatureUnit?: string;
  probabilityOfPrecipitation?: {
    value?: number | null;
  };
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
  detailedForecast?: string;
  icon?: string;
};

const severityRank: Record<AlertSeverity, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

export function normalizeLocationResults(payload: unknown): LocationResult[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item): LocationResult | null => {
      const result = item as NominatimResult;
      const latitude = Number(result.lat);
      const longitude = Number(result.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !result.display_name) {
        return null;
      }

      const stableId =
        result.osm_type && result.osm_id
          ? `${result.osm_type}-${result.osm_id}`
          : `place-${result.place_id ?? `${latitude},${longitude}`}`;

      return {
        id: stableId,
        label: result.display_name,
        name: result.name || result.display_name.split(',')[0] || result.display_name,
        latitude,
        longitude,
        source: 'nominatim',
        attribution: result.licence || OSM_ATTRIBUTION,
      };
    })
    .filter((result): result is LocationResult => result !== null);
}

export function normalizePointMetadata(payload: unknown): NwsPointMetadata {
  const properties = readRecord(readRecord(payload).properties);
  const relativeLocation = readRecord(readRecord(properties.relativeLocation).properties);

  return {
    office: requireString(properties.gridId, 'Forecast office'),
    gridX: requireNumber(properties.gridX, 'Grid X'),
    gridY: requireNumber(properties.gridY, 'Grid Y'),
    forecastUrl: requireString(properties.forecast, 'Forecast URL'),
    hourlyForecastUrl: requireString(properties.forecastHourly, 'Hourly forecast URL'),
    city: optionalString(relativeLocation.city),
    state: optionalString(relativeLocation.state),
    timeZone: optionalString(properties.timeZone),
    radarStation: optionalString(properties.radarStation),
  };
}

export function normalizeForecast(payload: unknown): ForecastPeriod[] {
  const periods = readPeriods(payload);

  return periods.map((period, index) => ({
    number: period.number ?? index + 1,
    name: period.name || `Period ${index + 1}`,
    startTime: period.startTime || '',
    endTime: period.endTime || '',
    isDaytime: Boolean(period.isDaytime),
    temperature: typeof period.temperature === 'number' ? period.temperature : 0,
    temperatureUnit: period.temperatureUnit || 'F',
    probabilityOfPrecipitation: normalizePrecip(period.probabilityOfPrecipitation?.value),
    windSpeed: period.windSpeed || 'Not available',
    windDirection: period.windDirection || '',
    shortForecast: period.shortForecast || 'Forecast unavailable',
    detailedForecast: period.detailedForecast || '',
    icon: period.icon,
  }));
}

export function normalizeHourly(payload: unknown, limit = 48): HourlyPoint[] {
  const periods = readPeriods(payload).slice(0, limit);

  return periods.map((period) => ({
    time: period.startTime || '',
    hourLabel: period.startTime
      ? new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(new Date(period.startTime))
      : 'Hour',
    temperature: typeof period.temperature === 'number' ? period.temperature : 0,
    temperatureUnit: period.temperatureUnit || 'F',
    probabilityOfPrecipitation: normalizePrecip(period.probabilityOfPrecipitation?.value),
    windSpeed: period.windSpeed || 'Not available',
    shortForecast: period.shortForecast || 'Forecast unavailable',
  }));
}

export function normalizeAlerts(payload: unknown): AlertSummary[] {
  const features = readRecord(payload).features;

  if (!Array.isArray(features)) {
    return [];
  }

  return features
    .map((feature, index): AlertSummary | null => {
      const properties = readRecord(readRecord(feature).properties);
      const event = optionalString(properties.event);
      const headline = optionalString(properties.headline) || event;

      if (!event || !headline) {
        return null;
      }

      return {
        id:
          optionalString(readRecord(feature).id) ||
          optionalString(properties.id) ||
          `alert-${index}`,
        event,
        headline,
        severity: normalizeSeverity(properties.severity),
        urgency: optionalString(properties.urgency) || 'Unknown',
        certainty: optionalString(properties.certainty) || 'Unknown',
        areaDescription: optionalString(properties.areaDesc) || 'Area not provided',
        effective: optionalString(properties.effective) || '',
        expires: optionalString(properties.expires) || '',
        description: optionalString(properties.description) || '',
        instruction: optionalString(properties.instruction),
      };
    })
    .filter((alert): alert is AlertSummary => alert !== null)
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

export function normalizeSeverity(value: unknown): AlertSeverity {
  if (value === 'Extreme' || value === 'Severe' || value === 'Moderate' || value === 'Minor') {
    return value;
  }

  return 'Unknown';
}

export function alertSeverityClass(severity: AlertSeverity) {
  switch (severity) {
    case 'Extreme':
      return 'border-red-700 bg-red-50 text-red-950';
    case 'Severe':
      return 'border-orange-700 bg-orange-50 text-orange-950';
    case 'Moderate':
      return 'border-amber-600 bg-amber-50 text-amber-950';
    case 'Minor':
      return 'border-sky-600 bg-sky-50 text-sky-950';
    case 'Unknown':
      return 'border-zinc-400 bg-zinc-50 text-zinc-900';
  }
}

function readPeriods(payload: unknown): NwsPeriod[] {
  const periods = readRecord(readRecord(payload).properties).periods;
  return Array.isArray(periods) ? (periods as NwsPeriod[]) : [];
}

function normalizePrecip(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function requireString(value: unknown, label: string) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} missing from NWS response`);
  }

  return value;
}

function requireNumber(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} missing from NWS response`);
  }

  return value;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
