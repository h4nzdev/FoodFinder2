import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { calculateDrivingRoute } from '../services/routingService';
import { haversineDistanceMeters } from '../utils/routeFormatter';

const RECALC_MIN_INTERVAL_MS = 12000;
const RECALC_MIN_DISTANCE_METERS = 35;

export function useRouting(geolocation) {
  const [route, setRoute] = useState(null);
  const [targetRestaurant, setTargetRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPickingOrigin, setIsPickingOrigin] = useState(false);

  const abortRef = useRef(null);
  const lastCalcTimeRef = useRef(0);
  const lastOriginRef = useRef(null);

  const cancelPendingRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelPendingRequest();
    };
  }, [cancelPendingRequest]);

  const fetchRouteBetween = useCallback(
    async (originPoint, restaurant, bypassCache = false) => {
      if (!originPoint || !restaurant) return null;

      cancelPendingRequest();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError('');

      try {
        const calculated = await calculateDrivingRoute(
          originPoint,
          [restaurant.lat, restaurant.lon],
          { signal: controller.signal, bypassCache }
        );

        if (controller.signal.aborted) return null;

        lastCalcTimeRef.current = Date.now();
        lastOriginRef.current = originPoint;
        setRoute(calculated);
        setLoading(false);
        return calculated;
      } catch (err) {
        if (
          controller.signal.aborted ||
          axios.isCancel(err) ||
          err?.name === 'CanceledError' ||
          err?.name === 'AbortError'
        ) {
          return null;
        }
        setError(err?.message || 'Unable to calculate driving route.');
        setLoading(false);
        return null;
      }
    },
    [cancelPendingRequest]
  );

  const startNavigationTo = useCallback(
    async (restaurant) => {
      if (!restaurant) return;
      setTargetRestaurant(restaurant);
      setError('');

      if (geolocation.activeLocation) {
        await fetchRouteBetween(geolocation.activeLocation, restaurant, false);
        return;
      }

      try {
        const detectedCoords = await geolocation.requestLocation();
        await fetchRouteBetween(detectedCoords, restaurant, false);
      } catch {
        setIsPickingOrigin(true);
        setError(
          'Location access was unavailable or denied. Click anywhere on the map (or choose a preset starting point) to calculate your road route.'
        );
      }
    },
    [fetchRouteBetween, geolocation]
  );

  const setManualOriginAndRoute = useCallback(
    async (lat, lon) => {
      const point = geolocation.setManualLocation(lat, lon);
      setIsPickingOrigin(false);
      if (point && targetRestaurant) {
        await fetchRouteBetween(point, targetRestaurant, false);
      }
    },
    [fetchRouteBetween, geolocation, targetRestaurant]
  );

  const refreshRoute = useCallback(async () => {
    if (!targetRestaurant) return;
    let origin = geolocation.activeLocation;
    if (!origin) {
      try {
        origin = await geolocation.requestLocation();
      } catch {
        setIsPickingOrigin(true);
        return;
      }
    }
    await fetchRouteBetween(origin, targetRestaurant, true);
  }, [fetchRouteBetween, geolocation, targetRestaurant]);

  const clearRoute = useCallback(() => {
    cancelPendingRequest();
    geolocation.stopTracking();
    setRoute(null);
    setTargetRestaurant(null);
    setError('');
    setIsPickingOrigin(false);
    lastOriginRef.current = null;
  }, [cancelPendingRequest, geolocation]);

  const toggleLiveTracking = useCallback(() => {
    if (geolocation.tracking) {
      geolocation.stopTracking();
      return;
    }

    geolocation.clearManualLocation();
    geolocation.startTracking((nextCoords) => {
      if (!targetRestaurant) return;
      const now = Date.now();
      const elapsed = now - lastCalcTimeRef.current;
      const movedMeters = lastOriginRef.current
        ? haversineDistanceMeters(lastOriginRef.current, nextCoords)
        : Infinity;

      if (elapsed >= RECALC_MIN_INTERVAL_MS && movedMeters >= RECALC_MIN_DISTANCE_METERS) {
        fetchRouteBetween(nextCoords, targetRestaurant, true);
      }
    });
  }, [fetchRouteBetween, geolocation, targetRestaurant]);

  return {
    route,
    targetRestaurant,
    loading,
    error,
    isPickingOrigin,
    setIsPickingOrigin,
    startNavigationTo,
    setManualOriginAndRoute,
    refreshRoute,
    clearRoute,
    toggleLiveTracking,
  };
}
