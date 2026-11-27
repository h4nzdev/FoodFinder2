import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  X,
} from 'lucide-react';
import { FoldedMapIllustration } from '../../assets/illustrations/EditorialIllustrations';

const CEBU_STARTING_PRESETS = [
  { label: 'Fuente Osmeña Circle', lat: 10.3103, lon: 123.8934 },
  { label: 'Cebu IT Park', lat: 10.3307, lon: 123.9064 },
  { label: 'Ayala Center Cebu', lat: 10.3182, lon: 123.9056 },
  { label: 'Colon Street Downtown', lat: 10.2966, lon: 123.8992 },
];

export default function RouteNavigationPanel({
  route,
  targetRestaurant,
  loading,
  error,
  geolocation,
  isPickingOrigin,
  onTogglePickOrigin,
  onSelectPresetOrigin,
  onRefreshRoute,
  onToggleTracking,
  onClearRoute,
}) {
  const [showSteps, setShowSteps] = useState(true);

  if (!targetRestaurant && !route && !loading && !error && !isPickingOrigin) {
    return null;
  }

  return (
    <aside
      className="osrm-route-panel"
      aria-label="OSRM Road Route Navigation"
    >
      <div className="osrm-route-header">
        <div>
          <span
            style={{
              fontSize: '0.66rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              opacity: 0.8,
              display: 'block',
            }}
          >
            OSRM Driving Route
          </span>
          <h3 className="osrm-route-header-title">
            {targetRestaurant ? `To ${targetRestaurant.name}` : 'Route Navigation'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearRoute}
          className="btn-editorial btn-sm"
          aria-label="Clear route and end navigation"
        >
          <X size={13} aria-hidden="true" />
          <span>Clear Route</span>
        </button>
      </div>

      {route && (
        <div className="osrm-route-metrics">
          <div className="osrm-metric-cell">
            <span className="osrm-metric-label">Est. Distance</span>
            <p className="osrm-metric-value">{route.distanceKmText}</p>
          </div>
          <div className="osrm-metric-cell">
            <span className="osrm-metric-label">Driving Duration</span>
            <p className="osrm-metric-value">{route.durationMinText}</p>
          </div>
        </div>
      )}

      <div className="osrm-route-controls">
        <button
          type="button"
          onClick={onRefreshRoute}
          disabled={loading || !targetRestaurant}
          className="btn-editorial btn-sm"
          title="Recalculate route from current starting point"
        >
          <RefreshCw size={12} aria-hidden="true" />
          <span>{loading ? 'Calculating…' : 'Refresh Route'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleTracking}
          className={`btn-editorial btn-sm ${geolocation.tracking ? 'btn-editorial-ink' : ''}`}
          title="Track live position via browser GPS"
        >
          <LocateFixed size={12} aria-hidden="true" />
          <span>{geolocation.tracking ? 'Stop GPS Tracking' : 'Live GPS Track'}</span>
        </button>

        <button
          type="button"
          onClick={onTogglePickOrigin}
          className={`btn-editorial btn-sm ${isPickingOrigin ? 'btn-editorial-ink' : ''}`}
          title="Click on the map to manually select a starting point"
        >
          <Crosshair size={12} aria-hidden="true" />
          <span>{isPickingOrigin ? 'Click Map Now…' : 'Pick Start on Map'}</span>
        </button>
      </div>

      {(error || isPickingOrigin || !geolocation.activeLocation) && (
        <div className="osrm-preset-origins">
          {error && (
            <p
              role="alert"
              style={{
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--color-primary)',
              }}
            >
              {error}
            </p>
          )}
          <span style={{ color: 'var(--color-secondary)' }}>
            Click anywhere on the map to set your starting point, or select a Cebu City landmark:
          </span>
          <div className="osrm-preset-chips">
            {CEBU_STARTING_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn-editorial btn-sm"
                onClick={() => onSelectPresetOrigin(preset.lat, preset.lon)}
              >
                <MapPin size={11} aria-hidden="true" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && !route && (
        <div style={{ padding: '18px 15px', textAlign: 'center' }} role="status">
          <FoldedMapIllustration size={52} />
          <p className="editorial-kicker" style={{ marginTop: '8px' }}>
            Querying OSRM Road Graph…
          </p>
        </div>
      )}

      {route && (
        <>
          <div
            style={{
              padding: '8px 15px',
              borderBottom: 'var(--rule-thin)',
              backgroundColor: 'var(--color-paper-alt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <span>
              <strong>Via:</strong> {route.summary} ({route.steps.length} maneuvers)
            </span>
            <button
              type="button"
              onClick={() => setShowSteps((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              <span>{showSteps ? 'Hide Steps' : 'Show Steps'}</span>
              {showSteps ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </div>

          {showSteps && (
            <ol className="osrm-steps-list" aria-label="Turn-by-turn directions">
              {route.steps.map((step) => (
                <li key={step.id} className="osrm-step-item">
                  <span className="osrm-step-num">{String(step.index).padStart(2, '0')}</span>
                  <div>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      {step.instruction}
                    </p>
                  </div>
                  <span className="osrm-step-distance">{step.distanceText}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </aside>
  );
}
