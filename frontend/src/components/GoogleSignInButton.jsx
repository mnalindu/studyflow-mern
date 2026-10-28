import { useEffect, useRef, useState } from "react";
import "./GoogleSignInButton.css";

// Google Identity Services needs one initialization per page.
// Keep its callback pointing at the currently mounted login button.
const SCRIPT_URL = "https://accounts.google.com/gsi/client";
let scriptPromise = null;
let initializedClientId = null;
let activeCredentialHandler = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.studyflowGoogle = "true";

    script.onload = () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error("Google Sign-In could not initialize."));
    };
    script.onerror = () => reject(new Error("Could not load Google Sign-In. Check your connection."));

    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    document.querySelector('script[data-studyflow-google="true"]')?.remove();
    throw error;
  });

  return scriptPromise;
}

function initializeGoogle(clientId) {
  if (initializedClientId === clientId) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    ux_mode: "popup",
    auto_select: false,
    callback: (response) => {
      if (response?.credential) {
        activeCredentialHandler?.(response.credential);
      }
    },
  });

  initializedClientId = clientId;
}

export default function GoogleSignInButton({ onCredential, busy = false }) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) {
      setLoadError("Google Client ID is missing. Add VITE_GOOGLE_CLIENT_ID to frontend/.env.local.");
      return;
    }

    let active = true;
    let observer;
    let lastWidth = 0;

    function handleCredential(credential) {
      if (active) callbackRef.current(credential);
    }

    loadGoogleIdentityServices()
      .then(() => {
        if (!active || !buttonRef.current) return;

        initializeGoogle(clientId);
        activeCredentialHandler = handleCredential;

        const renderButton = () => {
          const container = buttonRef.current;
          if (!container || !active) return;

          const width = Math.max(180, Math.min(400, Math.floor(container.clientWidth)));
          if (width === lastWidth) return;
          lastWidth = width;

          // renderButton uses a Google-managed iframe. This is the
          // official button, not a simulated Google login button.
          container.replaceChildren();
          window.google.accounts.id.renderButton(container, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width,
          });
        };

        renderButton();

        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(renderButton);
          observer.observe(buttonRef.current);
        }

        setIsReady(true);
      })
      .catch((error) => {
        if (active) setLoadError(error.message || "Google Sign-In is unavailable.");
      });

    return () => {
      active = false;
      observer?.disconnect();
      if (activeCredentialHandler === handleCredential) activeCredentialHandler = null;
      buttonRef.current?.replaceChildren();
    };
  }, [clientId]);

  return (
    <div className="sf-google-signin">
      <div
        className={`sf-google-signin__button${busy ? " sf-google-signin__button--busy" : ""}`}
        ref={buttonRef}
        aria-label="Continue with Google"
        aria-busy={busy}
      />
      {!isReady && !loadError && <p className="sf-google-signin__message">Loading Google Sign-In…</p>}
      {loadError && <p className="sf-google-signin__error" role="alert">{loadError}</p>}
    </div>
  );
}
