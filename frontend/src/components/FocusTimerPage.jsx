
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Sun,
  Plus,
  Timer,
  Headphones,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  ArrowUpRight,
  Leaf,
} from "lucide-react";

import { useAuth } from "./AuthContext";
import {
  createStudySession,
  getStudySessions,
  getStudySessionStats,
} from "../services/studySessionApi";
import "./FocusTimerPage.css";

// Pomodoro durations in seconds
const MODES = {
  focus: {
    label: "Focus",
    seconds: 25 * 60,
  },
  short: {
    label: "Short break",
    seconds: 5 * 60,
  },
  long: {
    label: "Long break",
    seconds: 15 * 60,
  },
};

const CIRCUMFERENCE = 2 * Math.PI * 142;

// Use the student's own calendar day (not a UTC calendar day).
function todayRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return { from: from.toISOString(), to: to.toISOString() };
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

// ---------------------------------------
// Reusable Focus Timer Card
// ---------------------------------------

function TimerCard({
  mode,
  remaining,
  running,
  sessions,
  sessionsLoading,
  sessionError,
  saveMessage,
  saveFailed,
  retrySaving,
  onRetrySave,
  onModeChange,
  onToggle,
  onReset,
  onExpand,
  expanded,
}) {
  const duration = MODES[mode].seconds;

  const progress = Math.min(
    1,
    Math.max(0, 1 - remaining / duration)
  );

  const completedDots = sessions % 5;

  return (
    <section
      className="sf-fullfocus-card"
      aria-labelledby="sf-fullfocus-card-title"
    >
      {/* Card Header */}
      <div className="sf-fullfocus-card__header">
        <h2 id="sf-fullfocus-card-title">
          <Timer size={22} strokeWidth={1.8} />
          Find your focus
        </h2>

        <button
          type="button"
          className="sf-fullfocus-card__expand"
          onClick={onExpand}
          aria-label={
            expanded
              ? "Exit focus mode"
              : "Enter focus mode"
          }
          title={
            expanded
              ? "Exit focus mode"
              : "Enter focus mode"
          }
        >
          {expanded ? (
            <Minimize2 size={20} />
          ) : (
            <Maximize2 size={20} />
          )}
        </button>
      </div>

      {/* Timer Modes */}
      <div
        className="sf-fullfocus-card__tabs"
        role="group"
        aria-label="Choose timer mode"
      >
        {Object.entries(MODES).map(([key, value]) => (
          <button
            key={key}
            type="button"
            className={`sf-fullfocus-card__tab ${
              mode === key ? "active" : ""
            }`}
            aria-pressed={mode === key}
            onClick={() => onModeChange(key)}
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="sf-fullfocus-card__timer-wrap">
        <div className="sf-fullfocus-card__timer">
          <svg
            viewBox="0 0 300 300"
            className="sf-fullfocus-card__ring"
            aria-hidden="true"
          >
            <circle
              cx="150"
              cy="150"
              r="142"
              className="sf-fullfocus-card__ring-track"
            />

            <circle
              cx="150"
              cy="150"
              r="142"
              className="sf-fullfocus-card__ring-progress"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={
                CIRCUMFERENCE * (1 - progress)
              }
            />
          </svg>

          <span className="sf-fullfocus-card__top-dot" />

          <div className="sf-fullfocus-card__timer-content">
            <div
              className="sf-fullfocus-card__time"
              role="timer"
              aria-label={`${Math.floor(
                remaining / 60
              )} minutes and ${remaining % 60} seconds remaining`}
            >
              {formatTime(remaining)}
            </div>

            <p>
              {mode === "focus"
                ? "One thing at a time. You've got this."
                : "Take a breath. You earned this."}
            </p>
          </div>
        </div>
      </div>

      {/* Start / Pause / Reset */}
      <div className="sf-fullfocus-card__controls">
        <button
          type="button"
          className="sf-fullfocus-card__start"
          onClick={onToggle}
        >
          {running ? (
            <>
              <Pause size={19} />
              Pause session
            </>
          ) : (
            <>
              <Play size={19} />
              {remaining === 0
                ? "Start again"
                : "Start session"}
            </>
          )}
        </button>

        <button
          type="button"
          className="sf-fullfocus-card__reset"
          onClick={onReset}
          aria-label="Reset timer"
          title="Reset timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Sessions Count */}
      <div className="sf-fullfocus-card__sessions">
        <div
          className="sf-fullfocus-card__session-dots"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={
                index < completedDots ? "active" : ""
              }
            />
          ))}
        </div>

        <span>
          {sessionsLoading
            ? "Loading today's sessions..."
            : `${sessions} ${sessions === 1 ? "session" : "sessions"} completed today`}
        </span>
      </div>

      {/* Session save / load status; uses existing card layout and CSS. */}
      {(saveMessage || sessionError) && (
        <div
          role={saveFailed || (!saveMessage && sessionError) ? "alert" : "status"}
          aria-live="polite"
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 13,
            color: saveFailed || (!saveMessage && sessionError)
              ? "#b45309"
              : "#557361",
          }}
        >
          {saveMessage || sessionError}
          {saveFailed && (
            <button
              type="button"
              disabled={retrySaving}
              onClick={onRetrySave}
              style={{
                marginLeft: 8,
                padding: "4px 10px",
                border: "1px solid currentColor",
                borderRadius: 8,
                background: "transparent",
                color: "inherit",
                cursor: retrySaving ? "wait" : "pointer",
              }}
            >
              {retrySaving ? "Checking..." : "Retry save"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------
// Full Focus Timer Page
// ---------------------------------------

export default function FocusTimerPage() {
  const { user, authLoading } = useAuth();
  const userId = user?.id || null;

  const [mode, setMode] = useState("focus");
  const [remaining, setRemaining] = useState(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [todayState, setTodayState] = useState({
    ownerId: null,
    dayFrom: null,
    count: 0,
    loading: true,
    error: "",
  });
  const [saveState, setSaveState] = useState({
    message: "",
    failed: false,
    saving: false,
  });

  const deadlineRef = useRef(null);
  const finishedRef = useRef(false);
  const sessionStartedAtRef = useRef(null);
  const pendingSessionRef = useRef(null);
  const mountedRef = useRef(false);
  const latestUserIdRef = useRef(userId);

  // Guard async UI updates if the student logs out or leaves the page.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    latestUserIdRef.current = userId;
  }, [userId]);

  // Read the number of focus sessions completed *today* from MongoDB.
  useEffect(() => {
    let active = true;

    if (authLoading) {
      setTodayState({
        ownerId: null, dayFrom: null, count: 0, loading: true, error: "",
      });
      return () => { active = false; };
    }

    if (!userId) {
      setTodayState({
        ownerId: null, dayFrom: null, count: 0, loading: false, error: "",
      });
      setSaveState({ message: "", failed: false, saving: false });
      pendingSessionRef.current = null;
      return () => { active = false; };
    }

    const { from, to } = todayRange();
    setTodayState({ ownerId: userId, dayFrom: from, count: 0, loading: true, error: "" });

    async function loadToday() {
      try {
        const response = await getStudySessionStats({ from, to });
        if (!active) return;
        setTodayState({
          ownerId: userId,
          dayFrom: from,
          count: response.stats?.periodSessions ?? 0,
          loading: false,
          error: "",
        });
      } catch (error) {
        if (!active) return;
        setTodayState({
          ownerId: userId,
          dayFrom: from,
          count: 0,
          loading: false,
          error: error.message || "Could not load today's sessions.",
        });
      }
    }

    void loadToday();
    return () => { active = false; };
  }, [userId, authLoading]);

  // A successful save is counted only after MongoDB confirms the POST.
  const markSaved = useCallback(async (ownerId) => {
    if (!mountedRef.current || latestUserIdRef.current !== ownerId) return;

    const range = todayRange();
    setTodayState((current) => ({
      ownerId,
      dayFrom: range.from,
      count: current.ownerId === ownerId && current.dayFrom === range.from
        ? current.count + 1
        : 1,
      loading: false,
      error: "",
    }));
    setSaveState({
      message: "Focus session saved to MongoDB!",
      failed: false,
      saving: false,
    });
    pendingSessionRef.current = null;

    // Re-read exact count (also handles sessions saved from other tabs).
    try {
      const response = await getStudySessionStats(range);
      if (!mountedRef.current || latestUserIdRef.current !== ownerId) return;
      setTodayState({
        ownerId,
        dayFrom: range.from,
        count: response.stats?.periodSessions ?? 0,
        loading: false,
        error: "",
      });
    } catch {
      // The POST succeeded. Keep the optimistic count until next refresh.
    }
  }, []);

  const saveFocusSession = useCallback(async (payload, retry = false) => {
    if (!userId) {
      setSaveState({ message: "Please log in to save sessions.", failed: true, saving: false });
      return;
    }

    setSaveState({ message: "Saving focus session...", failed: false, saving: true });

    try {
      // If a previous response was lost, check history before manually
      // retrying so the same completed session is not normally duplicated.
      if (retry) {
        const history = await getStudySessions();
        const alreadySaved = (history.sessions || []).some((session) =>
          session.durationSeconds === payload.durationSeconds &&
          new Date(session.startedAt).getTime() === new Date(payload.startedAt).getTime() &&
          new Date(session.completedAt).getTime() === new Date(payload.completedAt).getTime()
        );

        if (alreadySaved) {
          // Avoid adding an extra count for an already-recorded session.
          const range = todayRange();
          const stats = await getStudySessionStats(range);
          if (mountedRef.current && latestUserIdRef.current === userId) {
            setTodayState({
              ownerId: userId,
              dayFrom: range.from,
              count: stats.stats?.periodSessions ?? 0,
              loading: false,
              error: "",
            });
            pendingSessionRef.current = null;
            setSaveState({
              message: "Focus session was already saved!",
              failed: false,
              saving: false,
            });
          }
          return;
        }
      }

      await createStudySession(payload);
      await markSaved(userId);
    } catch (error) {
      if (!mountedRef.current || latestUserIdRef.current !== userId) return;
      setSaveState({
        message: error.message || "Could not save focus session.",
        failed: true,
        saving: false,
      });
    }
  }, [userId, markSaved]);

  const retrySave = useCallback(() => {
    if (saveState.saving || !pendingSessionRef.current) return;
    void saveFocusSession(pendingSessionRef.current, true);
  }, [saveState.saving, saveFocusSession]);

  // Keep countdown aligned with elapsed real time, including background tabs.
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      if (deadlineRef.current === null) return;

      const next = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );
      setRemaining(next);

      if (next === 0 && !finishedRef.current) {
        finishedRef.current = true;
        setRunning(false);
        deadlineRef.current = null;

        if (mode === "focus") {
          const start = sessionStartedAtRef.current;
          const end = new Date().toISOString();
          if (start) {
            const payload = {
              durationSeconds: MODES.focus.seconds,
              startedAt: start,
              completedAt: end,
            };
            pendingSessionRef.current = payload;
            void saveFocusSession(payload);
          } else {
            setSaveState({
              message: "Session finished but start time was missing.",
              failed: false,
              saving: false,
            });
          }
        }
        sessionStartedAtRef.current = null;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [running, mode, saveFocusSession]);

  // Full-screen mode keyboard and scroll handling
  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [expanded]);

  function changeMode(nextMode) {
    setRunning(false);
    setMode(nextMode);
    setRemaining(MODES[nextMode].seconds);
    deadlineRef.current = null;
    finishedRef.current = false;
    sessionStartedAtRef.current = null;
  }

  function toggleTimer() {
    if (running) {
      // Pause and preserve remaining time
      if (deadlineRef.current !== null) {
        setRemaining(
          Math.max(
            0,
            Math.ceil(
              (deadlineRef.current - Date.now()) / 1000
            )
          )
        );
      }

      setRunning(false);
      deadlineRef.current = null;
      return;
    }

    // Restart the selected mode after completion
    const seconds =
      remaining === 0
        ? MODES[mode].seconds
        : remaining;

    setRemaining(seconds);
    finishedRef.current = false;

    // Keep the original start time when resuming from pause.
    if (sessionStartedAtRef.current === null) {
      sessionStartedAtRef.current = new Date().toISOString();
    }
    setSaveState({ message: "", failed: false, saving: false });

    deadlineRef.current = Date.now() + seconds * 1000;
    setRunning(true);
  }

  function resetTimer() {
    setRunning(false);
    deadlineRef.current = null;
    finishedRef.current = false;
    sessionStartedAtRef.current = null;
    setRemaining(MODES[mode].seconds);
  }

  function toggleExpanded() {
    setExpanded((value) => !value);
  }

  const visibleTodayState = todayState.ownerId === userId ? todayState : null;
  const sessions = visibleTodayState?.count ?? 0;
  const sessionsLoading = authLoading || !visibleTodayState || visibleTodayState.loading;

  const timerProps = {
    mode,
    remaining,
    running,
    sessions,
    sessionsLoading,
    sessionError: visibleTodayState?.error || "",
    saveMessage: saveState.message,
    saveFailed: saveState.failed,
    retrySaving: saveState.saving,
    onRetrySave: retrySave,
    onModeChange: changeMode,
    onToggle: toggleTimer,
    onReset: resetTimer,
    onExpand: toggleExpanded,
  };

  return (
    <div className="sf-fullfocus-page">

      {/* Page Heading */}
      <div className="sf-fullfocus-page__heading">
        <div>
          <p className="sf-fullfocus-page__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>Find your flow.</h1>

          <p className="sf-fullfocus-page__subtitle">
            Stay organized, keep your focus, and
            take it one step at a time.
          </p>
        </div>

        <button
          type="button"
          className="sf-fullfocus-page__add"
          onClick={() => {
            window.location.hash = "#tasks";
          }}
        >
          <Plus size={20} />
          Add task
        </button>
      </div>

      {/* Main Content */}
      <div className="sf-fullfocus-page__layout">

        {/* Timer Card */}
        <div className="sf-fullfocus-page__timer-column">
          {!expanded && (
            <TimerCard
              {...timerProps}
              expanded={false}
            />
          )}
        </div>

        {/* Motivational Content */}
        <aside className="sf-fullfocus-page__inspiration">
          <Headphones
            size={29}
            strokeWidth={1.8}
          />

          <h2>Less noise. More clarity.</h2>

          <p>
            Put your phone away, take a deep breath,
            and choose one thing to work on.
          </p>

          <button
            type="button"
            onClick={() => setExpanded(true)}
          >
            Enter focus mode
            <Maximize2 size={17} />
          </button>
        </aside>
      </div>

      {/* Footer */}
      <footer className="sf-fullfocus-page__footer">
        <span>
          <Leaf size={16} />
          Built for your next big chapter.
        </span>

        <span>
          StudyFlow · Your student space
        </span>
      </footer>

      {/* Distraction-free Focus Mode */}
      {expanded && (
        <div
          className="sf-fullfocus-page__fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Distraction-free focus mode"
        >
          <div className="sf-fullfocus-page__fullscreen-header">
            <span>
              <Leaf size={23} />
              StudyFlow.
            </span>

            <button
              type="button"
              onClick={() => setExpanded(false)}
              autoFocus
            >
              Exit focus mode
              <Minimize2 size={18} />
            </button>
          </div>

          <div className="sf-fullfocus-page__fullscreen-body">
            <p>LESS NOISE. MORE CLARITY.</p>

            <TimerCard
              {...timerProps}
              expanded={true}
            />

            <span>
              One focused step can change your day.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
