import { useEffect, useRef, useState } from 'react';
import { Download, MonitorSmartphone, Share, Smartphone, WifiOff, X, Zap } from 'lucide-react';
import '../../styles/installPrompt.css';

const DISMISS_KEY = 'foodfinder-install-dismissed-at';
const DISMISS_DAYS = 3;
const SHOW_DELAY_MS = 6500; // wait until the splash screen has finished

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function recentlyDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [hasNativePrompt, setHasNativePrompt] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    // Expose global trigger for manual testing or header install button
    if (typeof window !== 'undefined') {
      window.showFoodFinderInstallPrompt = () => setOpen(true);
    }

    if (isStandalone() || recentlyDismissed()) return undefined;

    let timer = setTimeout(() => {
      if (!isStandalone() && !recentlyDismissed()) {
        setOpen(true);
      }
    }, SHOW_DELAY_MS);

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      deferredPrompt.current = event;
      setHasNativePrompt(true);
    };

    const handleInstalled = () => {
      clearTimeout(timer);
      deferredPrompt.current = null;
      setOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore storage errors */
    }
    setOpen(false);
  };

  const install = async () => {
    const promptEvent = deferredPrompt.current;
    if (!promptEvent) {
      dismiss();
      return;
    }
    deferredPrompt.current = null;
    setOpen(false);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'dismissed') dismiss();
    } catch {
      dismiss();
    }
  };

  if (!open) return null;

  const ios = isIos();

  return (
    <div className="install-backdrop" onClick={dismiss}>
      <div
        className="install-modal-container"
        onClick={(event) => event.stopPropagation()}
      >
        <section
          className="install-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-title"
          aria-describedby="install-copy"
        >
          <button
            type="button"
            className="install-close"
            aria-label="Close install recommendation"
            onClick={dismiss}
          >
            <X size={18} aria-hidden="true" />
          </button>

          <div className="install-icon-wrapper">
            <img
              src="/pwa-192.png"
              alt="FoodFinder Icon"
              className="install-icon"
              width="64"
              height="64"
            />
          </div>

          <h2 id="install-title" className="install-title">
            Install FoodFinder
          </h2>

          <p className="install-copy" id="install-copy">
            Add FoodFinder to your home screen for the fastest full-screen Cebu City food map.
          </p>

          <ul className="install-perks">
            <li>
              <Zap size={16} aria-hidden="true" />
              <span>Opens instantly like a native mobile app</span>
            </li>
            <li>
              <Smartphone size={16} aria-hidden="true" />
              <span>Full-screen map navigation with zero browser bars</span>
            </li>
            <li>
              <WifiOff size={16} aria-hidden="true" />
              <span>App shell cached offline for quick reloads</span>
            </li>
          </ul>

          {ios ? (
            <div className="install-ios">
              In Safari, tap <Share size={14} aria-hidden="true" /> <strong>Share</strong>, then scroll
              and tap <strong>Add to Home Screen</strong>.
            </div>
          ) : !hasNativePrompt ? (
            <div className="install-ios">
              <MonitorSmartphone size={14} aria-hidden="true" style={{ verticalAlign: '-2px' }} /> Tap
              browser menu (<strong>⋮</strong>) or the address bar install icon (<strong>⊕</strong>) and select{' '}
              <strong>Install App</strong>.
            </div>
          ) : null}

          <div className="install-actions">
            <button
              type="button"
              className="btn-editorial btn-editorial-ghost"
              onClick={dismiss}
            >
              <span>Maybe Later</span>
            </button>

            {hasNativePrompt ? (
              <button
                type="button"
                className="btn-editorial btn-editorial-ink"
                onClick={install}
              >
                <Download size={15} aria-hidden="true" />
                <span>Install App</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-editorial btn-editorial-ink"
                onClick={dismiss}
              >
                <span>Got It</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
