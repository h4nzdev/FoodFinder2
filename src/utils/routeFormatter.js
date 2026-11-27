import { isValidCoordinate } from './restaurantNormalizer.js';

export function normalizeCoordPoint(point) {
  if (!point) return null;
  if (Array.isArray(point) && point.length >= 2) {
    const lat = Number(point[0]);
    const lon = Number(point[1]);
    return isValidCoordinate(lat, lon) ? { lat, lon } : null;
  }
  const lat = Number(point.lat ?? point.latitude);
  const lon = Number(point.lon ?? point.lng ?? point.longitude);
  return isValidCoordinate(lat, lon) ? { lat, lon } : null;
}

export function validateRouteCoordinates(origin, destination) {
  const start = normalizeCoordPoint(origin);
  const end = normalizeCoordPoint(destination);

  if (!start) {
    return { valid: false, error: 'A valid starting location is required to calculate a route.' };
  }
  if (!end) {
    return { valid: false, error: 'A valid destination restaurant location is required.' };
  }

  const samePoint =
    Math.abs(start.lat - end.lat) < 0.00001 && Math.abs(start.lon - end.lon) < 0.00001;
  if (samePoint) {
    return {
      valid: false,
      error: 'Starting point and restaurant destination are at the same coordinates.',
    };
  }

  return { valid: true, origin: start, destination: end };
}

export function convertGeoJsonToLeafletPositions(geometry) {
  if (!geometry || geometry.type !== 'LineString' || !Array.isArray(geometry.coordinates)) {
    return [];
  }
  const positions = [];
  for (const coord of geometry.coordinates) {
    if (!Array.isArray(coord) || coord.length < 2) continue;
    const lon = Number(coord[0]);
    const lat = Number(coord[1]);
    if (isValidCoordinate(lat, lon)) {
      positions.push([lat, lon]);
    }
  }
  return positions;
}

export function formatDistanceKm(meters) {
  const num = Number(meters);
  if (!Number.isFinite(num) || num < 0) return '0.0 km';
  const km = num / 1000;
  if (km < 1) {
    return `${km.toFixed(2)} km`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatStepDistance(meters) {
  const num = Number(meters);
  if (!Number.isFinite(num) || num <= 0) return '';
  if (num < 1000) {
    return `${Math.round(num)} m`;
  }
  return `${(num / 1000).toFixed(1)} km`;
}

export function formatDurationMinutes(seconds) {
  const num = Number(seconds);
  if (!Number.isFinite(num) || num < 0) return '0 min';
  const totalMinutes = Math.max(1, Math.round(num / 60));
  return `${totalMinutes} min`;
}

function buildInstructionText(step, index, totalSteps) {
  const maneuver = step?.maneuver || {};
  const type = maneuver.type || 'continue';
  const modifier = (maneuver.modifier || '').replaceAll('_', ' ');
  const roadName = [step?.name, step?.ref ? `(${step.ref})` : '']
    .filter(Boolean)
    .join(' ')
    .trim();
  const targetRoad = roadName || 'the road';

  if (type === 'depart' || index === 0) {
    return roadName ? `Head out on ${targetRoad}` : 'Depart from your starting location';
  }
  if (type === 'arrive' || index === totalSteps - 1) {
    return 'Arrive at your destination restaurant';
  }
  if (type === 'roundabout' || type === 'rotary') {
    const exit = maneuver.exit ? ` and take exit ${maneuver.exit}` : '';
    return `Enter the roundabout${exit}${roadName ? ` onto ${targetRoad}` : ''}`;
  }
  if (type === 'fork') {
    return `Keep ${modifier || 'straight'} at the fork${roadName ? ` onto ${targetRoad}` : ''}`;
  }
  if (type === 'merge') {
    return `Merge ${modifier ? `${modifier} ` : ''}onto ${targetRoad}`;
  }
  if (type === 'on ramp' || type === 'off ramp') {
    return `Take the ramp ${modifier ? `${modifier} ` : ''}${roadName ? `onto ${targetRoad}` : ''}`.trim();
  }
  if (type === 'end of road') {
    return `At the end of the road, turn ${modifier || 'ahead'}${roadName ? ` onto ${targetRoad}` : ''}`;
  }
  if (type === 'new name' || type === 'continue') {
    return roadName ? `Continue onto ${targetRoad}` : `Continue ${modifier || 'straight'}`;
  }
  if (type === 'turn') {
    if (modifier === 'uturn') {
      return `Make a U-turn${roadName ? ` onto ${targetRoad}` : ''}`;
    }
    return `Turn ${modifier || 'ahead'}${roadName ? ` onto ${targetRoad}` : ''}`;
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${modifier}${roadName ? ` onto ${targetRoad}` : ''}`.trim();
}

export function formatRouteSteps(legs = []) {
  const rawSteps = legs.flatMap((leg) => (Array.isArray(leg?.steps) ? leg.steps : []));
  if (!rawSteps.length) return [];

  return rawSteps
    .map((step, index) => {
      const instruction = buildInstructionText(step, index, rawSteps.length);
      const distanceMeters = Number(step.distance) || 0;
      const durationSeconds = Number(step.duration) || 0;
      const location = Array.isArray(step.maneuver?.location)
        ? [Number(step.maneuver.location[1]), Number(step.maneuver.location[0])]
        : null;

      return {
        id: `step-${index}-${step.maneuver?.type || 'move'}`,
        index: index + 1,
        instruction,
        roadName: step.name || '',
        type: step.maneuver?.type || 'continue',
        modifier: step.maneuver?.modifier || '',
        distanceMeters,
        distanceText: formatStepDistance(distanceMeters),
        durationSeconds,
        location,
      };
    })
    .filter((step, idx, arr) => {
      if (idx === 0 || idx === arr.length - 1) return true;
      return step.distanceMeters > 3 || Boolean(step.roadName);
    });
}

export function haversineDistanceMeters(a, b) {
  const p1 = normalizeCoordPoint(a);
  const p2 = normalizeCoordPoint(b);
  if (!p1 || !p2) return Infinity;

  const R = 6371000;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
