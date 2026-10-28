
import {
  useCallback,
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

import { useAuth } from "./AuthContext";
import {
  getNotes,
  createNote,
  updateNote as updateNoteApi,
  deleteNote as deleteNoteApi,
} from "../services/noteApi";
import "./NotesPage.css";

const AUTOSAVE_DELAY = 800;

const saveMessages = {
  pending: "Waiting to save...",
  saving: "Saving to MongoDB...",
  saved: "Saved automatically · Your personal space",
  error: "Save failed · Edit the note to retry",
  title: "Enter a note title to save",
};

// ---------------------------------------
// Individual Note Card
// ---------------------------------------

function NoteCard({
  note,
  index,
  onUpdate,
  onDelete,
  titleRef,
  saveStatus,
  isDeleting,
  onBlurSave,
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
          disabled={isDeleting}
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
          onBlur={() => onBlurSave(note.id)}
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
          maxLength={10000}
          onBlur={() => onBlurSave(note.id)}
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
        {saveMessages[saveStatus] || saveMessages.saved}
      </p>

    </article>
  );
}

// ---------------------------------------
// Add New Note Card
// ---------------------------------------

function AddNoteCard({ onClick, disabled }) {
  return (
    <button
      type="button"
      className="sf-note-add-card"
      onClick={onClick}
      disabled={disabled}
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
  const { user, authLoading } = useAuth();
  const userId = user?.id || null;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [adding, setAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [saveStatus, setSaveStatus] = useState({});
  const [focusNoteId, setFocusNoteId] = useState(null);

  const newTitleRef = useRef(null);
  const latestNotesRef = useRef([]);
  const pendingRef = useRef(new Map());
  const timersRef = useRef(new Map());
  const savingRef = useRef(new Set());
  const deletedRef = useRef(new Set());
  const sessionRef = useRef(0);

  // A per-note save queue guarantees that older requests cannot
  // overwrite a later edit if the user keeps typing during a save.
  const flushNote = useCallback(async (id) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);

    if (savingRef.current.has(id) || deletedRef.current.has(id)) {
      return;
    }

    const draft = pendingRef.current.get(id);
    if (!draft) return;

    if (!draft.title.trim()) {
      setSaveStatus((previous) => ({ ...previous, [id]: "title" }));
      return;
    }

    const session = sessionRef.current;
    pendingRef.current.delete(id);
    savingRef.current.add(id);
    setSaveStatus((previous) => ({ ...previous, [id]: "saving" }));

    let succeeded = false;
    try {
      await updateNoteApi(id, {
        title: draft.title.trim(),
        content: draft.content,
      });
      succeeded = true;

      if (session === sessionRef.current && !deletedRef.current.has(id)) {
        setSaveStatus((previous) => ({
          ...previous,
          [id]: pendingRef.current.has(id) ? "pending" : "saved",
        }));
      }
    } catch (error) {
      if (session === sessionRef.current && !deletedRef.current.has(id)) {
        // Keep the newest draft. If none arrived, retain the failed draft.
        if (!pendingRef.current.has(id)) pendingRef.current.set(id, draft);
        setSaveStatus((previous) => ({ ...previous, [id]: "error" }));
        console.error("Failed to save note:", error.message);
      }
    } finally {
      savingRef.current.delete(id);

      // Any edits typed during the previous save are sent afterwards.
      // Do not automatically retry an error in an endless request loop.
      if (
        succeeded &&
        session === sessionRef.current &&
        pendingRef.current.has(id) &&
        !deletedRef.current.has(id)
      ) {
        const existing = timersRef.current.get(id);
        if (existing) clearTimeout(existing);
        const nextTimer = setTimeout(() => {
          timersRef.current.delete(id);
          void flushNote(id);
        }, AUTOSAVE_DELAY);
        timersRef.current.set(id, nextTimer);
      }
    }
  }, []);

  // Load only the current authenticated student's notes.
  // Never show a previous student's data while the account is changing.
  useEffect(() => {
    const session = ++sessionRef.current;
    let active = true;

    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
    pendingRef.current.clear();
    savingRef.current.clear();
    deletedRef.current.clear();
    latestNotesRef.current = [];
    setNotes([]);
    setSaveStatus({});
    setPageError("");

    if (authLoading) {
      setLoading(true);
    } else if (!userId) {
      setLoading(false);
    } else {
      setLoading(true);
      (async () => {
        try {
          const response = await getNotes();
          if (!active || session !== sessionRef.current) return;
          const loadedNotes = response.notes || [];
          latestNotesRef.current = loadedNotes;
          setNotes(loadedNotes);
        } catch (error) {
          if (!active || session !== sessionRef.current) return;
          setPageError(error.message || "Could not load your notes.");
        } finally {
          if (active && session === sessionRef.current) setLoading(false);
        }
      })();
    }

    return () => {
      active = false;
      sessionRef.current += 1;
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, [userId, authLoading, retryCount]);

  // Focus and select the new note's default title for easy replacement.
  useEffect(() => {
    if (!focusNoteId) return;
    if (!notes.some((note) => note.id === focusNoteId)) return;
    newTitleRef.current?.focus();
    newTitleRef.current?.select();
    setFocusNoteId(null);
  }, [notes, focusNoteId]);

  function scheduleSave(id, draft) {
    pendingRef.current.set(id, draft);
    setSaveStatus((previous) => ({ ...previous, [id]: "pending" }));

    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      timersRef.current.delete(id);
      void flushNote(id);
    }, AUTOSAVE_DELAY);
    timersRef.current.set(id, timer);
  }

  async function addNote() {
    if (adding || loading || pageError || !userId) return;
    setAdding(true);
    setPageError("");
    const session = sessionRef.current;

    try {
      // MongoDB requires a nonempty title; the user can replace it.
      const response = await createNote({ title: "Untitled note", content: "" });
      if (session !== sessionRef.current) return;

      const updated = [response.note, ...latestNotesRef.current];
      latestNotesRef.current = updated;
      setNotes(updated);
      setSaveStatus((previous) => ({ ...previous, [response.note.id]: "saved" }));
      setFocusNoteId(response.note.id);
    } catch (error) {
      if (session === sessionRef.current) {
        setPageError(error.message || "Could not create note.");
      }
    } finally {
      if (session === sessionRef.current) setAdding(false);
    }
  }

  function updateNote(id, field, value) {
    const draft = latestNotesRef.current.find((note) => note.id === id);
    if (!draft || deletedRef.current.has(id)) return;

    const updatedNote = { ...draft, [field]: value };
    const updated = latestNotesRef.current.map((note) =>
      note.id === id ? updatedNote : note
    );
    latestNotesRef.current = updated;
    setNotes(updated);
    scheduleSave(id, updatedNote);
  }

  async function deleteNote(note) {
    const confirmed = window.confirm(
      `Delete "${note.title || "Untitled note"}"?`
    );
    if (!confirmed || deletedRef.current.has(note.id)) return;

    const session = sessionRef.current;
    deletedRef.current.add(note.id);
    setDeletingIds((current) => [...current, note.id]);
    setPageError("");

    const timer = timersRef.current.get(note.id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(note.id);

    try {
      await deleteNoteApi(note.id);
      if (session !== sessionRef.current) return;
      pendingRef.current.delete(note.id);
      const updated = latestNotesRef.current.filter((item) => item.id !== note.id);
      latestNotesRef.current = updated;
      setNotes(updated);
      setSaveStatus((previous) => {
        const next = { ...previous };
        delete next[note.id];
        return next;
      });
    } catch (error) {
      if (session === sessionRef.current) {
        deletedRef.current.delete(note.id);
        setPageError(error.message || "Could not delete note.");
        if (pendingRef.current.has(note.id)) {
          scheduleSave(note.id, pendingRef.current.get(note.id));
        }
      }
    } finally {
      if (session === sessionRef.current) {
        setDeletingIds((current) => current.filter((id) => id !== note.id));
      }
    }
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
          disabled={adding || loading || Boolean(pageError) || !userId}
        >
          <Plus size={20} />
          {adding ? "Creating..." : "New note"}
        </button>

      </div>

      {pageError && (
        <div role="alert" style={{ margin: "12px 0", color: "#a13b35" }}>
          {pageError}{" "}
          {!loading && notes.length === 0 && userId && (
            <button type="button" onClick={() => setRetryCount((n) => n + 1)}>
              Retry
            </button>
          )}
        </div>
      )}

      {loading && <p role="status">Loading your notes...</p>}

      {/* Notes Grid */}
      <section
        className="sf-notes-page__grid"
        aria-label="Your personal notes"
      >
        {!loading && !pageError && notes.length === 0 && (
          <p>Your notes will appear here. Create your first note!</p>
        )}

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
            saveStatus={saveStatus[note.id] || "saved"}
            isDeleting={deletingIds.includes(note.id)}
            onBlurSave={flushNote}
          />
        ))}

        <AddNoteCard
          onClick={addNote}
          disabled={adding || loading || Boolean(pageError) || !userId}
        />
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
