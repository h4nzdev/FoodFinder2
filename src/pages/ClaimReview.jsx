import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  decideClaim,
  fetchPendingClaimsForReview,
} from '../services/ownerService';
import { fetchOsmRestaurantById } from '../services/restaurantService';
import { isOsmRestaurantId, listingId } from '../utils/restaurantNormalizer';
import { StorefrontIllustration } from '../assets/illustrations/EditorialIllustrations';

export default function ClaimReview({ session }) {
  const [queue, setQueue] = useState(undefined);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const user = session?.user;

  useEffect(() => {
    if (!user?.id) {
      setQueue(null);
      return;
    }

    const controller = new AbortController();
    setError('');

    fetchPendingClaimsForReview(user.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setQueue(data);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Unable to load pending ownership claims.');
        }
      });

    return () => controller.abort();
  }, [user?.id, refreshCount]);

  const handleDecision = async (claim, decision) => {
    if (busyId) return;
    setBusyId(claim.id);
    setError('');
    setNotice('');

    try {
      const publicId = listingId(claim);
      if (decision === 'approved' && isOsmRestaurantId(publicId)) {
        const verifiedOsm = await fetchOsmRestaurantById(publicId);
        if (!verifiedOsm) {
          throw new Error(
            'Approval requires a valid, currently active Cebu City OpenStreetMap listing.'
          );
        }
      }

      await decideClaim(claim.id, decision);
      setQueue((prev) => (prev || []).filter((item) => item.id !== claim.id));
      setNotice(
        `Claim for "${claim.restaurant_name}" marked as ${decision.toUpperCase()}.`
      );
    } catch (err) {
      setError(err.message || 'Failed to record claim decision.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="editorial-page-container" style={{ maxWidth: '920px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/owner" className="btn-editorial btn-sm">
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Back to Owner Dashboard</span>
        </Link>

        <button
          type="button"
          className="btn-editorial btn-sm"
          onClick={() => setRefreshCount((prev) => prev + 1)}
        >
          <RefreshCw size={13} aria-hidden="true" />
          <span>Refresh Queue</span>
        </button>
      </div>

      <section className="menu-broadsheet">
        <div className="menu-broadsheet-inner-frame">
          <header className="menu-broadsheet-header">
            <div>
              <span className="editorial-kicker">
                Authorized Reviewer Desk · RLS Enforced
              </span>
              <h1 className="menu-broadsheet-title" style={{ fontSize: '1.9rem' }}>
                Restaurant Ownership Claim Review
              </h1>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--color-secondary)',
                  marginTop: '6px',
                }}
              >
                Verify submitted ownership evidence before granting menu publishing
                privileges. Supabase RLS prevents any user from reviewing or approving
                their own claim.
              </p>
            </div>
            <ShieldCheck size={36} aria-hidden="true" />
          </header>

          {error && (
            <div className="editorial-alert" role="alert" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {notice && (
            <div className="editorial-alert" role="status" style={{ marginBottom: '16px' }}>
              {notice}
            </div>
          )}

          {!user ? (
            <div className="editorial-empty-state">
              <StorefrontIllustration size={72} />
              <h2 className="editorial-empty-title">Reviewer Sign-In Required</h2>
              <p className="editorial-empty-copy">
                Sign in with an authorized reviewer account to inspect pending restaurant
                ownership claims.
              </p>
              <Link to="/owner/login" className="btn-editorial btn-editorial-ink">
                <span>Sign In</span>
              </Link>
            </div>
          ) : queue === undefined ? (
            <div className="editorial-empty-state" role="status">
              <p className="editorial-kicker">Verifying Reviewer Authorization…</p>
            </div>
          ) : queue === null ? (
            <div className="editorial-empty-state" role="alert">
              <StorefrontIllustration size={72} />
              <h2 className="editorial-empty-title">Reviewer Authorization Required</h2>
              <p className="editorial-empty-copy">
                Your account ({user.email}) is not registered in{' '}
                <code>public.restaurant_claim_reviewers</code>. Only designated reviewers
                can view or decide pending ownership claims.
              </p>
            </div>
          ) : queue.length === 0 ? (
            <div className="editorial-empty-state">
              <StorefrontIllustration size={72} />
              <h2 className="editorial-empty-title">No Pending Claims in Queue</h2>
              <p className="editorial-empty-copy">
                All submitted Cebu City restaurant ownership claims from other accounts
                have been reviewed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {queue.map((claim) => {
                const publicId = listingId(claim);
                const isProcessing = busyId === claim.id;

                return (
                  <article key={claim.id} className="editorial-card">
                    <div className="editorial-card-header">
                      <div>
                        <span className="editorial-kicker">
                          Pending Claim · {publicId}
                        </span>
                        <h2
                          className="serif-heading"
                          style={{ fontSize: '1.3rem', marginTop: '2px' }}
                        >
                          {claim.restaurant_name}
                        </h2>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {claim.latitude && claim.longitude ? (
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${claim.latitude}&mlon=${claim.longitude}#map=18/${claim.latitude}/${claim.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-editorial btn-sm"
                          >
                            <span>Verify on OSM</span>
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        ) : (
                          <Link
                            to={`/restaurant/${publicId}`}
                            className="btn-editorial btn-sm"
                          >
                            <span>View Listing</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {claim.address && (
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--color-secondary)',
                          marginBottom: '10px',
                        }}
                      >
                        <strong>Submitted Address:</strong> {claim.address} (
                        {claim.latitude}, {claim.longitude})
                      </p>
                    )}

                    <div
                      style={{
                        padding: '12px 14px',
                        border: 'var(--rule-thin)',
                        backgroundColor: 'var(--color-background)',
                        fontSize: '0.86rem',
                        marginBottom: '14px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      <span
                        className="editorial-kicker"
                        style={{ display: 'block', marginBottom: '4px' }}
                      >
                        Submitted Ownership Evidence
                      </span>
                      {claim.evidence}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn-editorial btn-editorial-ink"
                        disabled={Boolean(busyId)}
                        onClick={() => handleDecision(claim, 'approved')}
                      >
                        <Check size={14} aria-hidden="true" />
                        <span>{isProcessing ? 'Saving…' : 'Approve Claim'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-editorial"
                        disabled={Boolean(busyId)}
                        onClick={() => handleDecision(claim, 'rejected')}
                      >
                        <X size={14} aria-hidden="true" />
                        <span>Reject Claim</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
