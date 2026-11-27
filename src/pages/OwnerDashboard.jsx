import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Compass,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import {
  fetchOwnerClaims,
  publishRestaurantLocation,
  submitNewRestaurantListing,
  submitOsmClaim,
} from '../services/ownerService';
import { fetchOsmRestaurantById } from '../services/restaurantService';
import { isOsmRestaurantId, listingId } from '../utils/restaurantNormalizer';
import LocationCoordinateFields, {
  readValidatedLocationFields,
} from '../components/owner/LocationCoordinateFields';
import MenuDraftEditor from '../components/owner/MenuDraftEditor';
import OwnerLogin from './OwnerLogin';
import {
  RestaurantMenuIllustration,
  StorefrontIllustration,
} from '../assets/illustrations/EditorialIllustrations';

function OsmClaimSubmissionCard({ restaurantId, onClaimSubmitted }) {
  const [lookup, setLookup] = useState({
    loading: true,
    restaurant: null,
    error: '',
  });
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOsmRestaurantId(restaurantId)) return;
    const controller = new AbortController();
    setLookup({ loading: true, restaurant: null, error: '' });

    fetchOsmRestaurantById(restaurantId, controller.signal)
      .then((restaurant) => {
        if (controller.signal.aborted) return;
        setLookup({
          loading: false,
          restaurant,
          error: restaurant ? '' : 'Restaurant not found in Cebu City OpenStreetMap records.',
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLookup({
          loading: false,
          restaurant: null,
          error: 'Could not verify the OpenStreetMap restaurant listing.',
        });
      });

    return () => controller.abort();
  }, [restaurantId]);

  if (!isOsmRestaurantId(restaurantId)) return null;

  if (lookup.loading) {
    return (
      <div className="editorial-card" role="status">
        <p className="editorial-kicker">Verifying Cebu City OpenStreetMap Listing…</p>
      </div>
    );
  }

  if (!lookup.restaurant) {
    return (
      <div className="editorial-card" role="alert">
        <p className="editorial-kicker">Claim Lookup Notice</p>
        <p style={{ marginTop: '6px', fontSize: '0.86rem' }}>{lookup.error}</p>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    const evidence = String(formData.get('evidence') || '').trim();

    setBusy(true);
    setSubmitError('');

    try {
      const createdClaim = await submitOsmClaim({
        restaurantId,
        restaurantName: lookup.restaurant.name,
        evidence,
      });
      onClaimSubmitted(createdClaim);
    } catch (err) {
      setSubmitError(err.message || 'Could not submit ownership claim.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="editorial-card editorial-form-stack">
      <div className="editorial-card-header" style={{ marginBottom: '4px' }}>
        <div>
          <span className="editorial-kicker">Submit Ownership Claim</span>
          <h2 className="serif-heading" style={{ fontSize: '1.3rem', marginTop: '2px' }}>
            Claim {lookup.restaurant.name}
          </h2>
        </div>
        <span className="editorial-tag">{restaurantId}</span>
      </div>

      <p style={{ fontSize: '0.83rem', color: 'var(--color-secondary)' }}>
        Provide private verification evidence proving you represent{' '}
        <strong>{lookup.restaurant.name}</strong>. Your evidence is only visible to
        authorized claim reviewers.
      </p>

      <div
        className="editorial-alert"
        style={{
          fontSize: '0.82rem',
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong>Direct Activation Active:</strong> Since the administrator verification queue is currently in development,
          claiming this restaurant will activate it directly so you can publish verified menus and entrance coordinates immediately.
          Once the admin review system is implemented, claims will enter a pending review queue before being approved.
        </span>
      </div>

      <label className="editorial-field-label">
        <span>Private Ownership Evidence (20–3000 characters)</span>
        <textarea
          name="evidence"
          rows={4}
          minLength={20}
          maxLength={3000}
          className="editorial-textarea"
          required
          placeholder="Include official business registration details, official website or social page, and a direct business phone or email for reviewer verification."
        />
      </label>

      {submitError && (
        <div className="editorial-alert" role="alert">
          {submitError}
        </div>
      )}

      <div>
        <button
          type="submit"
          className="btn-editorial btn-editorial-ink"
          disabled={busy}
        >
          <span>{busy ? 'Submitting Claim…' : 'Submit Ownership Claim for Review'}</span>
        </button>
      </div>
    </form>
  );
}

function RestaurantLocationCard({ claim, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const locationValues = readValidatedLocationFields(formData);
      if (claim) {
        await publishRestaurantLocation({
          claimId: claim.id,
          ...locationValues,
        });
        setNotice('Verified entrance coordinates published to the Cebu City map.');
      } else {
        await submitNewRestaurantListing({
          name: String(formData.get('name') || '').trim(),
          evidence: String(formData.get('evidence') || '').trim(),
          ...locationValues,
        });
        setNotice(
          'New Cebu City restaurant listing posted directly to the live map! (Note: When the admin system is implemented, submissions will enter a pending review queue).'
        );
      }
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || 'Could not save location details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="editorial-card editorial-form-stack">
      <div className="editorial-card-header" style={{ marginBottom: '4px' }}>
        <div>
          <span className="editorial-kicker">
            {claim ? 'Approved Location Pin' : 'Submit Unlisted Cebu City Restaurant'}
          </span>
          <h2 className="serif-heading" style={{ fontSize: '1.25rem', marginTop: '2px' }}>
            {claim
              ? `Map Coordinates for ${claim.restaurant_name}`
              : 'Add a Restaurant to the Cebu City Map'}
          </h2>
        </div>
        <MapPin size={18} aria-hidden="true" />
      </div>

      {!claim && (
        <>
          <div
            className="editorial-alert"
            style={{
              fontSize: '0.82rem',
              background: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <Info size={16} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Direct Posting Active:</strong> New restaurant submissions are posted directly to the live
              Cebu City map and unlocked for instant menu publishing. Once the administrator review system is implemented,
              submissions will enter a pending review queue before going public.
            </span>
          </div>

          <label className="editorial-field-label">
            <span>Restaurant Name</span>
            <input
              name="name"
              type="text"
              className="editorial-input"
              maxLength={200}
              required
              placeholder="e.g. Balay Sugbo Heritage Kitchen"
            />
          </label>

          <label className="editorial-field-label">
            <span>Private Ownership Evidence (20–3000 characters)</span>
            <textarea
              name="evidence"
              rows={3}
              minLength={20}
              maxLength={3000}
              className="editorial-textarea"
              required
              placeholder="Provide official business website, permit reference, and contact details for the reviewer."
            />
          </label>
        </>
      )}

      <LocationCoordinateFields
        key={claim ? `${claim.id}-${claim.latitude}-${claim.longitude}` : 'new-listing'}
        initialLocation={claim}
        disabled={busy}
      />

      {error && (
        <div className="editorial-alert" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="editorial-alert" role="status">
          {notice}
        </div>
      )}

      <div>
        <button
          type="submit"
          className="btn-editorial btn-editorial-ink"
          disabled={busy}
        >
          <span>
            {busy
              ? 'Saving…'
              : claim
                ? 'Publish Verified Location'
                : 'Submit Restaurant for Review'}
          </span>
        </button>
      </div>
    </form>
  );
}

export default function OwnerDashboard({ session, isReviewer }) {
  const [searchParams] = useSearchParams();
  const claimRestaurantId = searchParams.get('claim');

  const [claims, setClaims] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const user = session?.user;

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchOwnerClaims(user.id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setClaims(data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message || 'Could not load your restaurant claims.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [user?.id, refreshCount]);

  if (session === undefined) {
    return (
      <div className="editorial-page-container">
        <div className="editorial-empty-state" role="status">
          <p className="editorial-kicker">Checking Owner Session…</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <OwnerLogin session={session} />;
  }

  const approvedClaims = (claims || []).filter((c) => c.status !== 'rejected');
  const activeApprovedClaim =
    approvedClaims.find((c) => c.id === selectedClaimId) || approvedClaims[0] || null;

  const alreadyClaimedTarget = (claims || []).some(
    (c) => c.status !== 'rejected' && listingId(c) === claimRestaurantId
  );

  return (
    <div className="editorial-page-container">
      {/* Top Direct Posting Notice Banner */}
      <div
        className="editorial-card"
        style={{
          marginBottom: '20px',
          borderLeft: '4px solid var(--color-accent)',
          background: 'var(--color-surface)',
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Sparkles size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--color-primary)', fontSize: '0.96rem' }}>
              Direct Posting Active · Admin Review in Preview Mode
            </strong>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.84rem',
                color: 'var(--color-secondary)',
                lineHeight: 1.45,
              }}
            >
              Since the administrator review queue is not yet active, your restaurant submissions,
              claimed listings, and verified menus are posted directly to the live Cebu City map.
              Once the administrative review system is implemented, new submissions will enter a{' '}
              <strong>pending verification</strong> queue before publication.
            </p>
          </div>
        </div>
      </div>

      {/* Top Owner Portal Masthead */}
      <div
        className="editorial-card"
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span className="editorial-kicker">
            Owner Workspace · {user.email}
          </span>
          <h1 className="serif-heading" style={{ fontSize: '1.75rem', marginTop: '4px' }}>
            Restaurant Claims &amp; Menu Publishing
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-editorial btn-sm">
            <Compass size={13} aria-hidden="true" />
            <span>Find Restaurant on Map</span>
          </Link>

          <button
            type="button"
            className="btn-editorial btn-sm"
            onClick={() => setShowNewListingForm((prev) => !prev)}
          >
            <Plus size={13} aria-hidden="true" />
            <span>
              {showNewListingForm ? 'Close New Listing Form' : 'Submit Unlisted Restaurant'}
            </span>
          </button>

          {isReviewer && (
            <Link to="/claims/review" className="btn-editorial btn-editorial-ink btn-sm">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>Open Reviewer Queue</span>
            </Link>
          )}

          <button
            type="button"
            className="btn-editorial btn-editorial-ghost btn-sm"
            onClick={() => setRefreshCount((prev) => prev + 1)}
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="editorial-alert" role="alert" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Claim Submission Card if `?claim=osm-...` was clicked from a Restaurant */}
      {claimRestaurantId && claims && !alreadyClaimedTarget && (
        <div style={{ marginBottom: '24px' }}>
          <OsmClaimSubmissionCard
            restaurantId={claimRestaurantId}
            onClaimSubmitted={(newClaim) => {
              setClaims((prev) => [newClaim, ...(prev || [])]);
            }}
          />
        </div>
      )}

      {/* Optional New Restaurant Listing Form */}
      {showNewListingForm && (
        <div style={{ marginBottom: '24px' }}>
          <RestaurantLocationCard
            claim={null}
            onSaved={() => {
              setShowNewListingForm(false);
              setRefreshCount((prev) => prev + 1);
            }}
          />
        </div>
      )}

      <div className="owner-editorial-grid">
        {/* Left Sidebar: Owner's Claims List */}
        <aside className="editorial-card" aria-label="Your submitted restaurant claims">
          <div className="editorial-card-header">
            <div>
              <span className="editorial-kicker">Ownership Ledger</span>
              <h2 className="serif-heading" style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                Your Claims ({claims ? claims.length : '…'})
              </h2>
            </div>
            <Store size={17} aria-hidden="true" />
          </div>

          {loading ? (
            <p role="status" style={{ fontSize: '0.84rem', color: 'var(--color-secondary)' }}>
              Loading ownership claims…
            </p>
          ) : !claims || claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <StorefrontIllustration size={64} />
              <p style={{ fontSize: '0.84rem', color: 'var(--color-secondary)', marginTop: '8px' }}>
                You have not claimed any Cebu City restaurants yet. Select a restaurant on the
                discovery map and click <strong>Claim Listing</strong>.
              </p>
            </div>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {claims.map((claim) => {
                const isSelected = activeApprovedClaim?.id === claim.id;
                const publicId = listingId(claim);
                return (
                  <li
                    key={claim.id}
                    style={{
                      padding: '12px',
                      border: isSelected ? 'var(--rule-heavy)' : 'var(--rule-thin)',
                      backgroundColor: isSelected
                        ? 'var(--color-background)'
                        : 'var(--color-surface)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                        {claim.restaurant_name}
                      </strong>
                      <span className="editorial-status-badge approved">
                        {claim.status === 'approved' ? 'Directly Live' : 'Directly Live (Preview)'}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.74rem',
                        color: 'var(--color-secondary)',
                        marginTop: '4px',
                      }}
                    >
                      ID: {publicId} · <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Live on map (Pending Admin System)</span>
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        type="button"
                        className={`btn-editorial btn-sm ${
                          isSelected ? 'btn-editorial-ink' : ''
                        }`}
                        onClick={() => setSelectedClaimId(claim.id)}
                      >
                        <span>Manage Menu</span>
                      </button>

                      <Link
                        to={`/restaurant/${publicId}`}
                        className="btn-editorial btn-editorial-ghost btn-sm"
                      >
                        <span>Public Page</span>
                        <ArrowUpRight size={11} aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right Main Area: Menu Editor & Location Editor for Selected Approved Claim */}
        <div>
          {activeApprovedClaim ? (
            <>
              <MenuDraftEditor claim={activeApprovedClaim} />
              <RestaurantLocationCard
                claim={activeApprovedClaim}
                onSaved={() => setRefreshCount((prev) => prev + 1)}
              />
            </>
          ) : (
            <div className="editorial-card editorial-empty-state">
              <RestaurantMenuIllustration size={80} />
              <h2 className="editorial-empty-title">
                {claims?.some((c) => c.status === 'pending')
                  ? 'Ownership Claim Pending Verification'
                  : 'No Approved Restaurant Selected'}
              </h2>
              <p className="editorial-empty-copy">
                {claims?.some((c) => c.status === 'pending')
                  ? 'Your submitted ownership claim is currently awaiting verification by an authorized reviewer. Menu editing and publishing unlock automatically once approved.'
                  : 'Claim your Cebu City restaurant from the discovery map or submit an unlisted restaurant to begin publishing verified menus.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
