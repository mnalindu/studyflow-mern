
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Maximize2,
} from "lucide-react";

import "./DashboardProductivity.css";

// Temporary example tasks from the demo screenshot.
const initialTasks = [
  {
    id: 1,
    title: "Finish database assignment",
    subject: "Computer Science",
    due: "2026-10-14",
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Revise chapter 04: Integration",
    subject: "Mathematics",
    due: "2026-10-14",
    priority: "Medium",
    completed: false,
  },
  {
    id: 3,
    title: "Read 20 pages of Atomic Habits",
    subject: "Personal growth",
    due: "2026-10-14",
    priority: "Low",
    completed: true,
  },
  {
    id: 4,
    title: "Prepare presentation outline",
    subject: "Communication",
    due: "2026-10-15",
    priority: "Medium",
    completed: false,
  },
];

const filters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "high", label: "High priority" },
];

// ----------------------------------
// TASK MANAGER
// ----------------------------------

function TaskManager({ showNotice }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    priority: "Medium",
    due: "",
  });

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.filter(
    (task) => !task.completed
  ).length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    if (filter === "high") return task.priority === "High";
    return true;
  });

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function addTask(event) {
    event.preventDefault();

    const title = newTask.title.trim();

    if (!title) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        subject: newTask.subject.trim() || "General",
        priority: newTask.priority,
        due: newTask.due,
        completed: false,
      },
    ]);

    setNewTask({
      title: "",
      subject: "",
      priority: "Medium",
      due: "",
    });

    setAdding(false);
    setFilter("all");
  }

  return (
    <section
      className="sf-productivity-card sf-productivity-tasks"
      aria-labelledby="sf-tasks-title"
    >
      <div className="sf-productivity-card__header">
        <div>
          <div className="sf-productivity-tasks__title-row">
            <h2 id="sf-tasks-title">
              Today's game plan
            </h2>

            <span className="sf-productivity-tasks__count">
              {tasks.length}
            </span>
          </div>

          <p>Prioritize. Focus. Check it off.</p>
        </div>

        <button
          type="button"
          className="sf-productivity-tasks__view"
          onClick={() =>
            showNotice(
              "The full My tasks page is coming soon. You can manage your tasks here for now."
            )
          }
        >
          View all
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Task Filters */}
      <div
        className="sf-productivity-tasks__filters"
        aria-label="Filter tasks"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              filter === item.id
                ? "sf-productivity-tasks__filter active"
                : "sf-productivity-tasks__filter"
            }
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
          >
            {item.label}

            {item.id === "all" && (
              <span>{tasks.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="sf-productivity-tasks__list">
        {filteredTasks.length === 0 ? (
          <div className="sf-productivity-tasks__empty">
            No tasks in this category yet.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              className="sf-productivity-task"
              key={task.id}
            >
              <input
                type="checkbox"
                className="sf-productivity-task__checkbox"
                checked={task.completed}
                aria-label={`Mark ${task.title} as ${
                  task.completed ? "incomplete" : "completed"
                }`}
                onChange={() => toggleTask(task.id)}
              />

              <div className="sf-productivity-task__details">
                <span
                  className={`sf-productivity-task__title ${
                    task.completed ? "completed" : ""
                  }`}
                >
                  {task.title}
                </span>

                <span className="sf-productivity-task__meta">
                  <span className="sf-productivity-task__dot" />
                  {task.subject}
                  {task.due && (
                    <>
                      <span>·</span>
                      {task.due}
                    </>
                  )}
                </span>
              </div>

              <span
                className={`sf-productivity-task__priority sf-productivity-task__priority--${task.priority.toLowerCase()}`}
              >
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add New Task */}
      {adding ? (
        <form
          className="sf-productivity-tasks__form"
          onSubmit={addTask}
        >
          <label htmlFor="sf-new-task-title">
            New task
          </label>

          <input
            id="sf-new-task-title"
            type="text"
            placeholder="What do you need to do?"
            maxLength={120}
            required
            value={newTask.title}
            onChange={(event) =>
              setNewTask((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />

          <div className="sf-productivity-tasks__form-grid">
            <input
              type="text"
              aria-label="Subject"
              placeholder="Subject"
              maxLength={60}
              value={newTask.subject}
              onChange={(event) =>
                setNewTask((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />

            <select
              aria-label="Priority"
              value={newTask.priority}
              onChange={(event) =>
                setNewTask((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              aria-label="Due date"
              value={newTask.due}
              onChange={(event) =>
                setNewTask((current) => ({
                  ...current,
                  due: event.target.value,
                }))
              }
            />
          </div>

          <div className="sf-productivity-tasks__form-actions">
            <button type="submit">
              Save task
            </button>

            <button
              type="button"
              onClick={() => setAdding(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="sf-productivity-tasks__add"
          onClick={() => setAdding(true)}
        >
          <Plus size={18} />
          Add another task
        </button>
      )}

      <p className="sf-productivity-tasks__footer">
        <Check size={16} />
        {completedCount} completed · {pendingCount} pending
      </p>
    </section>
  );
}

// ----------------------------------
// FOCUS TIMER
// ----------------------------------

const timerModes = {
  focus: {
    label: "Focus",
    duration: 25 * 60,
  },
  short: {
    label: "Short break",
    duration: 5 * 60,
  },
  long: {
    label: "Long break",
    duration: 15 * 60,
  },
};

function FocusTimer({ showNotice }) {
  const [mode, setMode] = useState("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] =
    useState(0);

  const deadlineRef = useRef(null);

  // Accurate countdown based on actual elapsed time
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const seconds = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );

      setRemaining(seconds);
    }, 250);

    return () => clearInterval(interval);
  }, [running]);

  // Stop when the countdown reaches zero
  useEffect(() => {
    if (remaining !== 0 || !running) return;

    setRunning(false);

    if (mode === "focus") {
      setCompletedSessions((count) => count + 1);
    }
  }, [remaining, running, mode]);

  function changeMode(nextMode) {
    setRunning(false);
    deadlineRef.current = null;

    setMode(nextMode);
    setRemaining(timerModes[nextMode].duration);
  }

  function toggleTimer() {
    if (running) {
      setRunning(false);
      deadlineRef.current = null;
      return;
    }

    const startingSeconds =
      remaining === 0
        ? timerModes[mode].duration
        : remaining;

    setRemaining(startingSeconds);
    deadlineRef.current =
      Date.now() + startingSeconds * 1000;

    setRunning(true);
  }

  function resetTimer() {
    setRunning(false);
    deadlineRef.current = null;
    setRemaining(timerModes[mode].duration);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  const progress =
    1 - remaining / timerModes[mode].duration;

  return (
    <section
      className="sf-productivity-card sf-focus-card"
      aria-labelledby="sf-focus-title"
    >
      <div className="sf-focus-card__heading">
        <h2 id="sf-focus-title">
          <Timer size={21} />
          Find your focus
        </h2>

        <button
          type="button"
          aria-label="Open full focus timer"
          onClick={() =>
            showNotice(
              "The full-screen Focus Timer page will be added in an upcoming step."
            )
          }
        >
          <Maximize2 size={19} />
        </button>
      </div>

      {/* Timer Mode Tabs */}
      <div
        className="sf-focus-card__modes"
        role="group"
        aria-label="Timer mode"
      >
        {Object.entries(timerModes).map(
          ([key, value]) => (
            <button
              key={key}
              type="button"
              className={
                mode === key
                  ? "sf-focus-card__mode active"
                  : "sf-focus-card__mode"
              }
              aria-pressed={mode === key}
              onClick={() => changeMode(key)}
            >
              {value.label}
            </button>
          )
        )}
      </div>

      {/* Timer Circle */}
      <div className="sf-focus-card__timer-area">
        <div className="sf-focus-card__circle">
          <svg
            className="sf-focus-card__progress-ring"
            viewBox="0 0 260 260"
            aria-hidden="true"
          >
            <circle
              cx="130"
              cy="130"
              r="121"
              className="sf-focus-card__ring-track"
            />

            <circle
              cx="130"
              cy="130"
              r="121"
              className="sf-focus-card__ring-progress"
              strokeDasharray={2 * Math.PI * 121}
              strokeDashoffset={
                (2 * Math.PI * 121) * (1 - progress)
              }
            />
          </svg>

          <span className="sf-focus-card__top-dot" />

          <div className="sf-focus-card__timer-content">
            <div
              className="sf-focus-card__time"
              role="timer"
              aria-live="off"
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

      {/* Timer Controls */}
      <div className="sf-focus-card__controls">
        <button
          type="button"
          className="sf-focus-card__start"
          onClick={toggleTimer}
        >
          {running ? (
            <>
              <Pause size={19} />
              Pause session
            </>
          ) : (
            <>
              <Play size={19} />
              Start session
            </>
          )}
        </button>

        <button
          type="button"
          className="sf-focus-card__reset"
          aria-label="Reset timer"
          title="Reset timer"
          onClick={resetTimer}
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Session Counter */}
      <div className="sf-focus-card__sessions">
        <div className="sf-focus-card__dots">
          {[0, 1, 2, 3].map((number) => (
            <span
              key={number}
              className={
                number < completedSessions % 5
                  ? "active"
                  : ""
              }
            />
          ))}
        </div>

        <span>
          {completedSessions}{" "}
          {completedSessions === 1
            ? "session"
            : "sessions"}{" "}
          completed today
        </span>
      </div>
    </section>
  );
}

// ----------------------------------
// MAIN PRODUCTIVITY SECTION
// ----------------------------------

export default function DashboardProductivity({
  showNotice,
}) {
  return (
    <div className="sf-dashboard-productivity">
      <TaskManager showNotice={showNotice} />
      <FocusTimer showNotice={showNotice} />
    </div>
  );
}
