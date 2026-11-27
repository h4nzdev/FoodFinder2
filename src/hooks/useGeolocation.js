import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidCoordinate } from '../utils/restaurantNormalizer';

export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [manualCoords, setManualCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const [error, setError] = useState('');
  const watchIdRef = useRef(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const formatGeoError = useCallback((geoError) => {
    if (!geoError) return 'Unable to determine your current location.';
    if (geoError.code === 1 || geoError.code === geoError.PERMISSION_DENIED) {
      setPermissionState('denied');
      return 'Location permission was denied. You can click anywhere on the map to set a manual starting point.';
    }
    if (geoError.code === 3 || geoError.code === geoError.TIMEOUT) {
      return 'Location request timed out. Try again or pick a starting point on the map.';
    }
    return 'GPS signal is unavailable. You can manually pick a starting location on the map.';
  }, []);

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        const msg = 'Browser geolocation requires HTTPS or localhost. Pick a starting point on the map instead.';
        setError(msg);
        reject(new Error(msg));
        return;
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        const msg = 'Geolocation is not supported by this browser. Pick a starting point on the map instead.';
        setError(msg);
        reject(new Error(msg));
        return;
      }

      setLocating(true);
      setError('');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = [position.coords.latitude, position.coords.longitude];
          setLocating(false);
          setPermissionState('granted');
          setCoords(next);
          resolve(next);
        },
        (geoError) => {
          setLocating(false);
          const msg = formatGeoError(geoError);
          setError(msg);
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 20000,
        }
      );
    });
  }, [formatGeoError]);

  const startTracking = useCallback(
    (onPositionUpdate) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setError('Live GPS tracking is not supported by this browser.');
        return;
      }

      stopTracking();
      setError('');
      setTracking(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const next = [position.coords.latitude, position.coords.longitude];
          setPermissionState('granted');
          setCoords(next);
          if (typeof onPositionUpdate === 'function') {
            onPositionUpdate(next);
          }
        },
        (geoError) => {
          const msg = formatGeoError(geoError);
          setError(msg);
          stopTracking();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    },
    [formatGeoError, stopTracking]
  );

  const setManualLocation = useCallback((lat, lon) => {
    const numLat = Number(lat);
    const numLon = Number(lon);
    if (!isValidCoordinate(numLat, numLon)) return null;
    const next = [numLat, numLon];
    setManualCoords(next);
    setError('');
    return next;
  }, []);

  const clearManualLocation = useCallback(() => {
    setManualCoords(null);
  }, []);

  const activeLocation = manualCoords || coords;

  return {
    coords,
    manualCoords,
    activeLocation,
    isManual: Boolean(manualCoords),
    locating,
    tracking,
    permissionState,
    error,
    setError,
    requestLocation,
    startTracking,
    stopTracking,
    setManualLocation,
    clearManualLocation,
  };
}
