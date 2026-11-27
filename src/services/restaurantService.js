import axios from 'axios';
import { CEBU_CITY_BOUNDS, isInCebuCity } from '../data/cebuCity';
import {
  normalizeRestaurants,
  isOsmRestaurantId,
  isValidCoordinate,
} from '../utils/restaurantNormalizer';

function getOverpassEndpoints() {
  const configured = import.meta.env.VITE_OVERPASS_URL?.trim();
  const endpoints = [
    configured || 'https://ovp.dresel.systems/api-as/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  return [...new Set(endpoints)];
}

const AMENITY_FILTER = '["amenity"~"^(restaurant|cafe|fast_food)$"]';
const CACHE_TTL_MS = 10 * 60 * 1000;
const queryCache = new Map();
const inFlightQueries = new Map();
let cebuCityMasterCache = null;

function quantizeBounds(bounds) {
  const south = Math.floor(Number(bounds.south) * 100) / 100;
  const west = Math.floor(Number(bounds.west) * 100) / 100;
  const north = Math.ceil(Number(bounds.north) * 100) / 100;
  const east = Math.ceil(Number(bounds.east) * 100) / 100;
  return { south, west, north, east };
}

function isInsideBounds(lat, lon, bounds) {
  if (!bounds) return true;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lon >= bounds.west &&
    lon <= bounds.east
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestFromSingleEndpoint(endpoint, overpassQl) {
  const body = new URLSearchParams({ data: overpassQl }).toString();
  const { data } = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 25000,
  });

  if (typeof data === 'string') {
    if (data.includes('duplicate_query')) {
      const err = new Error('DUPLICATE_QUERY');
      err.code = 'DUPLICATE_QUERY';
      throw err;
    }
    throw new Error('Overpass returned non-JSON response.');
  }

  if (!Array.isArray(data?.elements)) {
    throw new Error('Overpass response missing elements array.');
  }

  return data.elements;
}

async function executeOverpassQuery(overpassQl) {
  const cached = queryCache.get(overpassQl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.elements;
  }

  // Deduplicate concurrent identical queries so Overpass never throws duplicate_query
  if (inFlightQueries.has(overpassQl)) {
    return inFlightQueries.get(overpassQl);
  }

  const queryPromise = (async () => {
    const endpoints = getOverpassEndpoints();
    let lastError = null;

    for (const endpoint of endpoints) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const elements = await requestFromSingleEndpoint(endpoint, overpassQl);
          queryCache.set(overpassQl, {
            timestamp: Date.now(),
            elements,
          });
          if (queryCache.size > 30) {
            const oldestKey = queryCache.keys().next().value;
            queryCache.delete(oldestKey);
          }
          return elements;
        } catch (err) {
          lastError = err;
          if (err.code === 'DUPLICATE_QUERY' && attempt === 0) {
            await delay(1400);
            continue;
          }
          break;
        }
      }
    }

    throw new Error(
      lastError?.message && lastError.message !== 'DUPLICATE_QUERY'
        ? lastError.message
        : 'Unable to reach the Overpass restaurant server right now. Please try again in a few seconds.'
    );
  })();

  inFlightQueries.set(overpassQl, queryPromise);

  try {
    return await queryPromise;
  } finally {
    inFlightQueries.delete(overpassQl);
  }
}

export async function fetchCebuCityRestaurants(_signal, options = {}) {
  const { forceRefresh = false } = options;
  if (
    !forceRefresh &&
    cebuCityMasterCache &&
    Date.now() - cebuCityMasterCache.timestamp < CACHE_TTL_MS
  ) {
    return cebuCityMasterCache.restaurants;
  }

  const [[south, west], [north, east]] = CEBU_CITY_BOUNDS;
  // Pure bounding-box query avoids Overpass area-index lock/duplicate_query errors;
  // exact Cebu City boundary filtering is performed locally via isInCebuCity().
  const overpassQl = `[out:json][timeout:25];(nwr${AMENITY_FILTER}(${south},${west},${north},${east}););out center tags;`;

  if (forceRefresh) {
    queryCache.delete(overpassQl);
  }

  const elements = await executeOverpassQuery(overpassQl);
  const restaurants = normalizeRestaurants(elements).filter(({ lat, lon }) =>
    isInCebuCity(lat, lon)
  );

  cebuCityMasterCache = {
    timestamp: Date.now(),
    restaurants,
  };

  return restaurants;
}

export async function fetchRestaurantsInBounds(bounds, signal, options = {}) {
  const { forceRefresh = false } = options;

  if (
    !bounds ||
    !isValidCoordinate(bounds.south, bounds.west) ||
    !isValidCoordinate(bounds.north, bounds.east)
  ) {
    const allRestaurants = await fetchCebuCityRestaurants(signal, { forceRefresh });
    return {
      allRestaurants,
      visibleRestaurants: allRestaurants,
    };
  }

  const [[cebuSouth, cebuWest], [cebuNorth, cebuEast]] = CEBU_CITY_BOUNDS;
  const overlapsCebu =
    bounds.north >= cebuSouth &&
    bounds.south <= cebuNorth &&
    bounds.east >= cebuWest &&
    bounds.west <= cebuEast;

  if (overlapsCebu) {
    const allCebuRestaurants = await fetchCebuCityRestaurants(signal, { forceRefresh });
    return {
      allRestaurants: allCebuRestaurants,
      visibleRestaurants: allCebuRestaurants.filter(({ lat, lon }) =>
        isInsideBounds(lat, lon, bounds)
      ),
    };
  }

  const q = quantizeBounds(bounds);
  const overpassQl = `[out:json][timeout:25];(nwr${AMENITY_FILTER}(${q.south},${q.west},${q.north},${q.east}););out center tags;`;
  if (forceRefresh) {
    queryCache.delete(overpassQl);
  }

  const elements = await executeOverpassQuery(overpassQl);
  const restaurants = normalizeRestaurants(elements);
  return {
    allRestaurants: restaurants,
    visibleRestaurants: restaurants.filter(({ lat, lon }) =>
      isInsideBounds(lat, lon, bounds)
    ),
  };
}

export async function fetchOsmRestaurantById(id) {
  if (!isOsmRestaurantId(id)) return null;

  if (cebuCityMasterCache && Date.now() - cebuCityMasterCache.timestamp < CACHE_TTL_MS) {
    const cachedMatch = cebuCityMasterCache.restaurants.find((item) => item.id === id);
    if (cachedMatch) return cachedMatch;
  }

  const [, type, osmNumber] = id.split('-');
  const overpassQl = `[out:json][timeout:25];${type}(${osmNumber});out center tags;`;
  const elements = await executeOverpassQuery(overpassQl);
  const normalized = normalizeRestaurants(elements);
  return normalized.find((item) => item.id === id) || null;
}
