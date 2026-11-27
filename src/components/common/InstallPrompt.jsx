import { useEffect, useRef, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import '../../styles/installPrompt.css';

const DISMISS_KEY = 'foodfinder-install-dismissed-at';
const DISMISS_DAYS = 3;
const SHOW_DELAY_MS = 6000; // wait until the splash screen has finished

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at && Date.now() - at < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [iosMode, setIosMode] = useState(false);
  const deferredPrompt = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return undefined;
    let timer;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isStandalone() && !recentlyDismissed()) setOpen(true);
      }, SHOW_DELAY_MS);
    };

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      deferredPrompt.current = event;
      setIosMode(false);
      schedule();
    };
    const handleInstalled = () => {
      clearTimeout(timer);
      deferredPrompt.current = null;
      setOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    // iOS Safari has no beforeinstallprompt: show manual "Add to Home Screen" guide
    if (isIos()) {
      setIosMode(true);
      schedule();
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const install = async () => {
    const promptEvent = deferredPrompt.current;
    if (!promptEvent) return dismiss();
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

  return (
      <dialog
        ref={dialogRef}
        className="install-modal"
        aria-labelledby="install-title"
        aria-describedby="install-copy"
        onCancel={dismiss}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right ||
              event.clientY < rect.top || event.clientY > rect.bottom) dismiss();
        }}
      >
        <button type="button" className="install-close" aria-label="Close" onClick={dismiss}>
          <X size={18} aria-hidden="true" />
        </button>

        <img src="/pwa-192.png" alt="" className="install-icon" width="72" height="72" />
        <h2 id="install-title" className="install-title">Install FoodFinder</h2>
        <p className="install-copy" id="install-copy">
          Keep the Cebu City food map one tap away. Open FoodFinder from your device to find places to eat.
        </p>

        {iosMode ? (
          <div className="install-ios">
            In Safari, tap <Share size={14} aria-hidden="true" /> <strong>Share</strong> and choose{' '}
            <strong>Add to Home Screen</strong>. Enable <strong>Open as Web App</strong> if shown,
            then tap <strong>Add</strong>.
          </div>
        ) : null}

        <div className="install-actions">
          <button type="button" className="btn-editorial btn-editorial-ghost" onClick={dismiss}>
            <span>Maybe Later</span>
          </button>
          {!iosMode && (
            <button
              type="button"
              className="btn-editorial btn-editorial-ink"
              onClick={install}
            >
              <Download size={15} aria-hidden="true" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </dialog>
  );
}
