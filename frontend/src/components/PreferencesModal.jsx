
import { useEffect, useRef, useState } from "react";

import {
  Leaf,
  X,
  Check,
} from "lucide-react";

import "./PreferencesModal.css";

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
        'button:not([disabled]), input:not([disabled])'
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
              Account syncing and study reminders
              will be available when the backend
              is connected.
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

      </section>
    </div>
  );
}
