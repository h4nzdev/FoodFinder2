import axios from 'axios';
import {
  validateRouteCoordinates,
  convertGeoJsonToLeafletPositions,
  formatDistanceKm,
  formatDurationMinutes,
  formatRouteSteps,
} from '../utils/routeFormatter';

function getOsrmBaseUrl() {
  const configured = import.meta.env.VITE_OSRM_URL?.trim();
  return (configured || 'https://router.project-osrm.org').replace(/\/+$/, '');
}

const routeCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

function makeRouteCacheKey(origin, destination) {
  return [
    origin.lat.toFixed(5),
    origin.lon.toFixed(5),
    destination.lat.toFixed(5),
    destination.lon.toFixed(5),
  ].join(':');
}

export async function calculateDrivingRoute(originInput, destinationInput, options = {}) {
  const { signal, bypassCache = false } = options;
  const validation = validateRouteCoordinates(originInput, destinationInput);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { origin, destination } = validation;
  const cacheKey = makeRouteCacheKey(origin, destination);

  if (!bypassCache) {
    const cached = routeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.route;
    }
  }

  const baseUrl = getOsrmBaseUrl();
  const coordinatesPath = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const url = `${baseUrl}/route/v1/driving/${coordinatesPath}`;

  try {
    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: 'true',
        alternatives: 'false',
      },
      signal,
      timeout: 18000,
    });

    const data = response.data;
    if (!data || data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error('No drivable road route was found between these locations.');
    }

    const primaryRoute = data.routes[0];
    const positions = convertGeoJsonToLeafletPositions(primaryRoute.geometry);

    if (positions.length < 2) {
      throw new Error('OSRM returned an incomplete road geometry for this route.');
    }

    const distanceMeters = Number(primaryRoute.distance) || 0;
    const durationSeconds = Number(primaryRoute.duration) || 0;
    const steps = formatRouteSteps(primaryRoute.legs);

    const formattedRoute = {
      origin: [origin.lat, origin.lon],
      destination: [destination.lat, destination.lon],
      positions,
      distanceMeters,
      durationSeconds,
      distanceKmText: formatDistanceKm(distanceMeters),
      durationMinText: formatDurationMinutes(durationSeconds),
      summary:
        primaryRoute.legs?.[0]?.summary ||
        steps.find((s) => s.roadName)?.roadName ||
        'Cebu City road route',
      steps,
      fetchedAt: Date.now(),
    };

    routeCache.set(cacheKey, {
      timestamp: Date.now(),
      route: formattedRoute,
    });
    if (routeCache.size > 30) {
      const oldestKey = routeCache.keys().next().value;
      routeCache.delete(oldestKey);
    }

    return formattedRoute;
  } catch (error) {
    if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.name === 'AbortError') {
      throw error;
    }
    if (error.response?.status === 400 || error.response?.data?.code === 'NoRoute') {
      throw new Error('No road route is available between your starting point and this restaurant.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('The OSRM routing server timed out. Please try refreshing the route.');
    }
    throw new Error(
      error.message && !error.message.startsWith('Request failed')
        ? error.message
        : 'Unable to reach the OSRM routing service right now. Please try again shortly.'
    );
  }
}
