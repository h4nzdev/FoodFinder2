import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchRestaurantsInBounds } from '../services/restaurantService';
import { fetchPublishedLocations } from '../services/ownerService';
import {
  fetchPublishedMenusCatalog,
  getBuiltinMenusCatalog,
} from '../services/menuService';
import { mergeRestaurantLocations } from '../utils/restaurantNormalizer';
import { CEBU_CITY_BOUNDS } from '../data/cebuCity';
import { CEBU_VERIFIED_RESTAURANTS } from '../data/cebuVerifiedDirectory';

const DEFAULT_BOUNDS = {
  south: CEBU_CITY_BOUNDS[0][0],
  west: CEBU_CITY_BOUNDS[0][1],
  north: CEBU_CITY_BOUNDS[1][0],
  east: CEBU_CITY_BOUNDS[1][1],
};

function getInitialBaselineRestaurants() {
  return mergeRestaurantLocations(
    [],
    CEBU_VERIFIED_RESTAURANTS,
    getBuiltinMenusCatalog()
  );
}

export function useRestaurants() {
  const [allRestaurants, setAllRestaurants] = useState(getInitialBaselineRestaurants);
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [maxBudget, setMaxBudget] = useState('');
  const [onlyVerifiedMenus, setOnlyVerifiedMenus] = useState(false);
  const [onlyInMapView, setOnlyInMapView] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef(null);
  const hasLoadedOverpassRef = useRef(false);

  const loadRestaurantsForBounds = useCallback(async (targetBounds, forceRefresh = false) => {
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError('');

    try {
      const [overpassResult, ownerResult, menuCatalogResult] = await Promise.allSettled([
        fetchRestaurantsInBounds(targetBounds, null, { forceRefresh }),
        fetchPublishedLocations(null),
        fetchPublishedMenusCatalog(null, forceRefresh),
      ]);

      if (currentRequestId !== requestIdRef.current) return;

      const ownerLocations =
        ownerResult.status === 'fulfilled'
          ? ownerResult.value
          : CEBU_VERIFIED_RESTAURANTS;
      const publishedMenuCatalog =
        menuCatalogResult.status === 'fulfilled'
          ? menuCatalogResult.value
          : getBuiltinMenusCatalog();

      if (overpassResult.status === 'rejected') {
        const mergedFallback = mergeRestaurantLocations(
          [],
          ownerLocations,
          publishedMenuCatalog
        );
        setAllRestaurants(mergedFallback);
        setLoading(false);
        return;
      }

      hasLoadedOverpassRef.current = true;
      const osmList = overpassResult.value?.allRestaurants || [];
      const merged = mergeRestaurantLocations(osmList, ownerLocations, publishedMenuCatalog);
      setAllRestaurants(merged);
      setLoading(false);
    } catch {
      if (currentRequestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurantsForBounds(DEFAULT_BOUNDS, attempt > 0);
    return () => {
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

      const [[cebuSouth, cebuWest], [cebuNorth, cebuEast]] = CEBU_CITY_BOUNDS;
      const insideCebuMaster =
        nextBounds.north >= cebuSouth &&
        nextBounds.south <= cebuNorth &&
        nextBounds.east >= cebuWest &&
        nextBounds.west <= cebuEast;

      if (insideCebuMaster && hasLoadedOverpassRef.current) {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        loadRestaurantsForBounds(nextBounds, false);
      }, 500);
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
      .slice(0, 16)
      .map(([name]) => name);
  }, [allRestaurants]);

  const parsedMaxBudget = useMemo(() => {
    const trimmed = String(maxBudget || '').trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : null;
  }, [maxBudget]);

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matchingCriteria = allRestaurants.filter((restaurant) => {
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

      if (parsedMaxBudget !== null) {
        if (restaurant.minPrice === null || restaurant.minPrice > parsedMaxBudget) {
          return false;
        }
      }

      if (q) {
        const dishNames = (restaurant.menuDishes || [])
          .map((d) => `${d.name} ${d.category}`)
          .join(' ');
        const haystack = [
          restaurant.name,
          restaurant.cuisine,
          restaurant.category,
          restaurant.address,
          dishNames,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    if (!onlyInMapView || !bounds) {
      return matchingCriteria;
    }

    const inViewport = matchingCriteria.filter(
      (restaurant) =>
        restaurant.lat >= bounds.south &&
        restaurant.lat <= bounds.north &&
        restaurant.lon >= bounds.west &&
        restaurant.lon <= bounds.east
    );

    return inViewport.length > 0 ? inViewport : matchingCriteria;
  }, [
    allRestaurants,
    bounds,
    onlyInMapView,
    onlyVerifiedMenus,
    parsedMaxBudget,
    searchQuery,
    selectedCategory,
    selectedCuisine,
  ]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCuisine('All');
    setMaxBudget('');
    setOnlyVerifiedMenus(false);
    setOnlyInMapView(false);
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
    maxBudget,
    setMaxBudget,
    parsedMaxBudget,
    onlyVerifiedMenus,
    setOnlyVerifiedMenus,
    onlyInMapView,
    setOnlyInMapView,
    updateMapBounds,
    resetFilters,
    retry,
  };
}
