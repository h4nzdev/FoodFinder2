import { useState } from 'react';
import { LocateFixed } from 'lucide-react';
import { isInCebuCity } from '../../data/cebuCity';

export function readValidatedLocationFields(formData) {
  const address = String(formData.get('address') || '').trim();
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));

  if (!address || !isInCebuCity(latitude, longitude)) {
    throw new Error('Enter a street address and coordinates inside Cebu City boundaries.');
  }

  return {
    address,
    latitude,
    longitude,
  };
}

export default function LocationCoordinateFields({ initialLocation, disabled = false }) {
  const [latitude, setLatitude] = useState(initialLocation?.latitude ?? '');
  const [longitude, setLongitude] = useState(initialLocation?.longitude ?? '');
  const [locating, setLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleUseCurrentGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatusMessage('Browser geolocation is unavailable. Enter coordinates manually.');
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
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setStatusMessage('Cebu City GPS coordinates filled.');
      },
      () => {
        setLocating(false);
        setStatusMessage('Could not detect GPS coordinates. Enter them manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="editorial-form-stack">
      <label className="editorial-field-label">
        <span>Street Address in Cebu City</span>
        <input
          name="address"
          type="text"
          className="editorial-input"
          autoComplete="street-address"
          maxLength={500}
          defaultValue={initialLocation?.address || ''}
          placeholder="e.g. Gov. M. Cuenco Ave, Banilad, Cebu City"
          required
          disabled={disabled}
        />
      </label>

      <div className="editorial-field-row">
        <label className="editorial-field-label">
          <span>Latitude (°N)</span>
          <input
            name="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            className="editorial-input"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            placeholder="10.3157"
            required
            disabled={disabled}
          />
        </label>

        <label className="editorial-field-label">
          <span>Longitude (°E)</span>
          <input
            name="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            className="editorial-input"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="123.8854"
            required
            disabled={disabled}
          />
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-editorial btn-sm"
          disabled={disabled || locating}
          onClick={handleUseCurrentGps}
        >
          <LocateFixed size={13} aria-hidden="true" />
          <span>{locating ? 'Detecting GPS…' : 'Use Current Cebu City GPS'}</span>
        </button>

        {statusMessage && (
          <span role="status" style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
}
