import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAuth } from "../components/AuthContext";
import { getStudyInsights } from "../services/studyInsightsApi";

// Module-scoped cache: Dashboard cards and charts make just one
// authenticated request while they are mounted together.
const owners = new Map();
const EMPTY = Object.freeze({ loading: false, data: null, error: "" });

function ownerStore(id) {
  if (!owners.has(id)) {
    owners.set(id, {
      snapshot: { loading: true, data: null, error: "" },
      listeners: new Set(),
      inflight: null,
    });
  }
  return owners.get(id);
}

function update(store, patch) {
  store.snapshot = { ...store.snapshot, ...patch };
  for (const notify of store.listeners) notify();
}

export async function refreshStudyInsights(userId) {
  if (!userId) return;
  const store = ownerStore(userId);
  if (store.inflight) return store.inflight;

  update(store, { loading: store.snapshot.data === null, error: "" });
  const request = getStudyInsights()
    .then((data) => {
      update(store, { data, loading: false, error: "" });
      return data;
    })
    .catch((error) => {
      update(store, {
        loading: false,
        error: error.message || "Could not load study statistics.",
      });
      throw error;
    })
    .finally(() => { store.inflight = null; });

  store.inflight = request;
  return request;
}

export function useStudyInsights() {
  const { user, authLoading } = useAuth();
  const userId = authLoading ? null : user?.id || null;

  const subscribe = useCallback((notify) => {
    if (!userId) return () => {};
    const store = ownerStore(userId);
    store.listeners.add(notify);
    return () => store.listeners.delete(notify);
  }, [userId]);

  const getSnapshot = useCallback(
    () => userId ? ownerStore(userId).snapshot : EMPTY,
    [userId]
  );

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (userId) void refreshStudyInsights(userId).catch(() => {});
  }, [userId]);

  return {
    ...state,
    refresh: () => refreshStudyInsights(userId),
  };
}

// Local calendar dates and Monday-based weeks, matching the user's browser time zone.
export function dateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addLocalDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function focusMetrics(insights, now = new Date()) {
  const days = insights?.days || [];
  const dayMap = new Map(days.map((entry) => [entry.date, entry]));
  const current = dayMap.get(dateKey(now));
  const todaySeconds = current?.focusSeconds || 0;
  const todaySessions = current?.sessions || 0;
  const totalFocusSeconds = insights?.totalFocusSeconds || 0;
  const totalSessions = insights?.totalSessions || 0;

  // A streak stays active through the day after the last study day.
  let streak = 0;
  const yesterday = addLocalDays(now, -1);
  const start = current?.sessions ? now : yesterday;
  for (let date = start, i = 0; i < days.length + 1; i += 1) {
    if (!dayMap.get(dateKey(date))?.sessions) break;
    streak += 1;
    date = addLocalDays(date, -1);
  }

  const mondayOffset = (now.getDay() + 6) % 7;
  const thisMonday = addLocalDays(now, -mondayOffset);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const week = (start) => dayLabels.map((day, index) => {
    const key = dateKey(addLocalDays(start, index));
    const seconds = dayMap.get(key)?.focusSeconds || 0;
    return { day, date: key, hours: seconds / 3600 };
  });

  return {
    todaySeconds,
    todaySessions,
    totalFocusSeconds,
    totalSessions,
    streak,
    currentWeek: week(thisMonday),
    previousWeek: week(addLocalDays(thisMonday, -7)),
  };
}

export function focusDisplay(seconds) {
  const minutes = Math.round(seconds / 60);
  return minutes < 60
    ? { value: String(minutes), unit: "min" }
    : { value: (seconds / 3600).toFixed(1), unit: "hours" };
}

export function chartAxisMax(data) {
  const high = Math.max(0, ...data.map((entry) => entry.hours));
  return Math.max(4, Math.ceil(high / 4) * 4);
}
