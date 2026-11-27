import axios from 'axios';
import { CEBU_CITY_AREA, CEBU_CITY_BOUNDS, isInCebuCity } from '../data/cebuCity';
import {
  normalizeRestaurants,
  isOsmRestaurantId,
  isValidCoordinate,
} from '../utils/restaurantNormalizer';

function getOverpassEndpoint() {
  return (
    import.meta.env.VITE_OVERPASS_URL?.trim() ||
    'https://ovp.dresel.systems/api-as/interpreter'
  );
}

const AMENITY_FILTER = '["amenity"~"^(restaurant|cafe|fast_food)$"]';
const CACHE_TTL_MS = 5 * 60 * 1000;
const queryCache = new Map();
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

async function executeOverpassQuery(overpassQl, signal) {
  const endpoint = getOverpassEndpoint();
  const cached = queryCache.get(overpassQl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.elements;
  }

  let responseData = null;

  try {
    const body = new URLSearchParams({ data: overpassQl }).toString();
    const { data } = await axios.post(endpoint, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal,
      timeout: 28000,
    });
    responseData = data;
  } catch (postError) {
    if (
      axios.isCancel(postError) ||
      postError?.name === 'CanceledError' ||
      postError?.name === 'AbortError'
    ) {
      throw postError;
    }
    const { data } = await axios.get(endpoint, {
      params: { data: overpassQl },
      signal,
      timeout: 28000,
    });
    responseData = data;
  }

  if (!Array.isArray(responseData?.elements) || responseData.remark) {
    throw new Error('The Overpass server returned an incomplete dataset. Please retry.');
  }

  queryCache.set(overpassQl, {
    timestamp: Date.now(),
    elements: responseData.elements,
  });
  if (queryCache.size > 30) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }

  return responseData.elements;
}

export async function fetchCebuCityRestaurants(signal, options = {}) {
  const { forceRefresh = false } = options;
  if (
    !forceRefresh &&
    cebuCityMasterCache &&
    Date.now() - cebuCityMasterCache.timestamp < CACHE_TTL_MS
  ) {
    return cebuCityMasterCache.restaurants;
  }

  const [[south, west], [north, east]] = CEBU_CITY_BOUNDS;
  const overpassQl = `[out:json][timeout:25];area(${CEBU_CITY_AREA})->.cebu;nwr${AMENITY_FILTER}(area.cebu)(${south},${west},${north},${east});out center tags;`;

  if (forceRefresh) {
    queryCache.delete(overpassQl);
  }

  const elements = await executeOverpassQuery(overpassQl, signal);
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
    return fetchCebuCityRestaurants(signal, { forceRefresh });
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

  const elements = await executeOverpassQuery(overpassQl, signal);
  const restaurants = normalizeRestaurants(elements);
  return {
    allRestaurants: restaurants,
    visibleRestaurants: restaurants.filter(({ lat, lon }) =>
      isInsideBounds(lat, lon, bounds)
    ),
  };
}

export async function fetchOsmRestaurantById(id, signal) {
  if (!isOsmRestaurantId(id)) return null;

  if (cebuCityMasterCache && Date.now() - cebuCityMasterCache.timestamp < CACHE_TTL_MS) {
    const cachedMatch = cebuCityMasterCache.restaurants.find((item) => item.id === id);
    if (cachedMatch) return cachedMatch;
  }

  const [, type, osmNumber] = id.split('-');
  const overpassQl = `[out:json][timeout:25];${type}(${osmNumber});out center tags;`;
  const elements = await executeOverpassQuery(overpassQl, signal);
  const normalized = normalizeRestaurants(elements);
  return normalized.find((item) => item.id === id) || null;
}
