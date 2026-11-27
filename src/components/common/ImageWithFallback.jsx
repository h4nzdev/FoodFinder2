import { useState } from 'react';
import { PlateUtensilsIllustration } from '../../assets/illustrations/EditorialIllustrations';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  loading = 'lazy',
  size = 44,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const hasError = Boolean(src && failedSrc === src);

  if (!src || hasError) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt || 'Dish illustration'}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          padding: '6px',
        }}
      >
        <PlateUtensilsIllustration size={size} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailedSrc(src)}
    />
  );
}
