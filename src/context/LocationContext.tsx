import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LocationResult } from '../types/weather';

export const DEFAULT_LOCATION: LocationResult = {
  id: 'preset-washington-dc',
  label: 'Washington, District of Columbia, United States',
  name: 'Washington, DC',
  latitude: 38.9072,
  longitude: -77.0369,
  source: 'preset',
};

type LocationContextValue = {
  selectedLocation: LocationResult;
  recentLocations: LocationResult[];
  selectLocation: (location: LocationResult) => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);
const STORAGE_KEY = 'nws-forecast-viewer-recent-locations';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult>(DEFAULT_LOCATION);
  const [recentLocations, setRecentLocations] = useState<LocationResult[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as LocationResult[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLocations.slice(0, 5)));
  }, [recentLocations]);

  const value = useMemo<LocationContextValue>(
    () => ({
      selectedLocation,
      recentLocations,
      selectLocation: (location) => {
        setSelectedLocation(location);
        setRecentLocations((current) => [
          location,
          ...current.filter((item) => item.id !== location.id),
        ]);
      },
    }),
    [recentLocations, selectedLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationState() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error('useLocationState must be used inside LocationProvider');
  }

  return context;
}
