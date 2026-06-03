import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDateTime } from '../lib/format';
import { alertSeverityClass } from '../lib/normalizers';
import type { AlertSummary } from '../types/weather';

type AlertsPanelProps = {
  alerts: AlertSummary[];
  isLoading?: boolean;
};

export function AlertsPanel({ alerts, isLoading = false }: AlertsPanelProps) {
  return (
    <section
      aria-labelledby="alerts-heading"
      aria-live="polite"
      aria-atomic="false"
      className="workspace-panel"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="alerts-heading" className="section-heading">
            Active alerts
          </h2>
          <p className="section-copy">Watches, warnings, and advisories for the selected point.</p>
        </div>
        <AlertTriangle aria-hidden="true" className="mt-1 h-5 w-5 text-[#d97706]" />
      </div>

      {isLoading ? <p className="status-muted">Checking active alerts...</p> : null}

      {!isLoading && alerts.length === 0 ? (
        <div className="flex items-start gap-3 rounded-md border border-[#cfd8d0] bg-white p-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-[#0b6e69]" />
          <div>
            <p className="font-semibold text-[#162536]">No active alerts for this point.</p>
            <p className="text-sm text-[#66727d]">Alert status updates as NWS data refreshes.</p>
          </div>
        </div>
      ) : null}

      {alerts.length > 0 ? (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <details className={`rounded-md border p-4 ${alertSeverityClass(alert.severity)}`}>
                <summary className="cursor-pointer text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#0b6e69] focus-visible:ring-offset-2">
                  {alert.event}: {alert.headline}
                </summary>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold">Severity</dt>
                    <dd>{alert.severity}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Urgency</dt>
                    <dd>{alert.urgency}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Effective</dt>
                    <dd>{formatDateTime(alert.effective)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Expires</dt>
                    <dd>{formatDateTime(alert.expires)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-6">{alert.description}</p>
                {alert.instruction ? (
                  <p className="mt-3 text-sm font-semibold leading-6">{alert.instruction}</p>
                ) : null}
                <p className="mt-3 text-xs font-medium">Area: {alert.areaDescription}</p>
              </details>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
