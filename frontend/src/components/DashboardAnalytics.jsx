
import { useState } from "react";
import {
  Clock3,
  Target,
  MoreHorizontal,
  ChevronDown,
  Leaf,
} from "lucide-react";

import "./DashboardAnalytics.css";

// Example chart data for the UI.
// Real study session data will replace this later.
const weeklyData = {
  current: [
    { day: "Mon", hours: 1.7 },
    { day: "Tue", hours: 2.7 },
    { day: "Wed", hours: 1.9 },
    { day: "Thu", hours: 3.3 },
    { day: "Fri", hours: 2.4 },
    { day: "Sat", hours: 1.2 },
    { day: "Sun", hours: 0.5 },
  ],
  previous: [
    { day: "Mon", hours: 1.2 },
    { day: "Tue", hours: 2.1 },
    { day: "Wed", hours: 2.8 },
    { day: "Thu", hours: 1.6 },
    { day: "Fri", hours: 3.0 },
    { day: "Sat", hours: 1.8 },
    { day: "Sun", hours: 1.0 },
  ],
};

// -----------------------------------
// WEEKLY FOCUS CHART
// -----------------------------------

function WeeklyFocusChart() {
  const [selectedWeek, setSelectedWeek] =
    useState("current");

  const [menuOpen, setMenuOpen] = useState(false);

  const data = weeklyData[selectedWeek];

  const weekLabel =
    selectedWeek === "current"
      ? "This week"
      : "Last week";

  function changeWeek(week) {
    setSelectedWeek(week);
    setMenuOpen(false);
  }

  return (
    <section
      className="sf-analytics-card sf-analytics-weekly"
      aria-labelledby="sf-weekly-title"
    >
      {/* Header */}
      <div className="sf-analytics-card__header">
        <div>
          <h2 id="sf-weekly-title">
            Your focus, in perspective
          </h2>

          <p>
            Small efforts add up to something great.
          </p>
        </div>

        {/* Week Selector */}
        <div className="sf-analytics-weekly__selector">
          <button
            type="button"
            className="sf-analytics-weekly__select"
            aria-expanded={menuOpen}
            aria-controls="sf-week-options"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            {weekLabel}
            <ChevronDown size={17} />
          </button>

          {menuOpen && (
            <div
              className="sf-analytics-weekly__menu"
              id="sf-week-options"
            >
              <button
                type="button"
                onClick={() => changeWeek("current")}
              >
                This week
              </button>

              <button
                type="button"
                onClick={() => changeWeek("previous")}
              >
                Last week
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="sf-analytics-weekly__legend">
        <span>
          <span className="sf-analytics-weekly__legend-dot" />
          Focus time
        </span>

        <small>Sample weekly activity</small>
      </div>

      {/* Chart */}
      <div
        className="sf-analytics-weekly__chart"
        role="img"
        aria-label={`Illustrative focus hours for ${weekLabel.toLowerCase()}: ${data
          .map((item) => `${item.day} ${item.hours} hours`)
          .join(", ")}`}
      >
        {/* Y Axis */}
        <div className="sf-analytics-weekly__y-axis">
          {[4, 3, 2, 1, 0].map((hour) => (
            <span key={hour}>
              {hour === 0 ? "0" : `${hour}h`}
            </span>
          ))}
        </div>

        {/* Graph Area */}
        <div className="sf-analytics-weekly__plot">
          {data.map((item, index) => (
            <div
              className="sf-analytics-weekly__column"
              key={item.day}
            >
              <div className="sf-analytics-weekly__bar-track">
                <div
                  className={`sf-analytics-weekly__bar ${
                    index === 0
                      ? "sf-analytics-weekly__bar--highlight"
                      : ""
                  }`}
                  style={{
                    height: `${
                      (item.hours / 4) * 100
                    }%`,
                  }}
                  title={`${item.day}: ${item.hours} hours`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X Axis */}
      <div className="sf-analytics-weekly__x-axis">
        {data.map((item) => (
          <span key={item.day}>
            {item.day}
          </span>
        ))}
      </div>
    </section>
  );
}

// -----------------------------------
// DAILY GOAL
// -----------------------------------

const goalOptions = [60, 90, 120, 180, 240];

function DailyGoal({ focusMinutes = 0 }) {
  const [goalMinutes, setGoalMinutes] =
    useState(120);

  const [menuOpen, setMenuOpen] =
    useState(false);

  // Avoid invalid numbers and values below zero.
  const completedMinutes = Math.max(
    0,
    Number(focusMinutes) || 0
  );

  const progress = Math.min(
    100,
    Math.round(
      (completedMinutes / goalMinutes) * 100
    )
  );

  function updateGoal(minutes) {
    setGoalMinutes(minutes);
    setMenuOpen(false);
  }

  return (
    <section
      className="sf-analytics-card sf-daily-goal"
      aria-labelledby="sf-daily-goal-title"
    >
      {/* Header */}
      <div className="sf-daily-goal__header">
        <h2 id="sf-daily-goal-title">
          Your daily target
        </h2>

        <div className="sf-daily-goal__menu-wrapper">
          <button
            type="button"
            className="sf-daily-goal__menu-toggle"
            aria-label="Change daily study target"
            aria-expanded={menuOpen}
            aria-controls="sf-goal-options"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            <MoreHorizontal size={23} />
          </button>

          {menuOpen && (
            <div
              className="sf-daily-goal__menu"
              id="sf-goal-options"
            >
              <strong>Daily focus target</strong>

              {goalOptions.map((minutes) => (
                <button
                  type="button"
                  key={minutes}
                  className={
                    minutes === goalMinutes
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    updateGoal(minutes)
                  }
                >
                  {minutes} minutes
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Goal Information */}
      <div className="sf-daily-goal__summary">
        <div className="sf-daily-goal__icon">
          <Target
            size={29}
            strokeWidth={1.8}
          />
        </div>

        <div className="sf-daily-goal__numbers">
          <div>
            <strong>{completedMinutes}</strong>

            <span>
              / {goalMinutes} min
            </span>
          </div>

          <p>
            {progress >= 100
              ? "You reached your daily focus goal!"
              : "You're building something good."}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="sf-daily-goal__progress">
        <div
          className="sf-daily-goal__progress-fill"
          style={{
            width: `${progress}%`,
          }}
          role="progressbar"
          aria-label="Daily focus goal progress"
          aria-valuenow={completedMinutes}
          aria-valuemin={0}
          aria-valuemax={goalMinutes}
        />
      </div>

      {/* Motivational Message */}
      <div className="sf-daily-goal__quote">
        <p>
          “You don't have to be perfect.
          <br />
          You just have to keep going.”
        </p>

        <Leaf
          size={26}
          strokeWidth={1.7}
        />
      </div>
    </section>
  );
}

// -----------------------------------
// MAIN COMPONENT
// -----------------------------------

export default function DashboardAnalytics({
  focusMinutes = 0,
}) {
  return (
    <div className="sf-dashboard-analytics">
      <WeeklyFocusChart />

      <DailyGoal
        focusMinutes={focusMinutes}
      />
    </div>
  );
}
