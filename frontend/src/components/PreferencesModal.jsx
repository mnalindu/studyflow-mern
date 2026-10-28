
import { useEffect, useRef, useState } from "react";

import {
  Leaf,
  X,
  Check,
  Link2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import "./PreferencesModal.css";
import "./PreferencesGoogleIntegration.css";
import GoogleSignInButton from "./GoogleSignInButton";
import { useAuth } from "./AuthContext";
import {
  getGoogleLinkStatus,
  linkGoogleAccount,
} from "../services/googleAuthApi";

// ------------------------------------
// Browser storage
// ------------------------------------

const STORAGE_KEY = "studyflow-preferences-v1";

const DEFAULT_DAILY_GOAL = 120;

export function getDailyStudyGoal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      const goal = Number(parsed.dailyStudyGoal);

      if (
        Number.isInteger(goal) &&
        goal >= 1 &&
        goal <= 1440
      ) {
        return goal;
      }
    }
  } catch {
    // Use default when storage is unavailable.
  }

  return DEFAULT_DAILY_GOAL;
}

// ------------------------------------
// Preferences Modal
// ------------------------------------

export default function PreferencesModal({
  onClose,
  onSaved,
  studentName = "Alex",
}) {
  const [dailyGoal, setDailyGoal] = useState(
    () => String(getDailyStudyGoal())
  );

  const [error, setError] = useState("");

  // Current authenticated student and Google account linking.
  const { user } = useAuth();
  const [googleStatus, setGoogleStatus] = useState("loading");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  // ------------------------------------
  // Modal keyboard and scroll behavior
  // ------------------------------------

  useEffect(() => {
    const previousFocus = document.activeElement;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      previousFocus?.focus?.();
    };
  }, [onClose]);

  // Keep keyboard focus inside the modal
  function handleDialogKeyDown(event) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), iframe'
      ) || []
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  // ------------------------------------
  // Check Google account link status
  // ------------------------------------

  useEffect(() => {
    let active = true;

    getGoogleLinkStatus()
      .then((response) => {
        if (active) {
          setGoogleStatus(response.linked ? "linked" : "unlinked");
        }
      })
      .catch((requestError) => {
        if (active) {
          setGoogleStatus("error");
          setGoogleError(
            requestError.message || "Could not check Google connection."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function retryGoogleStatus() {
    setGoogleStatus("loading");
    setGoogleError("");

    try {
      const response = await getGoogleLinkStatus();
      setGoogleStatus(response.linked ? "linked" : "unlinked");
    } catch (requestError) {
      setGoogleStatus("error");
      setGoogleError(
        requestError.message || "Could not check Google connection."
      );
    }
  }

  async function handleGoogleCredential(credential) {
    if (googleBusy || googleStatus !== "unlinked") return;

    setGoogleBusy(true);
    setGoogleError("");
    setGoogleMessage("");

    try {
      // The Express backend verifies the Google ID token and
      // checks that its verified email matches the logged-in user.
      const response = await linkGoogleAccount(credential);
      setGoogleStatus("linked");
      setGoogleMessage(
        response.message || "Google account connected successfully."
      );
    } catch (requestError) {
      setGoogleError(
        requestError.message || "Could not connect your Google account."
      );
    } finally {
      setGoogleBusy(false);
    }
  }

  // ------------------------------------
  // Save Preferences
  // ------------------------------------

  function handleSave(event) {
    event.preventDefault();

    const goal = Number(dailyGoal);

    if (
      !Number.isInteger(goal) ||
      goal < 1 ||
      goal > 1440
    ) {
      setError(
        "Enter a daily study goal between 1 and 1440 minutes."
      );
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          dailyStudyGoal: goal,
        })
      );

      setError("");
      onSaved(goal);
    } catch {
      setError(
        "Preferences could not be saved in this browser."
      );
    }
  }

  return (
    <div
      className="sf-preferences-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="sf-preferences-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-preferences-title"
        aria-describedby="sf-preferences-description"
        onKeyDown={handleDialogKeyDown}
      >

        {/* Top Header */}
        <div className="sf-preferences-modal__top">

          <span
            className="sf-preferences-modal__logo"
          >
            <Leaf
              size={26}
              strokeWidth={1.8}
            />
          </span>

          <button
            ref={closeButtonRef}
            type="button"
            className="sf-preferences-modal__close"
            aria-label="Close preferences"
            onClick={onClose}
          >
            <X size={25} />
          </button>

        </div>

        {/* Modal Heading */}
        <div className="sf-preferences-modal__heading">

          <h2 id="sf-preferences-title">
            Make it your own.
          </h2>

          <p id="sf-preferences-description">
            Set a study goal that works for your day.
          </p>

        </div>

        {/* Profile Card */}
        <div className="sf-preferences-modal__profile">

          <span className="sf-preferences-modal__avatar">
            {studentName.charAt(0).toUpperCase()}
          </span>

          <div className="sf-preferences-modal__profile-info">
            <strong>
              {studentName}
            </strong>

            <span>
              Your student workspace
            </span>
          </div>

        </div>

        {/* Preferences Form */}
        <form
          className="sf-preferences-modal__form"
          onSubmit={handleSave}
        >

          <label
            htmlFor="sf-daily-study-goal"
            className="sf-preferences-modal__label"
          >
            Daily study goal (minutes)
          </label>

          <input
            id="sf-daily-study-goal"
            type="number"
            min="1"
            max="1440"
            step="1"
            required
            value={dailyGoal}
            onChange={(event) => {
              setDailyGoal(event.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? "sf-preferences-error"
                : undefined
            }
          />

          {/* Validation Error */}
          {error && (
            <p
              id="sf-preferences-error"
              className="sf-preferences-modal__error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Explanatory Text */}
          <div className="sf-preferences-modal__information">

            <p>
              Your study goal is saved in this
              browser.
            </p>

            <p>
              Your tasks, notes and reminders are
              stored in your StudyFlow account.
            </p>

          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="sf-preferences-modal__save"
          >
            <Check size={19} />
            Save preferences
          </button>

        </form>

        {/* Google account linking (same existing student account) */}
        <section
          className="sf-preferences-google"
          aria-labelledby="sf-preferences-google-title"
        >
          <div className="sf-preferences-google__heading">
            <span className="sf-preferences-google__icon" aria-hidden="true">
              <Link2 size={21} />
            </span>
            <div className="sf-preferences-google__heading-copy">
              <h3 id="sf-preferences-google-title">Google account</h3>
              <p>Connect Google for an easier way to sign in.</p>
            </div>
            {googleStatus === "linked" && (
              <span className="sf-preferences-google__badge">
                <Check size={14} /> Connected
              </span>
            )}
          </div>

          <p className="sf-preferences-google__details">
            Your StudyFlow email: <strong>{user?.email || "Unavailable"}</strong>
          </p>
          <p className="sf-preferences-google__hint">
            Choose the Google account with this same email address.
            Your tasks, notes and other data will stay in this account.
          </p>

          {googleStatus === "loading" && (
            <p className="sf-preferences-google__status" role="status">
              Checking Google connection…
            </p>
          )}

          {googleStatus === "linked" && (
            <div className="sf-preferences-google__connected" role="status">
              <ShieldCheck size={20} />
              <span>
                {googleMessage || "Google is connected. You can use Continue with Google next time."}
              </span>
            </div>
          )}

          {googleStatus === "unlinked" && (
            <div className="sf-preferences-google__button">
              <GoogleSignInButton
                onCredential={handleGoogleCredential}
                busy={googleBusy}
              />
              {googleBusy && (
                <p className="sf-preferences-google__status" role="status">
                  Connecting your Google account…
                </p>
              )}
            </div>
          )}

          {googleStatus === "error" && (
            <button
              type="button"
              className="sf-preferences-google__retry"
              onClick={retryGoogleStatus}
            >
              <RefreshCw size={16} /> Retry connection check
            </button>
          )}

          {googleError && (
            <p className="sf-preferences-google__error" role="alert">
              {googleError}
            </p>
          )}
        </section>

      </section>
    </div>
  );
}
