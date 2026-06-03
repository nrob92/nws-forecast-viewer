import type { Handler } from '@netlify/functions';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_USER_AGENT = 'nws-forecast-viewer-demo/1.0';
const CACHE_TTL_MS = 10 * 60 * 1000;
const COUNTRY_CODES = 'us,pr,vi,gu,mp,as';

type CacheEntry = {
  expiresAt: number;
  body: string;
};

const cache = new Map<string, CacheEntry>();

export const handler: Handler = async (event) => {
  const query = event.queryStringParameters?.q?.trim();

  if (!query || query.length < 2) {
    return jsonResponse(400, { error: 'Enter at least two characters to search.' });
  }

  const cacheKey = query.toLocaleLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return textResponse(200, cached.body);
  }

  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', COUNTRY_CODES);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          process.env.NOMINATIM_USER_AGENT || process.env.NWS_USER_AGENT || DEFAULT_USER_AGENT,
      },
    });

    const body = await response.text();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: 'The geocoding service is unavailable. Try a city, state, ZIP, or coordinates.',
      });
    }

    cache.set(cacheKey, {
      body,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return textResponse(200, body);
  } catch {
    return jsonResponse(502, {
      error: 'Unable to reach the geocoding service right now.',
    });
  }
};

function textResponse(statusCode: number, body: string) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
    },
    body,
  };
}

function jsonResponse(statusCode: number, payload: unknown) {
  return textResponse(statusCode, JSON.stringify(payload));
}
