import type { Handler } from '@netlify/functions';
import { buildNwsApiUrl } from '../../src/lib/proxyValidation';

const DEFAULT_USER_AGENT = 'nws-forecast-viewer-demo/1.0';

export const handler: Handler = async (event) => {
  let targetUrl: string;

  try {
    targetUrl = buildNwsApiUrl(new URLSearchParams(event.rawQuery || ''));
  } catch (error) {
    return jsonResponse(400, {
      error: error instanceof Error ? error.message : 'Invalid NWS request.',
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: 'application/geo+json',
        'User-Agent': process.env.NWS_USER_AGENT || DEFAULT_USER_AGENT,
      },
    });

    const body = await response.text();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: 'The National Weather Service API did not return forecast data for this request.',
      });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': cacheHeaderFor(targetUrl),
      },
      body,
    };
  } catch {
    return jsonResponse(502, {
      error: 'Unable to reach api.weather.gov right now.',
    });
  }
};

function cacheHeaderFor(url: string) {
  if (url.includes('/points/')) {
    return 'public, max-age=86400, stale-while-revalidate=86400';
  }

  if (url.includes('/alerts/active')) {
    return 'public, max-age=60, stale-while-revalidate=300';
  }

  return 'public, max-age=900, stale-while-revalidate=1800';
}

function jsonResponse(statusCode: number, payload: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  };
}
