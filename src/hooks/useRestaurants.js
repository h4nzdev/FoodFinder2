import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { fetchRestaurantsInBounds } from '../services/restaurantService';
import { fetchPublishedLocations } from '../services/ownerService';
import { fetchPublishedMenuIds } from '../services/menuService';
import { mergeRestaurantLocations } from '../utils/restaurantNormalizer';
import { CEBU_CITY_BOUNDS } from '../data/cebuCity';

const DEFAULT_BOUNDS = {
  south: CEBU_CITY_BOUNDS[0][0],
  west: CEBU_CITY_BOUNDS[0][1],
  north: CEBU_CITY_BOUNDS[1][0],
  east: CEBU_CITY_BOUNDS[1][1],
};

export function useRestaurants() {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [onlyVerifiedMenus, setOnlyVerifiedMenus] = useState(false);
  const [onlyInMapView, setOnlyInMapView] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const loadRestaurantsForBounds = useCallback(async (targetBounds, forceRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError('');

    try {
      const [overpassResult, ownerResult, menuIdsResult] = await Promise.allSettled([
        fetchRestaurantsInBounds(targetBounds, controller.signal, { forceRefresh }),
        fetchPublishedLocations(controller.signal),
        fetchPublishedMenuIds(controller.signal, forceRefresh),
      ]);

      if (controller.signal.aborted) return;

      const ownerLocations = ownerResult.status === 'fulfilled' ? ownerResult.value : [];
      const publishedMenuIds =
        menuIdsResult.status === 'fulfilled' ? menuIdsResult.value : new Set();

      if (overpassResult.status === 'rejected') {
        const reason = overpassResult.reason;
        if (
          axios.isCancel(reason) ||
          reason?.name === 'CanceledError' ||
          reason?.name === 'AbortError'
        ) {
          return;
        }
        if (ownerLocations.length > 0) {
          const mergedFallback = mergeRestaurantLocations([], ownerLocations, publishedMenuIds);
          setAllRestaurants(mergedFallback);
          setError('Overpass API is temporarily unreachable. Showing verified owner locations.');
        } else {
          setError(
            reason?.message ||
              'Could not retrieve restaurants from OpenStreetMap Overpass API. Please retry.'
          );
        }
        setLoading(false);
        return;
      }

      const osmList = overpassResult.value?.allRestaurants || [];
      const merged = mergeRestaurantLocations(osmList, ownerLocations, publishedMenuIds);
      setAllRestaurants(merged);
      setLoading(false);
    } catch (err) {
      if (
        controller.signal.aborted ||
        axios.isCancel(err) ||
        err?.name === 'CanceledError' ||
        err?.name === 'AbortError'
      ) {
        return;
      }
      setError(err?.message || 'Unable to load restaurants right now.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurantsForBounds(DEFAULT_BOUNDS, attempt > 0);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [attempt, loadRestaurantsForBounds]);

  const updateMapBounds = useCallback(
    (leafletBounds) => {
      if (!leafletBounds) return;
      const nextBounds = {
        south: leafletBounds.getSouth(),
        west: leafletBounds.getWest(),
        north: leafletBounds.getNorth(),
        east: leafletBounds.getEast(),
      };

      setBounds((prev) => {
        const unchanged =
          Math.abs(prev.south - nextBounds.south) < 0.0004 &&
          Math.abs(prev.west - nextBounds.west) < 0.0004 &&
          Math.abs(prev.north - nextBounds.north) < 0.0004 &&
          Math.abs(prev.east - nextBounds.east) < 0.0004;
        return unchanged ? prev : nextBounds;
      });

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        loadRestaurantsForBounds(nextBounds, false);
      }, 450);
    },
    [loadRestaurantsForBounds]
  );

  const retry = useCallback(() => {
    setAttempt((prev) => prev + 1);
  }, []);

  const availableCuisines = useMemo(() => {
    const counts = new Map();
    for (const r of allRestaurants) {
      for (const c of r.cuisines || []) {
        counts.set(c, (counts.get(c) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 14)
      .map(([name]) => name);
  }, [allRestaurants]);

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allRestaurants.filter((restaurant) => {
      if (onlyInMapView && bounds) {
        const inBox =
          restaurant.lat >= bounds.south &&
          restaurant.lat <= bounds.north &&
          restaurant.lon >= bounds.west &&
          restaurant.lon <= bounds.east;
        if (!inBox) return false;
      }

      if (selectedCategory !== 'All' && restaurant.category !== selectedCategory) {
        return false;
      }

      if (selectedCuisine !== 'All') {
        const matchesCuisine = (restaurant.cuisines || []).some(
          (c) => c.toLowerCase() === selectedCuisine.toLowerCase()
        );
        if (!matchesCuisine) return false;
      }

      if (onlyVerifiedMenus && !restaurant.hasPublishedMenu && !restaurant.hasExternalMenu) {
        return false;
      }

      if (q) {
        const haystack = [
          restaurant.name,
          restaurant.cuisine,
          restaurant.category,
          restaurant.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [
    allRestaurants,
    bounds,
    onlyInMapView,
    onlyVerifiedMenus,
    searchQuery,
    selectedCategory,
    selectedCuisine,
  ]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCuisine('All');
    setOnlyVerifiedMenus(false);
  }, []);

  return {
    allRestaurants,
    filteredRestaurants,
    availableCuisines,
    bounds,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCuisine,
    setSelectedCuisine,
    onlyVerifiedMenus,
    setOnlyVerifiedMenus,
    onlyInMapView,
    setOnlyInMapView,
    updateMapBounds,
    resetFilters,
    retry,
  };
}
