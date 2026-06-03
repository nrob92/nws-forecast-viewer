import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatDateTime, formatPercent } from '../lib/format';
import type { ForecastPeriod } from '../types/weather';

type ForecastCardsProps = {
  periods: ForecastPeriod[];
};

export function ForecastCards({ periods }: ForecastCardsProps) {
  if (periods.length === 0) {
    return <EmptyPanel title="7-day forecast" message="Forecast periods are not available." />;
  }

  return (
    <section aria-labelledby="forecast-heading" className="workspace-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="forecast-heading" className="section-heading">
            7-day forecast
          </h2>
          <p className="section-copy">Period forecasts from the issuing NWS office.</p>
        </div>
        <Cloud aria-hidden="true" className="mt-1 h-5 w-5 text-[#0b6e69]" />
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {periods.slice(0, 8).map((period) => (
          <li key={period.number}>
            <article className="h-full rounded-md border border-[#d8dfd7] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[#162536]">{period.name}</h3>
                  <p className="text-xs text-[#66727d]">{formatDateTime(period.startTime)}</p>
                </div>
                <span className="rounded bg-[#eef4f0] px-2 py-1 text-xs font-semibold text-[#0b5f5a]">
                  {period.isDaytime ? 'Day' : 'Night'}
                </span>
              </div>
              <p className="mb-4 text-sm leading-6 text-[#334554]">{period.shortForecast}</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Metric
                  icon={<Thermometer aria-hidden="true" className="h-4 w-4" />}
                  label="Temperature"
                  value={`${period.temperature}${period.temperatureUnit}`}
                />
                <Metric
                  icon={<Droplets aria-hidden="true" className="h-4 w-4" />}
                  label="Precip"
                  value={formatPercent(period.probabilityOfPrecipitation)}
                />
                <Metric
                  icon={<Wind aria-hidden="true" className="h-4 w-4" />}
                  label="Wind"
                  value={`${period.windSpeed} ${period.windDirection}`.trim()}
                  wide
                />
              </dl>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  wide = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2' : undefined}>
      <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#66727d]">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold text-[#162536]">{value}</dd>
    </div>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="workspace-panel">
      <h2 className="section-heading">{title}</h2>
      <p className="status-muted">{message}</p>
    </section>
  );
}
