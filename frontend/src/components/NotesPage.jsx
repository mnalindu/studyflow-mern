
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Sun,
  Plus,
  NotebookPen,
  Trash2,
  Leaf,
} from "lucide-react";

import "./NotesPage.css";

// ---------------------------------------
// Local browser storage
// ---------------------------------------

const STORAGE_KEY = "studyflow-notes-v1";

// Starter notes based on your demo screenshot
const starterNotes = [
  {
    id: "starter-note-1",
    title: "A little reminder to myself",
    content:
      "Progress is not always loud. Sometimes it is simply showing up, opening your books, and trying again. 🌱",
  },
  {
    id: "starter-note-2",
    title: "Database revision",
    content:
      "Review normalization (1NF, 2NF, 3NF).\nPractice JOIN queries.\nMake flashcards for ACID properties.",
  },
];

// ---------------------------------------
// Load notes from localStorage
// ---------------------------------------

function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(
      STORAGE_KEY
    );

    if (savedNotes !== null) {
      const parsed = JSON.parse(savedNotes);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (note) =>
            note &&
            typeof note.id === "string" &&
            typeof note.title === "string" &&
            typeof note.content === "string"
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn(
      "Could not load saved notes:",
      error
    );
  }

  return starterNotes;
}

// ---------------------------------------
// Create unique note ID
// ---------------------------------------

function createNoteId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

// ---------------------------------------
// Individual Note Card
// ---------------------------------------

function NoteCard({
  note,
  index,
  onUpdate,
  onDelete,
  titleRef,
  storageError,
}) {
  const color =
    index % 2 === 0 ? "green" : "yellow";

  return (
    <article
      className={`sf-note-card sf-note-card--${color}`}
    >
      {/* Note Header */}
      <div className="sf-note-card__header">

        <NotebookPen
          size={22}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <button
          type="button"
          className="sf-note-card__delete"
          aria-label={`Delete note: ${
            note.title || "Untitled note"
          }`}
          title="Delete note"
          onClick={() => onDelete(note)}
        >
          <Trash2
            size={19}
            strokeWidth={1.8}
          />
        </button>

      </div>

      {/* Editable Content */}
      <div className="sf-note-card__editor">

        <input
          ref={titleRef}
          type="text"
          className="sf-note-card__title"
          placeholder="Give your note a title"
          aria-label="Note title"
          maxLength={120}
          value={note.title}
          onChange={(event) =>
            onUpdate(
              note.id,
              "title",
              event.target.value
            )
          }
        />

        <textarea
          className="sf-note-card__content"
          placeholder="Start writing your thoughts..."
          aria-label={`Content of ${
            note.title || "untitled note"
          }`}
          value={note.content}
          onChange={(event) =>
            onUpdate(
              note.id,
              "content",
              event.target.value
            )
          }
        />

      </div>

      {/* Note Footer */}
      <p className="sf-note-card__footer">
        {storageError
          ? "Browser storage unavailable · Session only"
          : "Saved automatically · Your personal space"}
      </p>

    </article>
  );
}

// ---------------------------------------
// Add New Note Card
// ---------------------------------------

function AddNoteCard({ onClick }) {
  return (
    <button
      type="button"
      className="sf-note-add-card"
      onClick={onClick}
    >
      <Plus
        size={31}
        strokeWidth={1.8}
      />

      <span>
        A new thought, a new page
      </span>
    </button>
  );
}

// ---------------------------------------
// Main Notes Page
// ---------------------------------------

export default function NotesPage() {
  const [notes, setNotes] = useState(loadNotes);

  const [storageError, setStorageError] =
    useState(false);

  const [focusNoteId, setFocusNoteId] =
    useState(null);

  const newTitleRef = useRef(null);

  // -----------------------------------
  // Autosave changes
  // -----------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notes)
      );

      setStorageError(false);
    } catch (error) {
      setStorageError(true);

      console.warn(
        "Could not save notes:",
        error
      );
    }
  }, [notes]);

  // Focus title after creating new note
  useEffect(() => {
    if (!focusNoteId) return;

    newTitleRef.current?.focus();
    setFocusNoteId(null);
  }, [focusNoteId]);

  // -----------------------------------
  // Create note
  // -----------------------------------

  function addNote() {
    const newNote = {
      id: createNoteId(),
      title: "",
      content: "",
    };

    setNotes((current) => [
      ...current,
      newNote,
    ]);

    setFocusNoteId(newNote.id);
  }

  // -----------------------------------
  // Update note
  // -----------------------------------

  function updateNote(id, field, value) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              [field]: value,
            }
          : note
      )
    );
  }

  // -----------------------------------
  // Delete note
  // -----------------------------------

  function deleteNote(note) {
    const confirmed = window.confirm(
      `Delete "${
        note.title || "Untitled note"
      }"?`
    );

    if (!confirmed) return;

    setNotes((current) =>
      current.filter(
        (item) => item.id !== note.id
      )
    );
  }

  return (
    <div className="sf-notes-page">

      {/* Page Heading */}
      <div className="sf-notes-page__heading">

        <div>
          <p className="sf-notes-page__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>
            Good ideas live here.
          </h1>

          <p className="sf-notes-page__description">
            Stay organized, keep your focus, and
            take it one step at a time.
          </p>
        </div>

        {/* New Note Button */}
        <button
          type="button"
          className="sf-notes-page__new-button"
          onClick={addNote}
        >
          <Plus size={20} />
          New note
        </button>

      </div>

      {/* Notes Grid */}
      <section
        className="sf-notes-page__grid"
        aria-label="Your personal notes"
      >
        {notes.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            index={index}
            onUpdate={updateNote}
            onDelete={deleteNote}
            titleRef={
              focusNoteId === note.id
                ? newTitleRef
                : null
            }
            storageError={storageError}
          />
        ))}

        <AddNoteCard onClick={addNote} />
      </section>

      {/* Page Footer */}
      <footer className="sf-notes-page__footer">

        <span>
          <Leaf size={16} />
          Built for your next big chapter.
        </span>

        <span>
          StudyFlow · Your student space
        </span>

      </footer>

    </div>
  );
}
