import { CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-md border border-[#cfd8d0] bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b6e69]">
          Project context
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#102033]">
          Accessible forecast visualization demo
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#52616f]">
          This app demonstrates a React, TypeScript, Tailwind, REST, and charting workflow around
          public weather data. It is a personal demo using the public NWS API. Not affiliated with
          or endorsed by NOAA/NWS.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="workspace-panel">
          <h2 className="section-heading">Technical decisions</h2>
          <ul className="mt-4 space-y-4 text-sm leading-6 text-[#334554]">
            <Decision
              title="Tailwind CSS"
              text="Utility classes keep a dense operational interface consistent without a larger component framework."
            />
            <Decision
              title="TanStack Query"
              text="Forecast, hourly, point, and alert calls have independent caching and error states."
            />
            <Decision
              title="Recharts"
              text="Recharts provides quick, readable meteogram-style charts while keeping implementation complexity modest."
            />
            <Decision
              title="Netlify Functions"
              text="The proxy supplies descriptive request headers and validates upstream NWS URLs before fetching."
            />
          </ul>
        </section>

        <section className="workspace-panel">
          <div className="flex items-start justify-between gap-4">
            <h2 className="section-heading">Accessibility statement</h2>
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#0b6e69]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[#334554]">
            The interface targets Section 508 and WCAG 2.1 AA through semantic landmarks, labeled
            controls, keyboard-visible focus, sufficient contrast, alert live regions, and chart
            data tables for screen reader parity.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#334554]">
            <li className="flex gap-2">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 text-[#0b6e69]" />
              Automated axe checks are available with npm run test:a11y.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 text-[#0b6e69]" />
              Keyboard-only flow is supported from search through alert details.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 text-[#0b6e69]" />
              Known limitation: upstream service outages may affect live forecast availability.
            </li>
          </ul>
        </section>
      </div>

      <section className="workspace-panel mt-6">
        <h2 className="section-heading">Data sources</h2>
        <p className="mt-3 text-sm leading-6 text-[#334554]">
          Forecasts, hourly periods, grid metadata, and alerts come from api.weather.gov. Location
          search uses Nominatim with OpenStreetMap attribution and manual submit behavior.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a
            href="https://www.weather.gov/documentation/services-web-api"
            target="_blank"
            rel="noreferrer"
            className="secondary-link"
          >
            NWS API docs
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://nominatim.org/release-docs/latest/api/Search/"
            target="_blank"
            rel="noreferrer"
            className="secondary-link"
          >
            Nominatim search docs
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://operations.osmfoundation.org/policies/nominatim/"
            target="_blank"
            rel="noreferrer"
            className="secondary-link"
          >
            Nominatim usage policy
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function Decision({ title, text }: { title: string; text: string }) {
  return (
    <li>
      <h3 className="font-semibold text-[#162536]">{title}</h3>
      <p>{text}</p>
    </li>
  );
}
