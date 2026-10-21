
import { useEffect, useRef, useState } from "react";

import {
  Sun,
  Plus,
  Users,
  ArrowRight,
  Leaf,
  X,
  Clock3,
  Play,
} from "lucide-react";

import "./StudyRoomsPage.css";

// =====================================
// Room Information
// =====================================

const studyRooms = [
  {
    id: "quiet",
    name: "The quiet corner",
    description: "Deep work & gentle focus",
    emoji: "🌿",
    focusMinutes: 25,
    introduction:
      "A calm place to settle in and work on one thing at a time.",
  },
  {
    id: "exam",
    name: "Exam prep club",
    description: "One chapter closer",
    emoji: "📚",
    focusMinutes: 25,
    introduction:
      "Make space for revision, practice and one more chapter.",
  },
  {
    id: "night",
    name: "Night owl lounge",
    description: "For your after-hours ideas",
    emoji: "🌙",
    focusMinutes: 25,
    introduction:
      "A peaceful study corner for the ideas that arrive after dark.",
  },
];

// =====================================
// Single Study Room Card
// =====================================

function StudyRoomCard({ room, onEnter }) {
  return (
    <article className="sf-room-card">

      {/* Room Illustration */}
      <div
        className="sf-room-card__visual"
        aria-hidden="true"
      >
        <span className="sf-room-card__emoji">
          {room.emoji}
        </span>
      </div>

      {/* Room Information */}
      <div className="sf-room-card__body">

        <h2 className="sf-room-card__title">
          {room.name}
        </h2>

        <p className="sf-room-card__description">
          {room.description}
        </p>

        {/* Metadata */}
        <div className="sf-room-card__meta">
          <span>Sample room</span>

          <span>
            {room.focusMinutes} min focus
          </span>
        </div>

        {/* Enter Room Button */}
        <button
          type="button"
          className="sf-room-card__button"
          onClick={() => onEnter(room)}
        >
          Enter demo room
          <ArrowRight size={18} />
        </button>

      </div>
    </article>
  );
}

// =====================================
// Local Room Preview Modal
// =====================================

function RoomPreview({ room, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

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
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="sf-room-preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-room-preview-title"
        aria-describedby="sf-room-preview-description"
      >
        {/* Modal Header */}
        <div className="sf-room-preview__header">

          <span className="sf-room-preview__label">
            <Leaf size={16} />
            STUDYFLOW ROOM PREVIEW
          </span>

          <button
            ref={closeButtonRef}
            type="button"
            className="sf-room-preview__close"
            onClick={onClose}
            aria-label="Close room preview"
          >
            <X size={22} />
          </button>

        </div>

        {/* Room Emoji */}
        <div
          className="sf-room-preview__visual"
          aria-hidden="true"
        >
          <span>{room.emoji}</span>
        </div>

        {/* Modal Content */}
        <div className="sf-room-preview__content">

          <h2 id="sf-room-preview-title">
            {room.name}
          </h2>

          <p id="sf-room-preview-description">
            {room.introduction}
          </p>

          <div className="sf-room-preview__session">
            <Clock3 size={21} />

            <span>
              {room.focusMinutes}-minute focus session
            </span>
          </div>

          <div className="sf-room-preview__information">
            <Users size={20} />

            <p>
              You're exploring a local room preview.
              Live participants, shared sessions and
              group chat will be added when the
              backend is connected.
            </p>
          </div>

          {/* Actions */}
          <div className="sf-room-preview__actions">

            <button
              type="button"
              className="sf-room-preview__start"
              onClick={startSoloFocus}
            >
              <Play size={18} />
              Start solo focus
            </button>

            <button
              type="button"
              className="sf-room-preview__back"
              onClick={onClose}
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
  const [selectedRoomId, setSelectedRoomId] =
    useState(null);

  const selectedRoom =
    studyRooms.find(
      (room) => room.id === selectedRoomId
    ) || null;

  function goToTasks() {
    window.location.hash = "#tasks";
  }

  return (
    <div className="sf-study-rooms">

      {/* Page Header */}
      <div className="sf-study-rooms__heading">

        <div>
          <p className="sf-study-rooms__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>
            Better, together.
          </h1>

          <p className="sf-study-rooms__description">
            A shared space for quiet focus.
            Explore the room experience.
          </p>
        </div>

        {/* Add Task */}
        <button
          type="button"
          className="sf-study-rooms__add-task"
          onClick={goToTasks}
        >
          <Plus size={20} />
          Add task
        </button>

      </div>

      {/* Introduction Banner */}
      <section className="sf-study-rooms__banner">

        <span className="sf-study-rooms__banner-icon">
          <Users size={29} strokeWidth={1.8} />
        </span>

        <div className="sf-study-rooms__banner-copy">
          <h2>
            Your focus feels better with company.
          </h2>

          <p>
            Demo rooms — explore a local room experience.
            Live collaboration needs a backend.
          </p>
        </div>

      </section>

      {/* Study Room Cards */}
      <section
        className="sf-study-rooms__grid"
        aria-label="Available study room previews"
      >
        {studyRooms.map((room) => (
          <StudyRoomCard
            key={room.id}
            room={room}
            onEnter={(selected) =>
              setSelectedRoomId(selected.id)
            }
          />
        ))}
      </section>

      {/* Footer */}
      <footer className="sf-study-rooms__footer">

        <span>
          <Leaf size={16} />
          Built for your next big chapter.
        </span>

        <span>
          StudyFlow · Your student space
        </span>

      </footer>

      {/* Selected Room Modal */}
      {selectedRoom && (
        <RoomPreview
          room={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
        />
      )}

    </div>
  );
}
