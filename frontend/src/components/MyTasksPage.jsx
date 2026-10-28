
import { useState } from "react";
import {
  Sun,
  Plus,
  Trash2,
  Check,
  ArrowUpRight,
  Leaf,
} from "lucide-react";

import { useStudyTasks } from "./StudyTasksContext";
import "./MyTasksPage.css";

const filters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "high", label: "High priority" },
];

const emptyTask = {
  title: "",
  subject: "",
  due: "",
  priority: "Medium",
};

export default function MyTasksPage() {
  const {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    tasksLoading,
    tasksError,
  } = useStudyTasks();

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyTask);

  const [isSaving, setIsSaving] = useState(false);
  const [busyTaskIds, setBusyTaskIds] = useState([]);
  const [actionError, setActionError] = useState("");

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "pending") {
      return !task.completed;
    }

    if (activeFilter === "completed") {
      return task.completed;
    }

    if (activeFilter === "high") {
      return task.priority.toLowerCase() === "high";
    }

    return true;
  });

  async function handleAddTask(event) {
    event.preventDefault();
    if (!form.title.trim() || isSaving) return;

    setIsSaving(true);
    setActionError("");

    try {
      await addTask({
        title: form.title.trim(),
        subject: form.subject.trim() || "General",
        due: form.due,
        priority: form.priority,
      });

      // Close the form only after MongoDB confirms the save.
      setForm(emptyTask);
      setShowForm(false);
      setActiveFilter("all");
    } catch (error) {
      setActionError(error.message || "Failed to save task.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(task) {
    if (busyTaskIds.includes(task.id)) return;

    setActionError("");
    setBusyTaskIds((current) => [...current, task.id]);

    try {
      await toggleTask(task.id);
    } catch (error) {
      setActionError(error.message || "Failed to update task.");
    } finally {
      setBusyTaskIds((current) =>
        current.filter((id) => id !== task.id)
      );
    }
  }

  async function handleDelete(task) {
    if (busyTaskIds.includes(task.id)) return;
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    setActionError("");
    setBusyTaskIds((current) => [...current, task.id]);

    try {
      await deleteTask(task.id);
    } catch (error) {
      setActionError(error.message || "Failed to delete task.");
    } finally {
      setBusyTaskIds((current) =>
        current.filter((id) => id !== task.id)
      );
    }
  }

  return (
    <div className="sf-my-tasks">

      {/* Page Heading */}
      <div className="sf-my-tasks__heading">
        <div>
          <p className="sf-my-tasks__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>Make room for what matters.</h1>

          <p className="sf-my-tasks__description">
            Stay organized, keep your focus, and
            take it one step at a time.
          </p>
        </div>

        <button
          type="button"
          className="sf-my-tasks__add-button"
          onClick={() =>
            setShowForm((current) => !current)
          }
          aria-expanded={showForm}
          disabled={tasksLoading}
        >
          <Plus size={20} />
          Add task
        </button>
      </div>

      {/* New Task Form */}
      {showForm && (
        <form
          className="sf-my-tasks__form"
          onSubmit={handleAddTask}
        >
          <h2>Create a new task</h2>

          <div className="sf-my-tasks__form-fields">
            <div>
              <label htmlFor="mytask-title">
                Task name
              </label>

              <input
                id="mytask-title"
                type="text"
                placeholder="What do you need to do?"
                maxLength={120}
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                required
              />
            </div>

            <div>
              <label htmlFor="mytask-subject">
                Subject
              </label>

              <input
                id="mytask-subject"
                type="text"
                placeholder="e.g. Mathematics"
                maxLength={60}
                value={form.subject}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subject: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="mytask-date">
                Due date
              </label>

              <input
                id="mytask-date"
                type="date"
                value={form.due}
                onChange={(event) =>
                  setForm({
                    ...form,
                    due: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <label htmlFor="mytask-priority">
                Priority
              </label>

              <select
                id="mytask-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value,
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="sf-my-tasks__form-actions">
            <button type="submit" disabled={isSaving || tasksLoading}>
              <Check size={18} />
              {isSaving ? "Saving..." : "Save task"}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setShowForm(false);
                setForm(emptyTask);
                setActionError("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* API error messages without changing the existing page styling */}
      {actionError && (
        <div className="sf-my-tasks__empty" role="alert">
          <p>{actionError}</p>
        </div>
      )}

      {/* Main Tasks Card */}
      <section
        className="sf-my-tasks__card"
        aria-label="My tasks list"
      >
        {/* Filters */}
        <div
          className="sf-my-tasks__filters"
          aria-label="Task filters"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={
                activeFilter === filter.id
                  ? "sf-my-tasks__filter active"
                  : "sf-my-tasks__filter"
              }
              onClick={() =>
                setActiveFilter(filter.id)
              }
              aria-pressed={
                activeFilter === filter.id
              }
            >
              {filter.label}

              {filter.id === "all" && (
                <span>{tasks.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="sf-my-tasks__list">
          {tasksLoading ? (
            <div className="sf-my-tasks__empty" role="status">
              <p>Loading your tasks...</p>
            </div>
          ) : tasksError ? (
            <div className="sf-my-tasks__empty" role="alert">
              <p>Could not load your tasks.</p>
              <span>{tasksError}</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="sf-my-tasks__empty">
              <Check size={28} />
              <p>No tasks to show here.</p>
              <span>
                Add a task or try another filter.
              </span>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <article
                className="sf-my-tasks__task"
                key={task.id}
              >
                <input
                  type="checkbox"
                  className="sf-my-tasks__checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                  disabled={busyTaskIds.includes(task.id)}
                  aria-label={
                    `${task.completed ? "Mark incomplete:" : "Complete:"} ${task.title}`
                  }
                />

                <div className="sf-my-tasks__task-info">
                  <h3
                    className={
                      task.completed
                        ? "sf-my-tasks__completed"
                        : ""
                    }
                  >
                    {task.title}
                  </h3>

                  <div className="sf-my-tasks__meta">
                    <span className="sf-my-tasks__dot" />

                    <span>
                      {task.subject}
                    </span>

                    {task.due && (
                      <>
                        <span>·</span>
                        <span>{task.due}</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={
                    `sf-my-tasks__priority ` +
                    `sf-my-tasks__priority--${task.priority.toLowerCase()}`
                  }
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  className="sf-my-tasks__delete"
                  onClick={() => handleDelete(task)}
                  disabled={busyTaskIds.includes(task.id)}
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >
                  <Trash2 size={18} />
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="sf-my-tasks__footer">
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
