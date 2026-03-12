'use client';

import { useEffect, useState } from 'react';

export interface GeolocationState {
  latitude: number | undefined;
  longitude: number | undefined;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator?.geolocation) {
      setError('Geolocation is not supported');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setError(null);
        setIsLoading(false);
      },
      () => {
        setError('Location access denied');
        setIsLoading(false);
      },
    );
  }, []);

  return { latitude, longitude, isLoading, error };
}
