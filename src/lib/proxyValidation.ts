const NWS_BASE_URL = 'https://api.weather.gov';
const POINT_PATH_PATTERN = /^\/points\/-?\d+(?:\.\d{1,4})?,-?\d+(?:\.\d{1,4})?$/;
const GRID_FORECAST_PATTERN = /^\/gridpoints\/[A-Z0-9]{3}\/\d+,\d+\/forecast(?:\/hourly)?$/;

export type NwsRequestType = 'points' | 'forecast' | 'hourly' | 'alerts';

export function buildNwsApiUrl(params: URLSearchParams): string {
  const type = params.get('type') as NwsRequestType | null;

  switch (type) {
    case 'points':
      return `${NWS_BASE_URL}/points/${formatNwsCoordinate(
        requireCoordinate(params.get('lat'), 'lat', -90, 90),
      )},${formatNwsCoordinate(requireCoordinate(params.get('lon'), 'lon', -180, 180))}`;
    case 'alerts': {
      const lat = formatNwsCoordinate(requireCoordinate(params.get('lat'), 'lat', -90, 90));
      const lon = formatNwsCoordinate(requireCoordinate(params.get('lon'), 'lon', -180, 180));
      return `${NWS_BASE_URL}/alerts/active?point=${lat},${lon}`;
    }
    case 'forecast':
    case 'hourly':
      return validateNwsGridUrl(requireParam(params.get('url'), 'url'), type);
    default:
      throw new Error('Unsupported NWS request type');
  }
}

export function validateNwsGridUrl(rawUrl: string, type: 'forecast' | 'hourly') {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid NWS URL');
  }

  if (url.origin !== NWS_BASE_URL) {
    throw new Error('NWS URL must target api.weather.gov');
  }

  if (url.search || url.hash || !GRID_FORECAST_PATTERN.test(url.pathname)) {
    throw new Error('NWS URL path is not allowed');
  }

  if (type === 'forecast' && url.pathname.endsWith('/hourly')) {
    throw new Error('Hourly URL cannot be used for forecast request');
  }

  if (type === 'hourly' && !url.pathname.endsWith('/hourly')) {
    throw new Error('Forecast URL cannot be used for hourly request');
  }

  return url.toString();
}

export function isAllowedNwsUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    return (
      url.origin === NWS_BASE_URL &&
      !url.hash &&
      (POINT_PATH_PATTERN.test(url.pathname) || GRID_FORECAST_PATTERN.test(url.pathname))
    );
  } catch {
    return false;
  }
}

export function formatNwsCoordinate(value: number) {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function requireParam(value: string | null, label: string) {
  if (!value) {
    throw new Error(`Missing ${label} parameter`);
  }

  return value;
}

function requireCoordinate(value: string | null, label: string, min: number, max: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`Invalid ${label} coordinate`);
  }

  return parsed;
}
