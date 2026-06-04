# NWS Forecast Viewer

Accessible React forecast visualization demo using the public National Weather Service API.

Live demo: https://nws-forecast-viewer.netlify.app/

Repository: https://github.com/nrob92/nws-forecast-viewer

Personal demo using the public NWS API. Not affiliated with or endorsed by NOAA/NWS.

## Overview

NWS Forecast Viewer is a portfolio project for data-heavy federal weather interfaces. It resolves a
city, ZIP, or address into coordinates, maps those coordinates to an NWS forecast grid, and presents
7-day periods, hourly meteogram-style charts, and active alerts in an accessible React workspace.
It also includes a small AI layer: one plain-language forecast summary card and one forecast
question box, both grounded in the already-loaded NWS forecast and alert data.

The app uses a Netlify Functions proxy so requests to api.weather.gov and Nominatim include
descriptive identification headers and so upstream NWS URLs are validated before fetching.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Recharts
- Netlify Functions
- OpenAI Node SDK
- Vitest + React Testing Library
- vitest-axe / axe-core

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set these values in `.env` before using live APIs:

```bash
NWS_USER_AGENT="nws-forecast-viewer-demo/1.0 (you@example.com)"
NOMINATIM_USER_AGENT="nws-forecast-viewer-demo/1.0 (you@example.com)"
OPENAI_API_KEY="your-openai-api-key"
```

Local Netlify dev runs the app and functions together at:

```text
http://localhost:8888
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run test
npm run test:a11y
```

## Technical Decisions

### Tailwind CSS

Why: Tailwind keeps a dense operational UI consistent without introducing a larger component
framework.

Trade-offs: Utility classes can become verbose, so repeated surface styles are centralized in
`src/style.css`.

Alternatives: CSS Modules or a component library would work, but they add more ceremony for a small
portfolio app.

### TanStack Query

Why: Point metadata, forecasts, hourly periods, alerts, and geocoding all need independent loading,
caching, and error states.

Trade-offs: Query state adds a bit of setup, but it keeps data fetching predictable and testable.

Alternatives: Context-only fetching or local effects would be simpler initially but easier to tangle.

### Recharts

Why: Recharts provides accessible-enough SVG chart primitives quickly, which is a good fit for
meteogram-style temperature and precipitation charts.

Trade-offs: D3 would offer more control, but it would slow down delivery and add more custom chart
logic.

Alternatives: D3, Observable Plot, or Chart.js.

### NWS API

Why: api.weather.gov is the closest public match for NWS forecast visualization work. The app uses
`/points`, grid forecast, hourly forecast, and active alerts endpoints.

Trade-offs: The API does not geocode city names directly, and browser apps cannot set a true custom
`User-Agent`, so the app uses a Netlify Functions proxy.

Alternatives: A paid weather API would simplify some response shapes but would not demonstrate NWS
domain familiarity.

### AI grounding and server-side calls

Why: The AI layer is intentionally interpretive, not predictive. It sends only the forecast periods,
alerts, and selected location already displayed in the app, and the system prompt tells the model to
answer only from that JSON context.

Trade-offs: This keeps the AI output constrained and auditable, but it means the assistant must say
when the loaded data does not cover a user question.

Security: OpenAI calls are made only from the Netlify Function at `/api/ai`, using
`OPENAI_API_KEY` from the server environment. The browser never receives the API key.

Alternatives: Calling OpenAI directly from the browser would be simpler but would expose the API key
and make the app harder to deploy safely.

## Accessibility Statement

This demo targets Section 508 and WCAG 2.1 AA practices:

- Semantic landmarks and heading structure
- Labeled form controls and submit-only search
- Keyboard-visible focus states
- ARIA live region behavior for alerts and search status
- Sufficient contrast in text, controls, and alert severity states
- Screen-reader-accessible table data alongside visual charts
- Reduced-motion handling for users who request it

Testing approach:

- Automated axe checks with `npm run test:a11y`
- Component tests for empty, loading, error, forecast, chart, and alert states
- Manual keyboard pass through search, result selection, route navigation, and alert details
- Manual mobile check around 390px viewport width

Known limitations:

- Live data depends on api.weather.gov and Nominatim availability.

## Data and Attribution

- Forecast and alert data: National Weather Service API, https://api.weather.gov
- Geocoding: Nominatim / OpenStreetMap, https://nominatim.org
- OpenStreetMap attribution: Geocoding data © OpenStreetMap contributors

Nominatim use is manual-submit only, limited to five results, scoped to U.S. and NWS territories,
and routed through a proxy with an identifying request header.

## Deployment

Deploy on Netlify so `/api/geocode` and `/api/nws` resolve to Netlify Functions.

1. Push the repo to GitHub as `nws-forecast-viewer`.
2. Create a Netlify site from the GitHub repo.
3. Set `NWS_USER_AGENT`, `NOMINATIM_USER_AGENT`, and `OPENAI_API_KEY` in Netlify environment variables.
4. Use the default build command from `netlify.toml`: `npm run build`.
5. Verify the live deployment after setting the environment variables.
