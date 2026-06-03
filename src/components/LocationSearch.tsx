import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Search } from 'lucide-react';
import { compactLocationLabel, formatCoordinate } from '../lib/format';
import { searchLocations } from '../services/weatherApi';
import type { LocationResult } from '../types/weather';

type LocationSearchProps = {
  onSelect: (location: LocationResult) => void;
  recentLocations: LocationResult[];
};

export function LocationSearch({ onSelect, recentLocations }: LocationSearchProps) {
  const [draft, setDraft] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const resultsQuery = useQuery({
    queryKey: ['geocode', submittedQuery],
    queryFn: () => searchLocations(submittedQuery),
    enabled: submittedQuery.length > 0,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();

    if (nextQuery.length >= 2) {
      setSubmittedQuery(nextQuery);
    }
  }

  return (
    <section aria-labelledby="location-search-heading" className="workspace-panel">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="location-search-heading" className="section-heading">
            Location search
          </h2>
          <p className="section-copy">Search is submitted manually and limited to U.S. coverage.</p>
        </div>
        <MapPin aria-hidden="true" className="mt-1 h-5 w-5 text-[#0b6e69]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label htmlFor="location-query" className="sr-only">
            City, state, ZIP, or address
          </label>
          <input
            id="location-query"
            name="location"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Washington, DC or 10001"
            className="field"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="primary-button">
          {resultsQuery.isFetching ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Search aria-hidden="true" className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      <div className="mt-4 min-h-10" aria-live="polite" aria-atomic="true">
        {resultsQuery.isError ? (
          <p className="status-error">{errorMessage(resultsQuery.error)}</p>
        ) : null}

        {resultsQuery.isSuccess && resultsQuery.data.length === 0 ? (
          <p className="status-muted">No matching locations found. Try a city with state.</p>
        ) : null}

        {resultsQuery.data && resultsQuery.data.length > 0 ? (
          <ul className="space-y-2" aria-label="Location results">
            {resultsQuery.data.map((location) => (
              <li key={location.id}>
                <button type="button" className="result-button" onClick={() => onSelect(location)}>
                  <span className="font-medium text-[#162536]">
                    {compactLocationLabel(location.label)}
                  </span>
                  <span className="text-xs text-[#66727d]">
                    {formatCoordinate(location.latitude)}, {formatCoordinate(location.longitude)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {recentLocations.length > 0 ? (
        <div className="mt-5 border-t border-[#dde3dc] pt-4">
          <h3 className="mb-2 text-sm font-semibold text-[#293949]">Recent</h3>
          <div className="flex flex-wrap gap-2">
            {recentLocations.slice(0, 4).map((location) => (
              <button
                key={location.id}
                type="button"
                className="secondary-button"
                onClick={() => onSelect(location)}
              >
                {compactLocationLabel(location.name)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Search failed.';
}
