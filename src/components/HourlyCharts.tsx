import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Droplets, Thermometer } from 'lucide-react';
import { formatDateTime, formatPercent } from '../lib/format';
import type { HourlyPoint } from '../types/weather';

type HourlyChartsProps = {
  points: HourlyPoint[];
};

export function HourlyCharts({ points }: HourlyChartsProps) {
  const chartData = points.slice(0, 24).map((point) => ({
    ...point,
    precip: point.probabilityOfPrecipitation ?? 0,
  }));

  return (
    <section aria-labelledby="hourly-heading" className="workspace-panel">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="hourly-heading" className="section-heading">
            Hourly meteogram
          </h2>
          <p className="section-copy">
            First 24 hours, with table data available to assistive tech.
          </p>
        </div>
        <Activity aria-hidden="true" className="mt-1 h-5 w-5 text-[#0b6e69]" />
      </div>

      {chartData.length === 0 ? (
        <p className="status-muted">Hourly forecast data is not available.</p>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#293949]">
              <Thermometer aria-hidden="true" className="h-4 w-4 text-[#0b6e69]" />
              Temperature
            </h3>
            <div
              className="h-72 rounded-md border border-[#d8dfd7] bg-white p-2"
              role="img"
              aria-label="Line chart showing hourly temperature for the next 24 hours."
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
                <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#e4e8e2" strokeDasharray="3 3" />
                  <XAxis dataKey="hourLabel" tick={{ fill: '#52616f', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#52616f', fontSize: 12 }} width={32} />
                  <Tooltip contentStyle={{ borderRadius: 6, borderColor: '#cfd8d0' }} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#0b6e69"
                    strokeWidth={3}
                    dot={false}
                    name="Temp"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#293949]">
              <Droplets aria-hidden="true" className="h-4 w-4 text-[#0b6e69]" />
              Precipitation probability
            </h3>
            <div
              className="h-72 rounded-md border border-[#d8dfd7] bg-white p-2"
              role="img"
              aria-label="Area chart showing hourly precipitation probability for the next 24 hours."
            >
              <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
                <AreaChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#e4e8e2" strokeDasharray="3 3" />
                  <XAxis dataKey="hourLabel" tick={{ fill: '#52616f', fontSize: 12 }} />
                  <YAxis
                    tick={{ fill: '#52616f', fontSize: 12 }}
                    width={32}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 6, borderColor: '#cfd8d0' }}
                    formatter={(value) => [`${value}%`, 'Precip']}
                  />
                  <Area
                    type="monotone"
                    dataKey="precip"
                    stroke="#d97706"
                    fill="#f3c66f"
                    fillOpacity={0.5}
                    name="Precip"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <table className="sr-only">
        <caption>Hourly temperature and precipitation values</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Temperature</th>
            <th scope="col">Precipitation</th>
            <th scope="col">Forecast</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((point) => (
            <tr key={point.time}>
              <td>{formatDateTime(point.time)}</td>
              <td>
                {point.temperature}
                {point.temperatureUnit}
              </td>
              <td>{formatPercent(point.probabilityOfPrecipitation)}</td>
              <td>{point.shortForecast}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
