import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import {
  Compass,
  Crosshair,
  LocateFixed,
  Minus,
  Navigation,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { CEBU_CITY_BOUNDS, CEBU_CITY_CENTER } from '../../data/cebuCity';
import RouteNavigationPanel from '../navigation/RouteNavigationPanel';

const PIN_LIMIT_OPTIONS = [30, 60, 100, 150];
const DEFAULT_PIN_LIMIT = 60;

// Module-level icon cache so Leaflet reuses divIcon instances without DOM thrashing
const markerIconCache = new Map();

function getCachedRestaurantMarkerIcon({ isSelected, hasMenu, category }) {
  const cacheKey = `${category || 'Restaurant'}-${Boolean(hasMenu)}-${Boolean(isSelected)}`;
  if (markerIconCache.has(cacheKey)) {
    return markerIconCache.get(cacheKey);
  }

  const fill = isSelected ? '#2D1654' : '#FFFFFF';
  const stroke = isSelected ? '#F59E0B' : '#2D1654';
  const innerFill = isSelected ? '#F59E0B' : '#2D1654';
  const innerText = isSelected ? '#2D1654' : '#FFFFFF';
  const size = isSelected ? 40 : 31;
  const anchorY = isSelected ? 39 : 30;
  const badgeDot = hasMenu
    ? `<circle cx="24" cy="7" r="4.4" fill="#F59E0B" stroke="#2D1654" stroke-width="1.6" />`
    : '';
  const letter = category === 'Café' ? 'C' : category === 'Fast Food' ? 'F' : 'R';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="marker-pin-svg">
      <path d="M16 30C16 30 27 19.6 27 12C27 5.925 22.075 1 16 1C9.925 1 5 5.925 5 12C5 19.6 16 30 16 30Z"
        fill="${fill}" stroke="${stroke}" stroke-width="2.3" stroke-linejoin="round"/>
      <circle cx="16" cy="12" r="6" fill="${innerFill}" stroke="#FFFFFF" stroke-width="1.4"/>
      <text x="16" y="14.7" text-anchor="middle" fill="${innerText}" font-family="Georgia, serif" font-size="7.5" font-weight="700">${letter}</text>
      ${badgeDot}
    </svg>
  `;

  const iconInstance = divIcon({
    className: `editorial-marker-icon ${isSelected ? 'editorial-marker-selected' : ''}`,
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, anchorY],
    popupAnchor: [0, -anchorY + 4],
  });

  markerIconCache.set(cacheKey, iconInstance);
  return iconInstance;
}

const originMarkerIcon = divIcon({
  className: 'editorial-marker-icon',
  html: `
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="marker-pin-svg">
      <circle cx="16" cy="16" r="12" fill="#FFFFFF" stroke="#2D1654" stroke-width="2.6"/>
      <circle cx="16" cy="16" r="7.5" fill="#EFEBF7" stroke="#F59E0B" stroke-width="1.8" stroke-dasharray="3 2"/>
      <circle cx="16" cy="16" r="4" fill="#2D1654"/>
    </svg>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationMarkerIcon = divIcon({
  className: 'editorial-marker-icon editorial-marker-selected',
  html: `
    <svg width="44" height="44" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="marker-pin-svg">
      <path d="M18 34C18 34 30 22 30 13.5C30 6.873 24.627 1.5 18 1.5C11.373 1.5 6 6.873 6 13.5C6 22 18 34 18 34Z"
        fill="#2D1654" stroke="#F59E0B" stroke-width="2.5"/>
      <circle cx="18" cy="13.5" r="6.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.6"/>
      <circle cx="18" cy="13.5" r="2.6" fill="#2D1654"/>
    </svg>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 42],
  popupAnchor: [0, -36],
});

function selectPrioritizedViewportMarkers(restaurants, viewport, maxPins, selectedRestaurant) {
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return { markers: selectedRestaurant ? [selectedRestaurant] : [], totalInView: 0, isCapped: false };
  }

  const south = viewport?.south ?? CEBU_CITY_BOUNDS[0][0];
  const west = viewport?.west ?? CEBU_CITY_BOUNDS[0][1];
  const north = viewport?.north ?? CEBU_CITY_BOUNDS[1][0];
  const east = viewport?.east ?? CEBU_CITY_BOUNDS[1][1];

  const inView = restaurants.filter(
    ({ lat, lon }) => lat >= south && lat <= north && lon >= west && lon <= east
  );

  // If the user zoomed tightly into a residential block with 0 pins inside the small box,
  // fall back to showing the nearest Cebu City restaurants so the map is never empty
  const candidatePool = inView.length > 0 ? inView : restaurants;
  const totalInView = candidatePool.length;

  const centerLat = (south + north) / 2;
  const centerLon = (west + east) / 2;
  const lonScale = Math.cos((centerLat * Math.PI) / 180);

  const distSq = (item) =>
    (item.lat - centerLat) ** 2 + ((item.lon - centerLon) * lonScale) ** 2;

  if (totalInView <= maxPins && inView.length > 0) {
    const list = [...candidatePool];
    if (selectedRestaurant && !list.some((item) => item.id === selectedRestaurant.id)) {
      list.push(selectedRestaurant);
    }
    return { markers: list, totalInView, isCapped: false };
  }

  const sorted = [...candidatePool].sort((a, b) => {
    if (selectedRestaurant) {
      if (a.id === selectedRestaurant.id) return -1;
      if (b.id === selectedRestaurant.id) return 1;
    }
    if (inView.length > 0) {
      const aMenu = a.hasPublishedMenu ? 2 : a.hasExternalMenu ? 1 : 0;
      const bMenu = b.hasPublishedMenu ? 2 : b.hasExternalMenu ? 1 : 0;
      if (aMenu !== bMenu) return bMenu - aMenu;
    }
    return distSq(a) - distSq(b);
  });

  const capCount = inView.length > 0 ? maxPins : Math.min(20, maxPins);
  const sliced = sorted.slice(0, capCount);
  if (selectedRestaurant && !sliced.some((item) => item.id === selectedRestaurant.id)) {
    sliced[sliced.length - 1] = selectedRestaurant;
  }

  return {
    markers: sliced,
    totalInView,
    isCapped: totalInView > capCount,
  };
}

function MapEventsController({ onBoundsChange, isPickingOrigin, onPickOrigin }) {
  const map = useMapEvents({
    moveend() {
      onBoundsChange(map.getBounds());
    },
    zoomend() {
      onBoundsChange(map.getBounds());
    },
    click(event) {
      if (isPickingOrigin) {
        onPickOrigin(event.latlng.lat, event.latlng.lng);
      }
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

function MapViewportSynchronizer({ selectedRestaurant, route, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (route?.positions?.length >= 2) {
      map.closePopup();
      const bounds = latLngBounds(route.positions);
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      map.fitBounds(bounds, {
        paddingTopLeft: [36, 72],
        paddingBottomRight: [36, isMobile ? 255 : 110],
        maxZoom: 17,
        animate: true,
      });
    }
  }, [map, route]);

  useEffect(() => {
    if (!route && selectedRestaurant) {
      map.setView(
        [selectedRestaurant.lat, selectedRestaurant.lon],
        Math.max(map.getZoom(), 16),
        { animate: true }
      );
    }
  }, [map, route, selectedRestaurant]);

  useEffect(() => {
    if (!route && !selectedRestaurant && userLocation) {
      map.setView(userLocation, Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [map, route, selectedRestaurant, userLocation]);

  return null;
}

function CustomZoomControls({ onResetCebu }) {
  const map = useMap();

  return (
    <div className="map-toolbar-group" role="group" aria-label="Map zoom controls">
      <button
        type="button"
        className="btn-editorial btn-sm"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn-editorial btn-sm"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn-editorial btn-sm"
        onClick={() => {
          map.setView(CEBU_CITY_CENTER, 14);
          if (onResetCebu) onResetCebu();
        }}
        title="Reset map view to Cebu City center"
      >
        <Compass size={13} aria-hidden="true" />
        <span>Cebu City</span>
      </button>
    </div>
  );
}

const RestaurantMapMarker = memo(function RestaurantMapMarker({
  restaurant,
  isSelected,
  onSelect,
  onGetDirections,
}) {
  const map = useMap();
  const icon = getCachedRestaurantMarkerIcon({
    isSelected,
    hasMenu: restaurant.hasPublishedMenu || restaurant.hasExternalMenu,
    category: restaurant.category,
  });

  return (
    <Marker
      position={[restaurant.lat, restaurant.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 900 : 0}
      eventHandlers={{
        click: () => onSelect(restaurant),
      }}
    >
      <Popup autoPan={false}>
        <div style={{ minWidth: '185px', fontFamily: 'var(--font-sans)' }}>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#484848',
            }}
          >
            {restaurant.category}
            {restaurant.cuisine ? ` · ${restaurant.cuisine}` : ''}
          </span>
          <h4
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1rem',
              margin: '3px 0 6px',
              color: '#181818',
            }}
          >
            {restaurant.name}
          </h4>
          {restaurant.address && (
            <p style={{ fontSize: '0.76rem', color: '#484848', marginBottom: '8px' }}>
              {restaurant.address}
            </p>
          )}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-editorial btn-editorial-ink btn-sm"
              onClick={() => {
                map.closePopup();
                onSelect(restaurant);
                onGetDirections(restaurant);
              }}
            >
              <Navigation size={11} aria-hidden="true" />
              <span>Directions</span>
            </button>
            <button
              type="button"
              className="btn-editorial btn-sm"
              onClick={() => {
                map.closePopup();
                onSelect(restaurant);
              }}
            >
              <span>View Menu</span>
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

export default function DiscoveryMap({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onBoundsChange,
  geolocation,
  routing,
}) {
  const [pinLimit, setPinLimit] = useState(DEFAULT_PIN_LIMIT);
  const [viewport, setViewport] = useState({
    south: CEBU_CITY_BOUNDS[0][0],
    west: CEBU_CITY_BOUNDS[0][1],
    north: CEBU_CITY_BOUNDS[1][0],
    east: CEBU_CITY_BOUNDS[1][1],
  });

  const handleInternalBoundsChange = useCallback(
    (leafletBounds) => {
      if (!leafletBounds) return;
      setViewport({
        south: leafletBounds.getSouth(),
        west: leafletBounds.getWest(),
        north: leafletBounds.getNorth(),
        east: leafletBounds.getEast(),
      });
      if (onBoundsChange) {
        onBoundsChange(leafletBounds);
      }
    },
    [onBoundsChange]
  );

  const { markers: displayedMarkers, totalInView, isCapped } = useMemo(
    () =>
      selectPrioritizedViewportMarkers(
        restaurants,
        viewport,
        pinLimit,
        selectedRestaurant
      ),
    [pinLimit, restaurants, selectedRestaurant, viewport]
  );

  const handleUseMyLocation = async () => {
    geolocation.clearManualLocation();
    try {
      const detected = await geolocation.requestLocation();
      if (routing.targetRestaurant) {
        routing.setManualOriginAndRoute(detected[0], detected[1]);
      }
    } catch {
      /* Geolocation error is surfaced in status banner */
    }
  };

  return (
    <div
      className="discover-right-map-column"
      style={{ cursor: routing.isPickingOrigin ? 'crosshair' : 'default' }}
    >
      <div className="map-floating-toolbar">
        <div className="map-toolbar-group map-actions-inline">
          <button
            type="button"
            className="btn-editorial btn-sm"
            onClick={handleUseMyLocation}
            disabled={geolocation.locating}
          >
            <LocateFixed size={13} aria-hidden="true" />
            <span>
              {geolocation.locating
                ? 'Locating…'
                : geolocation.activeLocation
                  ? 'My Location'
                  : 'Use Location'}
            </span>
          </button>

          <button
            type="button"
            className={`btn-editorial btn-sm ${
              routing.isPickingOrigin ? 'btn-editorial-ink' : ''
            }`}
            onClick={() => routing.setIsPickingOrigin((prev) => !prev)}
            title="Manually select a starting point on the map"
          >
            <Crosshair size={13} aria-hidden="true" />
            <span>
              {routing.isPickingOrigin ? 'Cancel Pick' : 'Start Point'}
            </span>
          </button>
        </div>

        {/* Map Pin Limitation Controls to Prevent Lag (Always single-line inline) */}
        <div className="map-toolbar-group map-pin-cap-group">
          <span role="status" className="map-pin-count-text">
            <strong>{displayedMarkers.length}</strong>
            {isCapped ? `/${totalInView}` : ''} Pins
          </span>

          <label
            className="map-pin-cap-label"
            title="Limit maximum pins rendered on the map to prevent browser lag"
          >
            <SlidersHorizontal size={11} aria-hidden="true" />
            <span className="hide-on-mobile-nav">Cap:</span>
            <select
              aria-label="Maximum map pins displayed"
              value={pinLimit}
              onChange={(event) => setPinLimit(Number(event.target.value))}
              className="map-pin-cap-select"
            >
              {PIN_LIMIT_OPTIONS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} max
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {routing.isPickingOrigin && (
        <div className="map-pick-banner" role="status">
          <span>
            Click anywhere on the Cebu City map to set your route starting point.
          </span>
          <button
            type="button"
            className="btn-editorial btn-sm"
            onClick={() => routing.setIsPickingOrigin(false)}
          >
            Done
          </button>
        </div>
      )}

      {geolocation.error && !routing.targetRestaurant && (
        <div
          className="map-pick-banner"
          role="alert"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
        >
          <span>{geolocation.error}</span>
          <button
            type="button"
            className="btn-editorial btn-sm"
            onClick={() => geolocation.setError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      <MapContainer
        center={CEBU_CITY_CENTER}
        zoom={14}
        minZoom={10}
        maxZoom={20}
        zoomControl={false}
        preferCanvas={true}
        className="editorial-leaflet-map"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          minZoom={10}
          maxZoom={20}
          maxNativeZoom={18}
          keepBuffer={6}
          updateWhenZooming={false}
          className="editorial-map-tiles"
        />

        <div className="map-zoom-dock">
          <CustomZoomControls />
        </div>

        <MapEventsController
          onBoundsChange={handleInternalBoundsChange}
          isPickingOrigin={routing.isPickingOrigin}
          onPickOrigin={routing.setManualOriginAndRoute}
        />

        <MapViewportSynchronizer
          selectedRestaurant={selectedRestaurant}
          route={routing.route}
          userLocation={geolocation.activeLocation}
        />

        {/* Starting Location / Current User Marker */}
        {(routing.route?.origin || geolocation.activeLocation) && (
          <Marker
            position={routing.route?.origin || geolocation.activeLocation}
            icon={originMarkerIcon}
            zIndexOffset={950}
          >
            <Tooltip permanent direction="top" offset={[0, -14]}>
              {geolocation.isManual ? 'Selected Start Point' : 'Your Location'}
            </Tooltip>
          </Marker>
        )}

        {/* OSRM Road Route Polyline (White Halo + Deep Purple Road + 10% Amber Gold Centerline) */}
        {routing.route?.positions?.length >= 2 && (
          <>
            <Polyline
              positions={routing.route.positions}
              pathOptions={{
                color: '#FFFFFF',
                weight: 9,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={routing.route.positions}
              pathOptions={{
                color: '#2D1654',
                weight: 5.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            <Polyline
              positions={routing.route.positions}
              pathOptions={{
                color: '#F59E0B',
                weight: 2,
                opacity: 0.95,
                dashArray: '6 8',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Destination Restaurant Marker when Route is Active */}
        {routing.route?.destination && routing.targetRestaurant && (
          <Marker
            position={routing.route.destination}
            icon={destinationMarkerIcon}
            zIndexOffset={1000}
          >
            <Tooltip permanent direction="top" offset={[0, -34]}>
              Destination: {routing.targetRestaurant.name}
            </Tooltip>
          </Marker>
        )}

        {/* Prioritized & Capped Restaurant Discovery Markers (Hidden during active route so road path is 100% clear) */}
        {!routing.route &&
          displayedMarkers.map((restaurant) => (
            <RestaurantMapMarker
              key={restaurant.id}
              restaurant={restaurant}
              isSelected={selectedRestaurant?.id === restaurant.id}
              onSelect={onSelectRestaurant}
              onGetDirections={routing.startNavigationTo}
            />
          ))}
      </MapContainer>

      <RouteNavigationPanel
        route={routing.route}
        targetRestaurant={routing.targetRestaurant}
        loading={routing.loading}
        error={routing.error}
        geolocation={geolocation}
        isPickingOrigin={routing.isPickingOrigin}
        onTogglePickOrigin={() => routing.setIsPickingOrigin((prev) => !prev)}
        onSelectPresetOrigin={routing.setManualOriginAndRoute}
        onRefreshRoute={routing.refreshRoute}
        onToggleTracking={routing.toggleLiveTracking}
        onClearRoute={routing.clearRoute}
      />
    </div>
  );
}
