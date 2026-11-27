import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CheckCircle2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { CEBU_CITY_BOUNDS, CEBU_CITY_CENTER, isInCebuCity } from '../../data/cebuCity';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

// Built-in Cebu City streets, commercial hubs, and barangays for instant zero-latency search suggestions
const CEBU_CITY_PRESET_ADDRESSES = [
  {
    id: 'preset-banilad-cuenco',
    label: 'Gov. M. Cuenco Ave, Banilad, Cebu City',
    sublabel: 'Banilad · North Corridor',
    lat: 10.3396,
    lon: 123.9125,
  },
  {
    id: 'preset-it-park-apas',
    label: 'Abad St, Cebu IT Park, Apas, Cebu City',
    sublabel: 'Cebu IT Park · Apas',
    lat: 10.3308,
    lon: 123.9065,
  },
  {
    id: 'preset-fuente-osmena',
    label: 'Fuente Osmeña Circle, Santa Cruz, Cebu City',
    sublabel: 'Fuente Osmeña · Midtown',
    lat: 10.3103,
    lon: 123.8938,
  },
  {
    id: 'preset-ayala-cbp',
    label: 'Cardinal Rosales Ave, Cebu Business Park, Cebu City',
    sublabel: 'Ayala Center · Cebu Business Park',
    lat: 10.3183,
    lon: 123.9052,
  },
  {
    id: 'preset-mango-maxilom',
    label: 'General Maxilom Ave (Mango Ave), Camputhaw, Cebu City',
    sublabel: 'Camputhaw · Mango Avenue',
    lat: 10.3119,
    lon: 123.8988,
  },
  {
    id: 'preset-lahug-salinas',
    label: 'Salinas Drive, Lahug, Cebu City',
    sublabel: 'Lahug · Salinas Drive',
    lat: 10.3284,
    lon: 123.9022,
  },
  {
    id: 'preset-gorordo-lahug',
    label: 'Gorordo Ave, Lahug, Cebu City',
    sublabel: 'Lahug · Gorordo Avenue',
    lat: 10.3237,
    lon: 123.8985,
  },
  {
    id: 'preset-escario-capitol',
    label: 'N. Escario St, Capitol Site, Cebu City',
    sublabel: 'Capitol Site · Escario',
    lat: 10.3177,
    lon: 123.8931,
  },
  {
    id: 'preset-colon-downtown',
    label: 'Colon St, Kalubihan, Downtown Cebu City',
    sublabel: 'Downtown · Colon Street',
    lat: 10.2966,
    lon: 123.8986,
  },
  {
    id: 'preset-mabolo-pope-john-paul',
    label: 'Pope John Paul II Ave, Mabolo, Cebu City',
    sublabel: 'Mabolo · Kasambagan',
    lat: 10.3219,
    lon: 123.9129,
  },
  {
    id: 'preset-kasambagan-cabahug',
    label: 'F. Cabahug St, Kasambagan, Cebu City',
    sublabel: 'Kasambagan · Panagdait',
    lat: 10.3257,
    lon: 123.9144,
  },
  {
    id: 'preset-tisa-katipunan',
    label: 'Katipunan St, Tisa, Cebu City',
    sublabel: 'Tisa · Labangon Food Strip',
    lat: 10.2994,
    lon: 123.8712,
  },
  {
    id: 'preset-guadalupe-vrama',
    label: 'V. Rama Ave, Guadalupe, Cebu City',
    sublabel: 'Guadalupe · V. Rama',
    lat: 10.3168,
    lon: 123.8825,
  },
  {
    id: 'preset-talamban-bacayan',
    label: 'Gov. M. Cuenco Ave, Talamban, Cebu City',
    sublabel: 'Talamban · North Campus Corridor',
    lat: 10.3665,
    lon: 123.9178,
  },
  {
    id: 'preset-ramos-cogon',
    label: 'F. Ramos St, Cogon Ramos, Cebu City',
    sublabel: 'Cogon Ramos · Midtown',
    lat: 10.3082,
    lon: 123.8975,
  },
  {
    id: 'preset-osmena-blvd',
    label: 'Osmeña Blvd, Sambag I, Cebu City',
    sublabel: 'Osmeña Boulevard · Central',
    lat: 10.3042,
    lon: 123.8952,
  },
  {
    id: 'preset-urgello-sambag',
    label: 'Urgello St, Sambag II, Cebu City',
    sublabel: 'Urgello · University Belt',
    lat: 10.3029,
    lon: 123.8911,
  },
  {
    id: 'preset-srp-ilcorso',
    label: 'Cebu South Coastal Rd, South Road Properties (SRP), Cebu City',
    sublabel: 'SRP · Seaside Corridor',
    lat: 10.2752,
    lon: 123.8788,
  },
  {
    id: 'preset-pardo-bulacao',
    label: 'N. Bacalso Ave, Poblacion Pardo, Cebu City',
    sublabel: 'Pardo · South Highway',
    lat: 10.2793,
    lon: 123.8576,
  },
  {
    id: 'preset-busay-tops',
    label: 'Cebu Tops Rd, Busay, Cebu City',
    sublabel: 'Busay · Mountain View Corridor',
    lat: 10.3652,
    lon: 123.8794,
  },
];

const pickerPinIcon = divIcon({
  className: 'editorial-marker-icon editorial-marker-selected',
  html: `
    <svg width="42" height="42" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="marker-pin-svg">
      <path d="M18 34C18 34 30 22 30 13.5C30 6.873 24.627 1.5 18 1.5C11.373 1.5 6 6.873 6 13.5C6 22 18 34 18 34Z"
        fill="#2D1654" stroke="#F59E0B" stroke-width="2.5"/>
      <circle cx="18" cy="13.5" r="6.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.6"/>
      <circle cx="18" cy="13.5" r="2.6" fill="#2D1654"/>
    </svg>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 40],
});

function findNearestPresetAddress(lat, lon) {
  let best = CEBU_CITY_PRESET_ADDRESSES[0];
  let bestDist = Infinity;
  for (const item of CEBU_CITY_PRESET_ADDRESSES) {
    const dLat = item.lat - lat;
    const dLon = item.lon - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

function formatNominatimDisplayName(item) {
  const addr = item?.address || {};
  const parts = [
    item?.name || addr.amenity || addr.shop || addr.building,
    addr.house_number ? `${addr.house_number} ${addr.road || ''}`.trim() : addr.road,
    addr.suburb || addr.neighbourhood || addr.quarter || addr.village,
    'Cebu City',
  ].filter(Boolean);

  const deduplicated = [];
  for (const part of parts) {
    const clean = String(part).trim();
    if (
      clean &&
      !deduplicated.some((existing) => existing.toLowerCase() === clean.toLowerCase())
    ) {
      deduplicated.push(clean);
    }
  }

  if (deduplicated.length >= 2) {
    return deduplicated.join(', ');
  }

  return String(item?.display_name || '').replace(/,\s*Philippines$/i, '').trim();
}

function MapViewportRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position || !Number.isFinite(position[0]) || !Number.isFinite(position[1])) return;
    map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
  }, [map, position]);

  return null;
}

function MapClickSelector({ disabled, onPickCoordinates }) {
  useMapEvents({
    click(event) {
      if (disabled) return;
      onPickCoordinates(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function readValidatedLocationFields(formData) {
  const address = String(formData.get('address') || '').trim();
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));

  if (!address || !isInCebuCity(latitude, longitude)) {
    throw new Error(
      'Search and click a Cebu City street address (or tap a point on the map) inside Cebu City boundaries.'
    );
  }

  return {
    address,
    latitude,
    longitude,
  };
}

export default function LocationCoordinateFields({ initialLocation, disabled = false }) {
  const hasInitialCoords =
    Number.isFinite(Number(initialLocation?.latitude)) &&
    Number.isFinite(Number(initialLocation?.longitude)) &&
    isInCebuCity(Number(initialLocation?.latitude), Number(initialLocation?.longitude));

  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [latitude, setLatitude] = useState(
    hasInitialCoords ? Number(initialLocation.latitude) : ''
  );
  const [longitude, setLongitude] = useState(
    hasInitialCoords ? Number(initialLocation.longitude) : ''
  );
  const [remoteSuggestions, setRemoteSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const containerRef = useRef(null);

  const hasValidCoordinates =
    latitude !== '' &&
    longitude !== '' &&
    isInCebuCity(Number(latitude), Number(longitude));

  // Filter instant local Cebu City presets matching the user's search query
  const matchingPresetSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return CEBU_CITY_PRESET_ADDRESSES.slice(0, 6);
    }
    return CEBU_CITY_PRESET_ADDRESSES.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.sublabel.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery]);

  // Combine instant local Cebu City presets with live OpenStreetMap Nominatim results
  const combinedSuggestions = useMemo(() => {
    const results = [...matchingPresetSuggestions];
    for (const remote of remoteSuggestions) {
      const duplicate = results.some(
        (existing) =>
          existing.label.toLowerCase() === remote.label.toLowerCase() ||
          (Math.abs(existing.lat - remote.lat) < 0.0005 &&
            Math.abs(existing.lon - remote.lon) < 0.0005)
      );
      if (!duplicate) {
        results.push(remote);
      }
    }
    return results.slice(0, 8);
  }, [matchingPresetSuggestions, remoteSuggestions]);

  // Close address dropdown when clicking outside
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  // Debounced live OpenStreetMap Nominatim address search constrained to Cebu City
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setRemoteSuggestions([]);
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const south = CEBU_CITY_BOUNDS[0][0];
        const west = CEBU_CITY_BOUNDS[0][1];
        const north = CEBU_CITY_BOUNDS[1][0];
        const east = CEBU_CITY_BOUNDS[1][1];

        const response = await axios.get(NOMINATIM_SEARCH_URL, {
          signal: controller.signal,
          timeout: 6500,
          params: {
            format: 'jsonv2',
            q: trimmed.toLowerCase().includes('cebu') ? trimmed : `${trimmed}, Cebu City`,
            countrycodes: 'ph',
            viewbox: `${west},${north},${east},${south}`,
            bounded: 1,
            addressdetails: 1,
            limit: 8,
          },
        });

        if (controller.signal.aborted) return;

        const items = Array.isArray(response.data) ? response.data : [];
        const cebuMatches = items
          .map((item) => {
            const lat = Number(item.lat);
            const lon = Number(item.lon);
            if (!isInCebuCity(lat, lon)) return null;
            return {
              id: `nominatim-${item.place_id}`,
              label: formatNominatimDisplayName(item),
              sublabel: item.type
                ? `OpenStreetMap · ${String(item.type).replace(/_/g, ' ')}`
                : 'OpenStreetMap Cebu City',
              lat,
              lon,
            };
          })
          .filter(Boolean);

        setRemoteSuggestions(cebuMatches);
      } catch {
        if (!controller.signal.aborted) {
          setRemoteSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion) => {
    const nextLat = Number(suggestion.lat.toFixed(6));
    const nextLon = Number(suggestion.lon.toFixed(6));
    setAddress(suggestion.label);
    setSearchQuery(suggestion.label);
    setLatitude(nextLat);
    setLongitude(nextLon);
    setDropdownOpen(false);
    setStatusMessage('Address selected and pinned on the Cebu City map.');
  };

  const reverseGeocodeCoordinates = async (lat, lon) => {
    const cleanLat = Number(lat.toFixed(6));
    const cleanLon = Number(lon.toFixed(6));

    if (!isInCebuCity(cleanLat, cleanLon)) {
      setStatusMessage('Selected point is outside Cebu City boundaries. Click inside Cebu City.');
      return;
    }

    setLatitude(cleanLat);
    setLongitude(cleanLon);
    setDropdownOpen(false);

    const fallbackPreset = findNearestPresetAddress(cleanLat, cleanLon);
    const immediateLabel = `Near ${fallbackPreset.label}`;
    setAddress(immediateLabel);
    setSearchQuery(immediateLabel);
    setReverseLoading(true);
    setStatusMessage('Resolving Cebu City street address from map pin…');

    try {
      const response = await axios.get(NOMINATIM_REVERSE_URL, {
        timeout: 6000,
        params: {
          format: 'jsonv2',
          lat: cleanLat,
          lon: cleanLon,
          addressdetails: 1,
        },
      });

      const resolvedLabel = formatNominatimDisplayName(response.data);
      if (resolvedLabel) {
        setAddress(resolvedLabel);
        setSearchQuery(resolvedLabel);
        setStatusMessage('Street address automatically filled from your map pin.');
      } else {
        setStatusMessage('Location pinned inside Cebu City.');
      }
    } catch {
      setStatusMessage('Location pinned inside Cebu City.');
    } finally {
      setReverseLoading(false);
    }
  };

  const handleUseCurrentGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatusMessage('Browser geolocation is unavailable. Search or click your address above.');
      return;
    }

    setLocating(true);
    setStatusMessage('');

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        if (!isInCebuCity(coords.latitude, coords.longitude)) {
          setStatusMessage('Your detected GPS location is outside Cebu City.');
          return;
        }
        reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      },
      () => {
        setLocating(false);
        setStatusMessage('Could not detect GPS. Search or click your address on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const activeMapCenter = hasValidCoordinates
    ? [Number(latitude), Number(longitude)]
    : CEBU_CITY_CENTER;

  return (
    <div className="editorial-form-stack" ref={containerRef}>
      {/* Hidden form fields read by readValidatedLocationFields(formData) */}
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="latitude" value={latitude} />
      <input type="hidden" name="longitude" value={longitude} />

      <div className="editorial-field-label" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span>Search &amp; Click Street Address in Cebu City</span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--color-secondary)',
              textTransform: 'none',
              letterSpacing: 'normal',
            }}
          >
            Click an address suggestion or tap the map below
          </span>
        </div>

        {/* Search Input with autoComplete="off" so browser autofill never blocks the dropdown */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="editorial-input"
            autoComplete="off"
            spellCheck="false"
            maxLength={500}
            value={searchQuery}
            disabled={disabled}
            onFocus={() => setDropdownOpen(true)}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchQuery(nextValue);
              setAddress(nextValue);
              setDropdownOpen(true);

              // If the user cleared the input, clear coordinates so they pick a valid address
              if (!nextValue.trim()) {
                setLatitude('');
                setLongitude('');
              } else if (!hasValidCoordinates && matchingPresetSuggestions.length > 0) {
                // Pre-bind the top matching Cebu City preset coordinate while typing so form submission works smoothly
                const topMatch = matchingPresetSuggestions[0];
                setLatitude(Number(topMatch.lat.toFixed(6)));
                setLongitude(Number(topMatch.lon.toFixed(6)));
              }
            }}
            placeholder="Search street, barangay, or landmark (e.g. Banilad, IT Park, Fuente, Mabolo)…"
            style={{
              paddingLeft: '38px',
              paddingRight: searchQuery ? '36px' : '14px',
            }}
          />

          {searchQuery && !disabled && (
            <button
              type="button"
              aria-label="Clear searched address"
              onClick={() => {
                setSearchQuery('');
                setAddress('');
                setLatitude('');
                setLongitude('');
                setDropdownOpen(true);
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Clickable Cebu City Address Suggestions Dropdown */}
        {dropdownOpen && !disabled && (
          <div
            role="listbox"
            aria-label="Cebu City address suggestions"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1100,
              marginTop: '6px',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(45, 22, 84, 0.16)',
              boxShadow: '0 14px 28px rgba(34, 18, 66, 0.16)',
              maxHeight: '240px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 10px 6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--color-secondary)',
                borderBottom: '1px solid rgba(45, 22, 84, 0.08)',
              }}
            >
              <span>Click Your Cebu City Address</span>
              <span>{searching ? 'Searching map…' : `${combinedSuggestions.length} matches`}</span>
            </div>

            {combinedSuggestions.length === 0 ? (
              <div
                style={{
                  padding: '12px 10px',
                  fontSize: '0.8rem',
                  color: 'var(--color-secondary)',
                }}
              >
                No matching Cebu City street found. Tap directly on the map below to pin your
                address.
              </div>
            ) : (
              combinedSuggestions.map((item) => {
                const isCurrent =
                  hasValidCoordinates &&
                  address.toLowerCase() === item.label.toLowerCase();

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => handleSelectSuggestion(item)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isCurrent
                        ? 'rgba(45, 22, 84, 0.08)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'background-color 120ms ease',
                    }}
                  >
                    <MapPin
                      size={15}
                      aria-hidden="true"
                      style={{
                        color: 'var(--color-accent)',
                        marginTop: '2px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.83rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-secondary)',
                          marginTop: '2px',
                        }}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Interactive Click-to-Pin Mini Map */}
      <div
        style={{
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1.5px solid rgba(45, 22, 84, 0.14)',
          boxShadow: 'var(--neu-inset-sm)',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '210px',
            width: '100%',
          }}
        >
          <MapContainer
            center={activeMapCenter}
            zoom={hasValidCoordinates ? 16 : 13}
            minZoom={10}
            maxZoom={20}
            maxBounds={CEBU_CITY_BOUNDS}
            maxBoundsViscosity={0.85}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              minZoom={10}
              maxZoom={20}
              maxNativeZoom={19}
              keepBuffer={6}
            />
            <MapViewportRecenter
              position={hasValidCoordinates ? [Number(latitude), Number(longitude)] : null}
            />
            <MapClickSelector
              disabled={disabled}
              onPickCoordinates={reverseGeocodeCoordinates}
            />
            {hasValidCoordinates && (
              <Marker
                position={[Number(latitude), Number(longitude)]}
                icon={pickerPinIcon}
                draggable={!disabled}
                eventHandlers={{
                  dragend(event) {
                    const latlng = event.target.getLatLng();
                    reverseGeocodeCoordinates(latlng.lat, latlng.lng);
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Selected Address Confirmation Bar below the mini-map */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid rgba(45, 22, 84, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <CheckCircle2
              size={16}
              aria-hidden="true"
              style={{
                color: hasValidCoordinates ? 'var(--color-accent)' : 'var(--color-secondary)',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {reverseLoading
                  ? 'Detecting street address…'
                  : hasValidCoordinates && address
                    ? address
                    : 'Click an address above or tap your restaurant location on the map'}
              </div>
              {hasValidCoordinates && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Pinned in Cebu City ({Number(latitude).toFixed(4)}° N,{' '}
                  {Number(longitude).toFixed(4)}° E)
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn-editorial btn-sm"
            disabled={disabled || locating}
            onClick={handleUseCurrentGps}
          >
            <LocateFixed size={13} aria-hidden="true" />
            <span>{locating ? 'Detecting GPS…' : 'Use Current Cebu City GPS'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <span role="status" style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
          {statusMessage}
        </span>
      )}
    </div>
  );
}
