import { useCallback, useEffect, useRef, useState } from "react";

import {
  Sun,
  Plus,
  Users,
  ArrowRight,
  Leaf,
  X,
  Clock3,
  Play,
  Trash2,
  RefreshCw,
  LogOut,
} from "lucide-react";

import { useAuth } from "./AuthContext";
import {
  getStudyRooms,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  deleteStudyRoom,
} from "../services/studyRoomApi";

// Keep the existing StudyFlow room design and CSS unchanged.
import "./StudyRoomsPage.css";
import "./StudyRoomsPageIntegration.css";

const initialForm = {
  name: "",
  description: "",
  introduction: "",
  emoji: "🌿",
  focusMinutes: 25,
  isPublic: true,
};

const emptyRoomState = {
  ownerId: null,
  rooms: [],
  loading: false,
  error: "",
};

// =====================================
// Individual Study Room Card
// =====================================

function StudyRoomCard({ room, onEnter, disabled }) {
  return (
    <article className="sf-room-card">
      <div className="sf-room-card__visual" aria-hidden="true">
        <span className="sf-room-card__emoji">{room.emoji || "🌿"}</span>
      </div>

      <div className="sf-room-card__body">
        <h2 className="sf-room-card__title">{room.name}</h2>
        <p className="sf-room-card__description">
          {room.description || "A place to focus together."}
        </p>

        <div className="sf-room-card__meta">
          <span>
            {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
          </span>
          <span>{room.focusMinutes} min focus</span>
          {room.isOwner ? (
            <span className="sf-rooms-owner-label">Your room</span>
          ) : !room.isPublic ? (
            <span className="sf-rooms-owner-label">Private</span>
          ) : null}
        </div>

        <button
          type="button"
          className="sf-room-card__button"
          onClick={() => onEnter(room)}
          disabled={disabled}
        >
          {room.isMember ? "Open room" : "View room"}
          <ArrowRight size={18} />
        </button>
      </div>
    </article>
  );
}

// =====================================
// Create Room Form
// =====================================

function CreateRoomForm({ form, setForm, onSubmit, onCancel, busy }) {
  function change(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <form className="sf-rooms-create-panel" onSubmit={onSubmit}>
      <div className="sf-rooms-create-panel__heading">
        <h2>Create your study room</h2>
        <p>Choose a name, a focus time, and a welcoming space.</p>
      </div>

      <div className="sf-rooms-form-grid">
        <label className="sf-rooms-field">
          Room name
          <input
            type="text"
            value={form.name}
            onChange={(event) => change("name", event.target.value)}
            placeholder="e.g. The quiet corner"
            required
            minLength={3}
            maxLength={80}
            disabled={busy}
          />
        </label>

        <label className="sf-rooms-field">
          Short description
          <input
            type="text"
            value={form.description}
            onChange={(event) => change("description", event.target.value)}
            placeholder="Deep work & gentle focus"
            maxLength={180}
            disabled={busy}
          />
        </label>

        <label className="sf-rooms-field sf-rooms-field--full">
          Introduction
          <textarea
            value={form.introduction}
            onChange={(event) => change("introduction", event.target.value)}
            placeholder="What will students do in this room?"
            maxLength={500}
            rows={3}
            disabled={busy}
          />
        </label>

        <label className="sf-rooms-field">
          Room emoji
          <input
            type="text"
            value={form.emoji}
            onChange={(event) => change("emoji", event.target.value)}
            maxLength={20}
            placeholder="🌿"
            disabled={busy}
          />
        </label>

        <label className="sf-rooms-field">
          Focus duration
          <select
            value={form.focusMinutes}
            onChange={(event) => change("focusMinutes", Number(event.target.value))}
            disabled={busy}
          >
            {[15, 25, 30, 45, 50, 60, 90].map((minutes) => (
              <option key={minutes} value={minutes}>{minutes} minutes</option>
            ))}
          </select>
        </label>
      </div>

      <label className="sf-rooms-public-option">
        <input
          type="checkbox"
          checked={form.isPublic}
          onChange={(event) => change("isPublic", event.target.checked)}
          disabled={busy}
        />
        <span>
          <strong>Public study room</strong>
          <small>
            Anyone signed in can discover and join. Private rooms are only
            accessible to existing members; invitations aren't supported yet.
          </small>
        </span>
      </label>

      <div className="sf-rooms-form-actions">
        <button className="sf-rooms-primary-button" type="submit" disabled={busy}>
          <Plus size={18} />
          {busy ? "Creating..." : "Create room"}
        </button>
        <button className="sf-rooms-secondary-button" type="button" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// =====================================
// Room Preview / Membership Modal
// =====================================

function RoomPreview({
  room,
  onClose,
  onJoin,
  onLeave,
  onDelete,
  busy,
  feedback,
}) {
  const closeButtonRef = useRef(null);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !busyRef.current) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  function startSoloFocus() {
    onClose();
    window.location.hash = "#focus";
  }

  return (
    <div
      className="sf-room-preview__overlay"
      onMouseDown={(event) => {
        if (!busy && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="sf-room-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-room-preview-title"
        aria-describedby="sf-room-preview-description"
      >
        <div className="sf-room-preview__header">
          <span className="sf-room-preview__label">
            <Leaf size={16} />
            STUDYFLOW ROOM
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            className="sf-room-preview__close"
            onClick={onClose}
            disabled={busy}
            aria-label="Close room"
          >
            <X size={22} />
          </button>
        </div>

        <div className="sf-room-preview__visual" aria-hidden="true">
          <span>{room.emoji || "🌿"}</span>
        </div>

        <div className="sf-room-preview__content">
          <h2 id="sf-room-preview-title">{room.name}</h2>
          <p id="sf-room-preview-description">
            {room.introduction || room.description || "Your space for focused studying."}
          </p>

          <div className="sf-room-preview__session">
            <Clock3 size={21} />
            <span>{room.focusMinutes}-minute focus session</span>
          </div>

          <div className="sf-room-preview__information">
            <Users size={20} />
            <p>
              {room.memberCount} joined {room.memberCount === 1 ? "member" : "members"}
              {room.isOwner ? " · You created this room" : ""}
              {room.isMember && !room.isOwner ? " · You joined this room" : ""}.
              {" "}Live presence, group chat and synchronized sessions are not available yet.
            </p>
          </div>

          {feedback && (
            <p
              className={`sf-rooms-feedback sf-rooms-feedback--${feedback.type}`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}

          <div className="sf-room-preview__actions sf-rooms-modal-actions">
            {!room.isMember && room.isPublic && (
              <button
                type="button"
                className="sf-room-preview__start"
                onClick={() => onJoin(room)}
                disabled={busy}
              >
                <Users size={18} />
                {busy ? "Joining..." : "Join room"}
              </button>
            )}

            {room.isMember && !room.isOwner && (
              <button
                type="button"
                className="sf-rooms-secondary-button"
                onClick={() => onLeave(room)}
                disabled={busy}
              >
                <LogOut size={18} />
                {busy ? "Leaving..." : "Leave room"}
              </button>
            )}

            <button
              type="button"
              className="sf-room-preview__start"
              onClick={startSoloFocus}
              disabled={busy}
            >
              <Play size={18} />
              Start solo focus
            </button>

            {room.isOwner && (
              <button
                type="button"
                className="sf-rooms-danger-button"
                onClick={() => onDelete(room)}
                disabled={busy}
              >
                <Trash2 size={18} />
                Delete room
              </button>
            )}

            <button
              type="button"
              className="sf-room-preview__back"
              onClick={onClose}
              disabled={busy}
            >
              Back to rooms
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// =====================================
// Main Study Rooms Page
// =====================================

export default function StudyRoomsPage() {
  const { user, authLoading } = useAuth();
  const userId = authLoading ? null : user?.id || null;
  const currentUserRef = useRef(userId);
  currentUserRef.current = userId;

  const [roomState, setRoomState] = useState(emptyRoomState);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [busyAction, setBusyAction] = useState("");
  const [feedback, setFeedback] = useState(null);
  const requestVersionRef = useRef(0);
  const mutationLockRef = useRef(false);

  useEffect(() => {
    let active = true;
    const version = ++requestVersionRef.current;

    setSelectedRoomId(null);
    setShowCreateForm(false);
    setBusyAction("");
    setFeedback(null);
    mutationLockRef.current = false;

    if (!userId) {
      setRoomState(emptyRoomState);
      return () => { active = false; };
    }

    setRoomState({ ownerId: userId, rooms: [], loading: true, error: "" });

    getStudyRooms()
      .then((data) => {
        if (!active || requestVersionRef.current !== version) return;
        setRoomState({
          ownerId: userId,
          rooms: Array.isArray(data.rooms) ? data.rooms : [],
          loading: false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active || requestVersionRef.current !== version) return;
        setRoomState({
          ownerId: userId,
          rooms: [],
          loading: false,
          error: error.message || "Could not load study rooms.",
        });
      });

    return () => { active = false; };
  }, [userId]);

  const readyForUser = Boolean(userId && roomState.ownerId === userId);
  const rooms = readyForUser ? roomState.rooms : [];
  const loading = authLoading || (Boolean(userId) && (!readyForUser || roomState.loading));
  const loadError = readyForUser ? roomState.error : "";
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) || null;
  const isBusy = Boolean(busyAction);

  const closePreview = useCallback(() => setSelectedRoomId(null), []);

  async function refreshRooms() {
    if (!userId || mutationLockRef.current) return;
    const ownerAtStart = userId;
    const version = ++requestVersionRef.current;
    setFeedback(null);
    setRoomState((previous) => ({ ...previous, loading: true, error: "" }));

    try {
      const data = await getStudyRooms();
      if (currentUserRef.current !== ownerAtStart || requestVersionRef.current !== version) return;
      const next = Array.isArray(data.rooms) ? data.rooms : [];
      setRoomState({ ownerId: ownerAtStart, rooms: next, loading: false, error: "" });
    } catch (error) {
      if (currentUserRef.current !== ownerAtStart || requestVersionRef.current !== version) return;
      setRoomState((previous) => ({
        ...previous,
        loading: false,
        error: error.message || "Could not refresh study rooms.",
      }));
    }
  }

  async function runMutation(label, request, onSuccess, roomId = null) {
    if (!userId || loading || mutationLockRef.current) return;
    mutationLockRef.current = true;
    const ownerAtStart = userId;
    const version = ++requestVersionRef.current;
    setBusyAction(label);
    setFeedback(null);

    try {
      const data = await request();
      if (currentUserRef.current !== ownerAtStart || requestVersionRef.current !== version) return;
      onSuccess(data, ownerAtStart);
    } catch (error) {
      if (currentUserRef.current !== ownerAtStart || requestVersionRef.current !== version) return;
      setFeedback({
        type: "error",
        message: error.message || "The request failed. Please try again.",
        roomId,
      });
    } finally {
      if (currentUserRef.current === ownerAtStart && requestVersionRef.current === version) {
        mutationLockRef.current = false;
        setBusyAction("");
      }
    }
  }

  function updateRoom(room, ownerAtStart) {
    setRoomState((previous) =>
      previous.ownerId !== ownerAtStart
        ? previous
        : {
            ...previous,
            rooms: previous.rooms.map((existing) =>
              existing.id === room.id ? room : existing
            ),
          }
    );
  }

  function handleCreate(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (name.length < 3 || name.length > 80) {
      setFeedback({ type: "error", message: "Room name must be 3–80 characters.", roomId: null });
      return;
    }

    const payload = {
      name,
      description: form.description.trim(),
      introduction: form.introduction.trim(),
      emoji: form.emoji.trim() || "🌿",
      focusMinutes: Number(form.focusMinutes),
      isPublic: form.isPublic,
    };

    void runMutation("create", () => createStudyRoom(payload), (data, ownerAtStart) => {
      const newRoom = data.room;
      setRoomState((previous) =>
        previous.ownerId !== ownerAtStart
          ? previous
          : { ...previous, rooms: [newRoom, ...previous.rooms] }
      );
      setForm(initialForm);
      setShowCreateForm(false);
      setSelectedRoomId(newRoom.id);
      setFeedback({ type: "success", message: "Study room created successfully.", roomId: newRoom.id });
    });
  }

  function handleJoin(room) {
    void runMutation("join", () => joinStudyRoom(room.id), (data, ownerAtStart) => {
      updateRoom(data.room, ownerAtStart);
      setFeedback({ type: "success", message: "You've joined this room.", roomId: room.id });
    }, room.id);
  }

  function handleLeave(room) {
    void runMutation("leave", () => leaveStudyRoom(room.id), (data, ownerAtStart) => {
      updateRoom(data.room, ownerAtStart);
      setFeedback({ type: "success", message: "You've left this room.", roomId: room.id });
    }, room.id);
  }

  function handleDelete(room) {
    if (!window.confirm(`Permanently delete "${room.name}"? All members will lose access.`)) return;
    void runMutation("delete", () => deleteStudyRoom(room.id), (_, ownerAtStart) => {
      setRoomState((previous) =>
        previous.ownerId !== ownerAtStart
          ? previous
          : { ...previous, rooms: previous.rooms.filter((item) => item.id !== room.id) }
      );
      setSelectedRoomId(null);
      setFeedback({ type: "success", message: `Deleted "${room.name}".`, roomId: null });
    }, room.id);
  }

  function goToTasks() {
    window.location.hash = "#tasks";
  }

  return (
    <div className="sf-study-rooms">
      {/* Original page heading */}
      <div className="sf-study-rooms__heading">
        <div>
          <p className="sf-study-rooms__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>
          <h1>Better, together.</h1>
          <p className="sf-study-rooms__description">
            A shared space for quiet focus. Find or create your study room.
          </p>
        </div>

        <div className="sf-rooms-header-actions">
          <button type="button" className="sf-study-rooms__add-task" onClick={goToTasks}>
            <Plus size={20} />
            Add task
          </button>
          <button
            type="button"
            className="sf-rooms-primary-button"
            onClick={() => {
              setShowCreateForm((value) => !value);
              setFeedback(null);
            }}
            disabled={isBusy || loading}
            aria-expanded={showCreateForm}
          >
            <Plus size={18} />
            Create room
          </button>
        </div>
      </div>

      {/* Original study rooms banner */}
      <section className="sf-study-rooms__banner">
        <span className="sf-study-rooms__banner-icon">
          <Users size={29} strokeWidth={1.8} />
        </span>
        <div className="sf-study-rooms__banner-copy">
          <h2>Your focus feels better with company.</h2>
          <p>
            Discover student study rooms and manage your membership.
            Live participants and group chat are coming in a later phase.
          </p>
        </div>
      </section>

      {showCreateForm && (
        <CreateRoomForm
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onCancel={() => { setShowCreateForm(false); setFeedback(null); }}
          busy={isBusy}
        />
      )}

      {feedback && feedback.roomId === null && (
        <p
          className={`sf-rooms-feedback sf-rooms-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}

      <div className="sf-rooms-list-heading">
        <h2>Available study rooms</h2>
        <button
          type="button"
          className="sf-rooms-refresh-button"
          disabled={isBusy || loading}
          onClick={refreshRooms}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loadError && (
        <div className="sf-rooms-load-state sf-rooms-load-state--error" role="alert">
          {loadError}
          <button type="button" onClick={refreshRooms}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="sf-rooms-load-state" role="status">Loading study rooms...</div>
      ) : !loadError && rooms.length === 0 ? (
        <div className="sf-rooms-load-state">
          <Users size={26} />
          <strong>No study rooms yet</strong>
          <p>Be the first to create a room for your study group.</p>
        </div>
      ) : (
        <section className="sf-study-rooms__grid" aria-label="Available study rooms">
          {rooms.map((room) => (
            <StudyRoomCard
              key={room.id}
              room={room}
              onEnter={(selected) => { setSelectedRoomId(selected.id); setFeedback(null); }}
              disabled={isBusy}
            />
          ))}
        </section>
      )}

      {/* Original footer */}
      <footer className="sf-study-rooms__footer">
        <span><Leaf size={16} />Built for your next big chapter.</span>
        <span>StudyFlow · Your student space</span>
      </footer>

      {selectedRoom && (
        <RoomPreview
          room={selectedRoom}
          onClose={closePreview}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onDelete={handleDelete}
          busy={isBusy}
          feedback={feedback?.roomId === selectedRoom.id ? feedback : null}
        />
      )}
    </div>
  );
}
