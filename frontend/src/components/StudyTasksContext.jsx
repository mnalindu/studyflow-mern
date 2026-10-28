import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getTasks as fetchTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from "../services/taskApi";

const StudyTasksContext = createContext(null);

// Keep the priority labels expected by the existing StudyFlow UI.
function toFrontendTask(task) {
  const priority = String(task.priority || "medium").toLowerCase();

  return {
    ...task,
    id: String(task.id ?? task._id),
    subject: task.subject || "General",
    due: task.due || "",
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    completed: Boolean(task.completed),
  };
}

const emptyTaskState = {
  ownerId: null,
  items: [],
  loading: false,
  error: "",
};

export function StudyTasksProvider({ children }) {
  const { user, authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [taskState, setTaskState] = useState(emptyTaskState);

  // Load only the authenticated student's tasks from MongoDB.
  // Clearing on user changes prevents showing another student's tasks.
  useEffect(() => {
    let active = true;

    if (authLoading) {
      setTaskState({ ...emptyTaskState, loading: true });
      return () => {
        active = false;
      };
    }

    if (!userId) {
      setTaskState(emptyTaskState);
      return () => {
        active = false;
      };
    }

    setTaskState({
      ownerId: userId,
      items: [],
      loading: true,
      error: "",
    });

    async function loadTasks() {
      try {
        const response = await fetchTasks();

        if (!active) return;

        setTaskState({
          ownerId: userId,
          items: (response.tasks || []).map(toFrontendTask),
          loading: false,
          error: "",
        });
      } catch (error) {
        if (!active) return;

        setTaskState({
          ownerId: userId,
          items: [],
          loading: false,
          error: error.message || "Could not load your tasks.",
        });
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, [userId, authLoading]);

  // Never expose stale tasks to a different (or logged-out) student.
  const tasks =
    userId && taskState.ownerId === userId
      ? taskState.items
      : [];

  const tasksLoading =
    authLoading ||
    (Boolean(userId) &&
      (taskState.ownerId !== userId || taskState.loading));

  const tasksError =
    taskState.ownerId === userId ? taskState.error : "";

  function ensureReady() {
    if (!userId) {
      throw new Error("Please log in to manage tasks.");
    }
    if (tasksLoading) {
      throw new Error("Your tasks are still loading. Please try again.");
    }
    if (tasksError) {
      throw new Error("Could not load tasks. Please refresh and retry.");
    }
  }

  async function addTask(task) {
    ensureReady();

    const response = await createTaskApi({
      title: task.title,
      subject: task.subject || "General",
      due: task.due || "",
      priority: (task.priority || "Medium").toLowerCase(),
      description: task.description || "",
    });

    const newTask = toFrontendTask(response.task);

    setTaskState((current) =>
      current.ownerId === userId
        ? { ...current, items: [newTask, ...current.items] }
        : current
    );

    return newTask;
  }

  async function updateTask(id, changes) {
    ensureReady();

    const payload = { ...changes };
    if (typeof payload.priority === "string") {
      payload.priority = payload.priority.toLowerCase();
    }

    const response = await updateTaskApi(id, payload);
    const updated = toFrontendTask(response.task);

    setTaskState((current) =>
      current.ownerId === userId
        ? {
            ...current,
            items: current.items.map((task) =>
              task.id === id ? updated : task
            ),
          }
        : current
    );

    return updated;
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new Error("Task not found.");

    return updateTask(id, { completed: !task.completed });
  }

  async function deleteTask(id) {
    ensureReady();
    await deleteTaskApi(id);

    setTaskState((current) =>
      current.ownerId === userId
        ? {
            ...current,
            items: current.items.filter((task) => task.id !== id),
          }
        : current
    );
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <StudyTasksContext.Provider
      value={{
        tasks,
        tasksLoading,
        tasksError,
        pendingCount,
        completedCount,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
      }}
    >
      {children}
    </StudyTasksContext.Provider>
  );
}

export function useStudyTasks() {
  const context = useContext(StudyTasksContext);

  if (!context) {
    throw new Error(
      "useStudyTasks must be used inside StudyTasksProvider"
    );
  }

  return context;
}
