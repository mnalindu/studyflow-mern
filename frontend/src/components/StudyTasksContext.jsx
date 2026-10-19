
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const StudyTasksContext = createContext(null);
const STORAGE_KEY = "studyflow-tasks-v1";

// Initial tasks matching your reference design
const starterTasks = [
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

// Load previously saved browser tasks
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (task) =>
            task &&
            (typeof task.id === "string" ||
              typeof task.id === "number") &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        )
      ) {
        return parsed;
      }
    }
  } catch {
    // Continue with example tasks if storage is unavailable.
  }

  return starterTasks;
}

export function StudyTasksProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks);

  // Save tasks whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch {
      // Tasks still work during this session.
    }
  }, [tasks]);

  function addTask(task) {
    setTasks((current) => [
      ...current,
      {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${current.length}`,
        title: task.title,
        subject: task.subject || "General",
        due: task.due || "",
        priority: task.priority || "Medium",
        completed: false,
      },
    ]);
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
  }

  return (
    <StudyTasksContext.Provider
      value={{
        tasks,
        addTask,
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
