import { lazy, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPinned, RadioTower, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AlertsPanel } from '../components/AlertsPanel';
import { ForecastCards } from '../components/ForecastCards';
import { LocationSearch } from '../components/LocationSearch';
import { ErrorPanel, LoadingPanel } from '../components/StatusPanel';
import { useLocationState } from '../context/LocationContext';
import {
  compactLocationLabel,
  formatCoordinate,
  formatDateTime,
  formatPercent,
} from '../lib/format';
import {
  getAlerts,
  getForecast,
  getHourlyForecast,
  getPointMetadata,
} from '../services/weatherApi';
import type { LocationResult } from '../types/weather';

const HourlyCharts = lazy(() =>
  import('../components/HourlyCharts').then((module) => ({ default: module.HourlyCharts })),
);

export function ForecastPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation, recentLocations, selectLocation } = useLocationState();

  useEffect(() => {
    const rawLat = searchParams.get('lat');
    const rawLon = searchParams.get('lon');

    if (!rawLat || !rawLon) {
      return;
    }

    const lat = Number(rawLat);
    const lon = Number(rawLon);
    const label = searchParams.get('label') || 'Shared location';

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return;
    }

    if (
      Math.abs(selectedLocation.latitude - lat) < 0.0001 &&
      Math.abs(selectedLocation.longitude - lon) < 0.0001
    ) {
      return;
    }

    selectLocation({
      id: `url-${lat},${lon}`,
      label,
      name: compactLocationLabel(label),
      latitude: lat,
      longitude: lon,
      source: 'url',
    });
  }, [searchParams, selectLocation, selectedLocation.latitude, selectedLocation.longitude]);

  const pointQuery = useQuery({
    queryKey: ['nws-point', selectedLocation.latitude, selectedLocation.longitude],
    queryFn: () => getPointMetadata(selectedLocation.latitude, selectedLocation.longitude),
  });

  const forecastQuery = useQuery({
    queryKey: ['forecast', pointQuery.data?.forecastUrl],
    queryFn: () => getForecast(pointQuery.data?.forecastUrl ?? ''),
    enabled: Boolean(pointQuery.data?.forecastUrl),
  });

  const hourlyQuery = useQuery({
    queryKey: ['hourly', pointQuery.data?.hourlyForecastUrl],
    queryFn: () => getHourlyForecast(pointQuery.data?.hourlyForecastUrl ?? ''),
    enabled: Boolean(pointQuery.data?.hourlyForecastUrl),
  });

  const alertsQuery = useQuery({
    queryKey: ['alerts', selectedLocation.latitude, selectedLocation.longitude],
    queryFn: () => getAlerts(selectedLocation.latitude, selectedLocation.longitude),
  });

  function handleLocationSelect(location: LocationResult) {
    selectLocation(location);
    setSearchParams({
      lat: formatCoordinate(location.latitude),
      lon: formatCoordinate(location.longitude),
      label: compactLocationLabel(location.label),
    });
  }

  const currentPeriod = forecastQuery.data?.[0];
  const nextHour = hourlyQuery.data?.[0];
  const isInitialLoading = pointQuery.isLoading || forecastQuery.isLoading || hourlyQuery.isLoading;
  const hasDataError = pointQuery.isError || forecastQuery.isError || hourlyQuery.isError;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <LocationSearch onSelect={handleLocationSelect} recentLocations={recentLocations} />
          <section aria-labelledby="selected-location-heading" className="workspace-panel">
            <h2 id="selected-location-heading" className="section-heading">
              Selected point
            </h2>
            <p className="mt-2 text-lg font-semibold text-[#162536]">
              {compactLocationLabel(selectedLocation.label)}
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-[#dde3dc] pt-3">
                <dt className="flex items-center gap-2 font-medium text-[#52616f]">
                  <MapPinned aria-hidden="true" className="h-4 w-4" />
                  Coordinates
                </dt>
                <dd className="font-semibold text-[#162536]">
                  {formatCoordinate(selectedLocation.latitude)},{' '}
                  {formatCoordinate(selectedLocation.longitude)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#dde3dc] pt-3">
                <dt className="flex items-center gap-2 font-medium text-[#52616f]">
                  <RadioTower aria-hidden="true" className="h-4 w-4" />
                  Grid
                </dt>
                <dd className="font-semibold text-[#162536]">
                  {pointQuery.data
                    ? `${pointQuery.data.office} ${pointQuery.data.gridX},${pointQuery.data.gridY}`
                    : 'Resolving'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#dde3dc] pt-3">
                <dt className="flex items-center gap-2 font-medium text-[#52616f]">
                  <Clock aria-hidden="true" className="h-4 w-4" />
                  Time zone
                </dt>
                <dd className="font-semibold text-[#162536]">
                  {pointQuery.data?.timeZone || 'Not available'}
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-md border border-[#cfd8d0] bg-[#17324d] p-5 text-white shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b7d7d2]">
                  Forecast workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
                  {compactLocationLabel(selectedLocation.label)}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#dce7e4]">
                  Data from api.weather.gov, normalized into forecast periods, hourly charts, and
                  active alert summaries for the selected point.
                </p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                <HeroMetric label="Current period" value={currentPeriod?.name || 'Loading'} />
                <HeroMetric
                  label="Temperature"
                  value={
                    currentPeriod
                      ? `${currentPeriod.temperature}${currentPeriod.temperatureUnit}`
                      : 'Loading'
                  }
                />
                <HeroMetric
                  label="Next-hour precip"
                  value={nextHour ? formatPercent(nextHour.probabilityOfPrecipitation) : 'Loading'}
                />
              </dl>
            </div>
          </section>

          {isInitialLoading ? <LoadingPanel label="Loading NWS forecast data..." /> : null}

          {hasDataError ? (
            <ErrorPanel
              title="Forecast data unavailable"
              message="The selected point could not be resolved through the proxy and NWS API. Try another U.S. location or retry in a moment."
            />
          ) : null}

          <AlertsPanel alerts={alertsQuery.data ?? []} isLoading={alertsQuery.isLoading} />

          {forecastQuery.data ? <ForecastCards periods={forecastQuery.data} /> : null}

          {hourlyQuery.data ? (
            <Suspense fallback={<LoadingPanel label="Preparing hourly charts..." />}>
              <HourlyCharts points={hourlyQuery.data} />
            </Suspense>
          ) : null}

          <section className="workspace-panel">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#293949]">
              <RefreshCw aria-hidden="true" className="h-4 w-4 text-[#0b6e69]" />
              Data freshness
            </div>
            <p className="mt-2 text-sm leading-6 text-[#52616f]">
              Forecast and alert requests are cached through TanStack Query and proxy cache headers.
              The point-to-grid lookup is cached longer because NWS notes those mappings change
              infrequently.
            </p>
            {currentPeriod?.startTime ? (
              <p className="mt-3 text-xs font-medium text-[#66727d]">
                Current period starts {formatDateTime(currentPeriod.startTime)}.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/20 bg-white/10 p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b7d7d2]">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}
