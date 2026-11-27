import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  LocateFixed,
  MapPin,
  RefreshCw,
  X,
} from 'lucide-react';
import { FoldedMapIllustration } from '../../assets/illustrations/EditorialIllustrations';

const CEBU_STARTING_PRESETS = [
  { label: 'Fuente Osmeña', lat: 10.3103, lon: 123.8934 },
  { label: 'Cebu IT Park', lat: 10.3307, lon: 123.9064 },
  { label: 'Ayala Center', lat: 10.3182, lon: 123.9056 },
  { label: 'Colon Downtown', lat: 10.2966, lon: 123.8992 },
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
  const [showSteps, setShowSteps] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (!targetRestaurant && !route && !loading && !error && !isPickingOrigin) {
    return null;
  }

  return (
    <aside
      className={`osrm-route-panel ${minimized ? 'osrm-minimized' : ''}`}
      aria-label="OSRM Road Route Navigation"
    >
      <div className="osrm-route-header">
        <div style={{ minWidth: 0, flex: 1 }}>
          <span
            style={{
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-accent)',
              fontWeight: 700,
              display: 'block',
            }}
          >
            OSRM Driving Route {route ? `· ${route.distanceKmText} (${route.durationMinText})` : ''}
          </span>
          <h3
            className="osrm-route-header-title"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {targetRestaurant ? `To ${targetRestaurant.name}` : 'Route Navigation'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setMinimized((prev) => !prev)}
            className="btn-editorial btn-sm"
            aria-label={minimized ? 'Expand route details' : 'Minimize route panel'}
            title={minimized ? 'Expand route details' : 'Minimize route panel'}
          >
            {minimized ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <button
            type="button"
            onClick={onClearRoute}
            className="btn-editorial btn-sm"
            aria-label="Clear route and end navigation"
          >
            <X size={13} aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {!minimized && (
        <>
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
              <span>{loading ? 'Calculating…' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleTracking}
              className={`btn-editorial btn-sm ${
                geolocation.tracking ? 'btn-editorial-ink' : ''
              }`}
              title="Track live position via browser GPS"
            >
              <LocateFixed size={12} aria-hidden="true" />
              <span>{geolocation.tracking ? 'Stop GPS' : 'Live GPS'}</span>
            </button>

            <button
              type="button"
              onClick={onTogglePickOrigin}
              className={`btn-editorial btn-sm ${
                isPickingOrigin ? 'btn-editorial-ink' : ''
              }`}
              title="Click on the map to manually select a starting point"
            >
              <Crosshair size={12} aria-hidden="true" />
              <span>{isPickingOrigin ? 'Tap Map…' : 'Pick Start'}</span>
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
                Tap anywhere on the map or choose a Cebu City starting point:
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
            <div
              style={{
                padding: '16px 15px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
              role="status"
            >
              <FoldedMapIllustration size={48} />
              <p className="editorial-kicker" style={{ marginTop: '8px' }}>
                Querying OSRM Road Graph…
              </p>
            </div>
          )}

          {route && (
            <>
              <div
                style={{
                  padding: '9px 16px',
                  borderBottom: 'var(--rule-thin)',
                  backgroundColor: 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '0.75rem',
                }}
              >
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <strong>Via:</strong> {route.summary} ({route.steps.length} steps)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="btn-editorial btn-sm"
                  style={{ flexShrink: 0, padding: '4px 9px' }}
                >
                  <span>{showSteps ? 'Hide Steps' : 'Turn-by-Turn'}</span>
                  {showSteps ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </button>
              </div>

              {showSteps && (
                <ol className="osrm-steps-list" aria-label="Turn-by-turn directions">
                  {route.steps.map((step) => (
                    <li key={step.id} className="osrm-step-item">
                      <span className="osrm-step-num">
                        {String(step.index).padStart(2, '0')}
                      </span>
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
        </>
      )}
    </aside>
  );
}
