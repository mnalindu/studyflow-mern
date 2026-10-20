
import { useMemo, useState } from "react";

import {
  Sun,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Leaf,
} from "lucide-react";

import { useStudyTasks } from "./StudyTasksContext";
import "./CalendarPage.css";

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// Convert a date to local YYYY-MM-DD
function getDateKey(year, month, day) {
  const paddedMonth = String(month + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");

  return `${year}-${paddedMonth}-${paddedDay}`;
}

// --------------------------------------
// Main Calendar Page
// --------------------------------------

export default function CalendarPage() {
  const { tasks } = useStudyTasks();

  const [today] = useState(() => new Date());

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    () =>
      getDateKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthTitle = currentMonth.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const todayKey = getDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // --------------------------------------
  // Generate calendar days
  // --------------------------------------

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);

    const startingWeekday = firstDay.getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const totalCells =
      Math.ceil(
        (startingWeekday + daysInMonth) / 7
      ) * 7;

    return Array.from(
      { length: totalCells },
      (_, index) => {
        const day = index - startingWeekday + 1;

        if (day < 1 || day > daysInMonth) {
          return null;
        }

        return {
          day,
          key: getDateKey(year, month, day),
        };
      }
    );
  }, [year, month]);

  // --------------------------------------
  // Match tasks to their due dates
  // --------------------------------------

  const tasksByDate = useMemo(() => {
    const grouped = new Map();

    tasks.forEach((task) => {
      if (
        typeof task.due !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(task.due)
      ) {
        return;
      }

      if (!grouped.has(task.due)) {
        grouped.set(task.due, []);
      }

      grouped.get(task.due).push(task);
    });

    return grouped;
  }, [tasks]);

  // --------------------------------------
  // Month navigation
  // --------------------------------------

  function changeMonth(amount) {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );

    setSelectedDate(null);
  }

  function goToToday() {
    const now = new Date();

    setCurrentMonth(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    setSelectedDate(
      getDateKey(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );
  }

  function goToTasks() {
    window.location.hash = "#tasks";
  }

  return (
    <div className="sf-calendar-page">

      {/* Page Heading */}
      <div className="sf-calendar-page__heading">
        <div>
          <p className="sf-calendar-page__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>
            A little planning goes a long way.
          </h1>

          <p className="sf-calendar-page__description">
            Stay organized, keep your focus, and
            take it one step at a time.
          </p>
        </div>

        <button
          type="button"
          className="sf-calendar-page__add"
          onClick={goToTasks}
        >
          <Plus size={20} />
          Add task
        </button>
      </div>

      {/* Calendar Card */}
      <section
        className="sf-calendar"
        aria-labelledby="sf-calendar-title"
      >
        {/* Calendar Header */}
        <div className="sf-calendar__header">
          <h2 id="sf-calendar-title">
            {monthTitle}
          </h2>

          <div className="sf-calendar__controls">

            <button
              type="button"
              className="sf-calendar__arrow"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft size={23} />
            </button>

            <button
              type="button"
              className="sf-calendar__today"
              onClick={goToToday}
            >
              Today
            </button>

            <button
              type="button"
              className="sf-calendar__arrow"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight size={23} />
            </button>

          </div>
        </div>

        {/* Calendar Scroll Wrapper */}
        <div className="sf-calendar__scroll">

          <div className="sf-calendar__inner">

            {/* Weekday Names */}
            <div className="sf-calendar__weekdays">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="sf-calendar__weekday"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="sf-calendar__grid">
              {calendarDays.map((date, index) => {
                // Blank cells before/after month
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="sf-calendar__cell sf-calendar__cell--empty"
                      aria-hidden="true"
                    />
                  );
                }

                const dayTasks =
                  tasksByDate.get(date.key) || [];

                const isToday =
                  date.key === todayKey;

                const isSelected =
                  date.key === selectedDate;

                const dateLabel = new Date(
                  year,
                  month,
                  date.day
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={date.key}
                    className={`sf-calendar__cell ${
                      isSelected
                        ? "sf-calendar__cell--selected"
                        : ""
                    }`}
                  >
                    {/* Day Number */}
                    <button
                      type="button"
                      className={`sf-calendar__day ${
                        isToday
                          ? "sf-calendar__day--today"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedDate(date.key)
                      }
                      aria-pressed={isSelected}
                      aria-label={`Select ${dateLabel}`}
                    >
                      {date.day}
                    </button>

                    {/* Tasks Due This Day */}
                    <div className="sf-calendar__events">
                      {dayTasks.map((task) => (
                        <button
                          type="button"
                          key={task.id}
                          className={`sf-calendar__event ${
                            task.completed
                              ? "sf-calendar__event--completed"
                              : ""
                          }`}
                          title={`${task.title} - ${task.subject || "General"}`}
                          onClick={goToTasks}
                        >
                          {task.completed && (
                            <Check
                              size={12}
                              aria-hidden="true"
                            />
                          )}

                          <span>
                            {task.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="sf-calendar-page__footer">
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
