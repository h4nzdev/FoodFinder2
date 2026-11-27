import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound, UserPlus } from 'lucide-react';
import {
  formatAuthError,
  registerOwner,
  signInOwner,
} from '../services/ownerService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  IngredientsIllustration,
  StorefrontIllustration,
} from '../assets/illustrations/EditorialIllustrations';

export default function OwnerLogin({ session }) {
  const [searchParams] = useSearchParams();
  const claimParam = searchParams.get('claim');
  const redirectTarget = claimParam
    ? `/owner?claim=${encodeURIComponent(claimParam)}`
    : '/owner';

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  if (session?.user) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const fullName = String(formData.get('fullName') || '').trim();

    setBusy(true);
    setError('');
    setStatusMessage(
      isRegisterMode ? 'Creating your owner account…' : 'Signing in to Owner Portal…'
    );

    try {
      if (isRegisterMode) {
        const result = await registerOwner({ email, password, fullName });
        if (!result?.session) {
          setStatusMessage(
            'Account created. Check your email inbox for the Supabase confirmation link.'
          );
        } else {
          setStatusMessage('Account registered and signed in.');
        }
      } else {
        await signInOwner({ email, password });
        setStatusMessage('Signed in.');
      }
    } catch (err) {
      setStatusMessage('');
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="editorial-page-container" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="btn-editorial btn-sm">
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Back to Discovery Map</span>
        </Link>
      </div>

      <div className="menu-broadsheet">
        <div
          className="menu-broadsheet-inner-frame"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* Editorial Introduction Column */}
          <div>
            <span className="editorial-kicker">Verified Kitchen Registry</span>
            <h1 className="serif-heading" style={{ fontSize: '1.85rem', marginTop: '6px' }}>
              Restaurant Owner Portal
            </h1>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-secondary)',
                marginTop: '10px',
              }}
            >
              Claim your Cebu City restaurant listing, submit private verification
              evidence for review, and publish verified menus and prices in Philippine
              Pesos (₱).
            </p>

            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                border: 'var(--rule-thin)',
                backgroundColor: 'var(--color-background)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <StorefrontIllustration size={64} />
              <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary)' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block' }}>
                  Row Level Security Protected
                </strong>
                Only approved restaurant owners can publish menu updates for their
                verified OpenStreetMap establishment.
              </div>
            </div>
          </div>

          {/* Authentication Form Column */}
          <div>
            {!isSupabaseConfigured() ? (
              <div className="editorial-alert" role="alert">
                Supabase environment variables are not configured. Set{' '}
                <code>VITE_SUPABASE_URL</code> and{' '}
                <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code>.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="editorial-form-stack">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 'var(--rule-ink)',
                    paddingBottom: '10px',
                  }}
                >
                  <h2 className="serif-heading" style={{ fontSize: '1.25rem' }}>
                    {isRegisterMode ? 'Register Owner Account' : 'Owner Sign In'}
                  </h2>
                  <IngredientsIllustration size={36} />
                </div>

                {isRegisterMode && (
                  <label className="editorial-field-label">
                    <span>Owner / Representative Name</span>
                    <input
                      name="fullName"
                      type="text"
                      className="editorial-input"
                      autoComplete="name"
                      maxLength={100}
                      placeholder="e.g. Maria Santos"
                      required
                    />
                  </label>
                )}

                <label className="editorial-field-label">
                  <span>Business Email Address</span>
                  <input
                    name="email"
                    type="email"
                    className="editorial-input"
                    autoComplete="email"
                    placeholder="owner@restaurant.ph"
                    required
                  />
                </label>

                <label className="editorial-field-label">
                  <span>Password</span>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="editorial-input"
                      style={{ paddingRight: '42px' }}
                      minLength={isRegisterMode ? 8 : undefined}
                      autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                      placeholder={isRegisterMode ? 'At least 8 characters' : '••••••••'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary-mid)',
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={17} aria-hidden="true" />
                      ) : (
                        <Eye size={17} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </label>

                {isRegisterMode && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: 'var(--color-secondary)',
                      lineHeight: 1.4,
                    }}
                  >
                    <input
                      name="acceptCiaTerms"
                      type="checkbox"
                      required
                      style={{ marginTop: '3px' }}
                    />
                    <span>
                      I agree to the{' '}
                      <Link
                        to="/privacy-terms"
                        style={{
                          color: 'var(--color-primary-mid)',
                          fontWeight: 700,
                          textDecoration: 'underline',
                        }}
                      >
                        Privacy Policy &amp; Terms and Conditions (CIA Triad Standard)
                      </Link>
                      .
                    </span>
                  </label>
                )}

                {error && (
                  <div className="editorial-alert" role="alert">
                    {error}
                  </div>
                )}

                {statusMessage && (
                  <div className="editorial-alert" role="status">
                    {statusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-editorial btn-editorial-ink btn-block"
                  disabled={busy}
                >
                  {isRegisterMode ? (
                    <>
                      <UserPlus size={14} aria-hidden="true" />
                      <span>{busy ? 'Creating Account…' : 'Create Owner Account'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={14} aria-hidden="true" />
                      <span>{busy ? 'Signing In…' : 'Sign In to Portal'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-editorial btn-block"
                  disabled={busy}
                  onClick={() => {
                    setIsRegisterMode((prev) => !prev);
                    setError('');
                    setStatusMessage('');
                  }}
                >
                  <span>
                    {isRegisterMode
                      ? 'Already have an account? Sign In'
                      : 'Need an owner account? Register'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
