import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  Clock3,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

import {
  createNotification,
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationApi";

import "./DashboardNotifications.css";

const POLLING_INTERVAL_MS = 30000;

function toDatetimeLocal(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function freshReminderForm() {
  return {
    title: "",
    message: "",
    // Default to one hour from now, in the user's local timezone.
    remindAt: toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
  };
}

function formatReminderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid reminder date";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardNotifications({
  open,
  onToggle,
  onClose,
  userKey,
}) {
  const popupRef = useRef(null);
  const firstInputRef = useRef(null);
  const activeRef = useRef(false);
  const requestSequenceRef = useRef(0);

  const [dueNotifications, setDueNotifications] = useState([]);
  const [upcomingNotifications, setUpcomingNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(null);
  const [tab, setTab] = useState("due");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(freshReminderForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  // Keep stale requests from a logged-out/unmounted dashboard from
  // updating the next student's notification data.
  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      requestSequenceRef.current += 1;
    };
  }, []);

  const refresh = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!userKey) return;

      const requestNumber = ++requestSequenceRef.current;
      if (showLoading) setLoading(true);

      try {
        // When the dropdown is closed, only fetch the small unread count.
        const [countData, dueData, upcomingData] = await Promise.all([
          getUnreadNotificationCount(),
          open ? getNotifications("due") : Promise.resolve(null),
          open ? getNotifications("upcoming") : Promise.resolve(null),
        ]);

        if (
          !activeRef.current ||
          requestNumber !== requestSequenceRef.current
        ) {
          return;
        }

        setUnreadCount(Number(countData.unreadCount) || 0);
        if (open) {
          setDueNotifications(
            Array.isArray(dueData?.notifications) ? dueData.notifications : []
          );
          setUpcomingNotifications(
            Array.isArray(upcomingData?.notifications)
              ? upcomingData.notifications
              : []
          );
        }
        setError("");
      } catch (requestError) {
        if (
          activeRef.current &&
          requestNumber === requestSequenceRef.current
        ) {
          setError(requestError.message || "Could not load reminders.");
        }
      } finally {
        if (
          activeRef.current &&
          requestNumber === requestSequenceRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [open, userKey]
  );

  useEffect(() => {
    refresh({ showLoading: open });
  }, [refresh, open]);

  useEffect(() => {
    if (!userKey) return;

    const interval = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, POLLING_INTERVAL_MS);

    const onWindowFocus = () => refresh();
    const onVisibilityChange = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh, userKey]);

  // Click outside and Escape both close the dropdown.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!popupRef.current?.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && showForm) firstInputRef.current?.focus();
  }, [open, showForm]);

  async function performAction(action, successMessage) {
    if (busy) return;
    setBusy(true);
    setError("");
    setStatus("");

    try {
      await action();
      if (!activeRef.current) return;
      setStatus(successMessage);
      await refresh();
    } catch (actionError) {
      if (activeRef.current) {
        setError(actionError.message || "Please try again.");
      }
    } finally {
      if (activeRef.current) setBusy(false);
    }
  }

  function handleCreate(event) {
    event.preventDefault();
    if (busy) return;

    const title = form.title.trim();
    const message = form.message.trim();
    const date = new Date(form.remindAt);

    if (!title || title.length > 150) {
      setError("Enter a reminder title (up to 150 characters).");
      return;
    }
    if (message.length > 1000) {
      setError("Reminder details must be within 1000 characters.");
      return;
    }
    if (!form.remindAt || Number.isNaN(date.getTime()) || date <= new Date()) {
      setError("Choose a reminder date and time in the future.");
      return;
    }

    performAction(
      async () => {
        await createNotification({
          type: "study_reminder",
          title,
          message,
          remindAt: date.toISOString(),
        });
        if (activeRef.current) {
          setForm(freshReminderForm());
          setShowForm(false);
          setTab("upcoming");
        }
      },
      "Reminder scheduled successfully."
    );
  }

  const visibleNotifications =
    tab === "due" ? dueNotifications : upcomingNotifications;

  return (
    <div className="sf-dash-header__popup sf-dash-notifications" ref={popupRef}>
      <button
        type="button"
        className="sf-dash-header__icon-button sf-dash-notifications__trigger"
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-controls="sf-dash-notification-panel"
        onClick={onToggle}
      >
        <Bell size={21} />
        {unreadCount > 0 && (
          <span className="sf-dash-notifications__badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          id="sf-dash-notification-panel"
          className="sf-dash-header__dropdown sf-dash-notifications__panel"
          aria-label="Notifications and reminders"
        >
          <div className="sf-dash-notifications__top">
            <div>
              <h2>Notifications</h2>
              <p>
                {unreadCount === null
                  ? "Checking reminders..."
                  : `${unreadCount} unread reminder${unreadCount === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="sf-dash-notifications__top-actions">
              <button
                type="button"
                title="Refresh reminders"
                aria-label="Refresh reminders"
                onClick={() => refresh({ showLoading: true })}
                disabled={busy || loading}
              >
                <RefreshCw size={17} />
              </button>
              <button
                type="button"
                title="Close notifications"
                aria-label="Close notifications"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="sf-dash-notifications__toolbar">
            <div className="sf-dash-notifications__tabs" role="group" aria-label="Reminder category">
              <button
                type="button"
                className={tab === "due" ? "active" : ""}
                onClick={() => { setTab("due"); setShowForm(false); }}
                aria-pressed={tab === "due"}
              >
                Due
              </button>
              <button
                type="button"
                className={tab === "upcoming" ? "active" : ""}
                onClick={() => { setTab("upcoming"); setShowForm(false); }}
                aria-pressed={tab === "upcoming"}
              >
                Upcoming
              </button>
            </div>
            <button
              type="button"
              className="sf-dash-notifications__new"
              onClick={() => {
                setShowForm((current) => !current);
                setError("");
                setStatus("");
              }}
              aria-expanded={showForm}
              disabled={busy}
            >
              <Plus size={15} />
              New reminder
            </button>
          </div>

          {error && <p className="sf-dash-notifications__error" role="alert">{error}</p>}
          {status && <p className="sf-dash-notifications__success" role="status">{status}</p>}

          {showForm ? (
            <form className="sf-dash-notifications__form" onSubmit={handleCreate}>
              <h3>Schedule study reminder</h3>
              <label htmlFor="sf-reminder-title">Title</label>
              <input
                id="sf-reminder-title"
                ref={firstInputRef}
                type="text"
                maxLength={150}
                placeholder="e.g. Revise Mathematics"
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              />
              <label htmlFor="sf-reminder-details">Details (optional)</label>
              <textarea
                id="sf-reminder-details"
                rows={3}
                maxLength={1000}
                placeholder="What do you want to remember?"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              />
              <label htmlFor="sf-reminder-time">Remind me on</label>
              <input
                id="sf-reminder-time"
                type="datetime-local"
                min={toDatetimeLocal(new Date())}
                required
                value={form.remindAt}
                onChange={(event) => setForm((current) => ({ ...current, remindAt: event.target.value }))}
              />
              <p className="sf-dash-notifications__hint">Times are shown in your device's local timezone.</p>
              <div className="sf-dash-notifications__form-actions">
                <button type="submit" disabled={busy}>
                  {busy ? "Saving..." : "Schedule reminder"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {tab === "due" && unreadCount > 0 && (
                <div className="sf-dash-notifications__bulk-actions">
                  <button
                    type="button"
                    onClick={() => performAction(
                      () => markAllNotificationsRead(),
                      "All due reminders marked as read."
                    )}
                    disabled={busy}
                  >
                    <CheckCheck size={15} />
                    Mark all as read
                  </button>
                </div>
              )}

              {loading && <p className="sf-dash-notifications__empty" role="status">Loading reminders...</p>}

              {!loading && visibleNotifications.length === 0 && (
                <div className="sf-dash-notifications__empty">
                  {tab === "due" ? <Check size={24} /> : <CalendarClock size={24} />}
                  <p>{tab === "due" ? "No due reminders yet." : "No upcoming reminders yet."}</p>
                  <small>Use New reminder to plan your next study session.</small>
                </div>
              )}

              {!loading && visibleNotifications.length > 0 && (
                <div className="sf-dash-notifications__list">
                  {visibleNotifications.map((notification) => (
                    <article
                      className={`sf-dash-notifications__item ${notification.isRead ? "is-read" : "is-unread"}`}
                      key={notification.id}
                    >
                      <div className="sf-dash-notifications__item-icon" aria-hidden="true">
                        {tab === "upcoming" ? <CalendarClock size={18} /> : <Clock3 size={18} />}
                      </div>
                      <div className="sf-dash-notifications__item-content">
                        <h3>
                          {notification.title}
                          {!notification.isRead && tab === "due" && (
                            <span className="sf-dash-notifications__unread-dot" aria-label="Unread" />
                          )}
                        </h3>
                        {notification.message && <p>{notification.message}</p>}
                        <time dateTime={notification.remindAt}>
                          {formatReminderDate(notification.remindAt)}
                        </time>
                        <div className="sf-dash-notifications__item-actions">
                          {tab === "due" && !notification.isRead && (
                            <button
                              type="button"
                              onClick={() => performAction(
                                () => markNotificationRead(notification.id),
                                "Reminder marked as read."
                              )}
                              disabled={busy}
                            >
                              <Check size={14} /> Read
                            </button>
                          )}
                          <button
                            type="button"
                            className="sf-dash-notifications__delete"
                            onClick={() => performAction(
                              () => deleteNotification(notification.id),
                              "Reminder deleted."
                            )}
                            disabled={busy}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                  {visibleNotifications.length === 100 && (
                    <p className="sf-dash-notifications__hint">Showing the latest 100 reminders.</p>
                  )}
                </div>
              )}
            </>
          )}
          <p className="sf-dash-notifications__footer">
            Reminders appear while StudyFlow is open. Browser push alerts are not enabled.
          </p>
        </section>
      )}
    </div>
  );
}
