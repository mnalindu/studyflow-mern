
import { useState } from "react";
import {
  Clock3,
  Target,
  MoreHorizontal,
  ChevronDown,
  Leaf,
} from "lucide-react";

import { getDailyStudyGoal } from "./PreferencesModal";
import { useStudyInsights, focusMetrics, chartAxisMax } from "../hooks/useStudyInsights";
import "./DashboardAnalytics.css";


// -----------------------------------
// WEEKLY FOCUS CHART
// -----------------------------------

function WeeklyFocusChart() {
  const [selectedWeek, setSelectedWeek] =
    useState("current");

  const [menuOpen, setMenuOpen] = useState(false);
  const { data: insights, loading, error } = useStudyInsights();
  const metrics = focusMetrics(insights);
  const data = selectedWeek === "current" ? metrics.currentWeek : metrics.previousWeek;
  const axisMax = chartAxisMax(data);

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

        <small>{loading && !insights ? "Loading focus data..." : "Completed focus sessions"}</small>
      </div>

      {/* Chart */}
      <div
        className="sf-analytics-weekly__chart"
        role="img"
        aria-label={`Focus hours for ${weekLabel.toLowerCase()}: ${data
          .map((item) => `${item.day} ${item.hours.toFixed(2)} hours`)
          .join(", ")}`}
      >
        {/* Y Axis */}
        <div className="sf-analytics-weekly__y-axis">
          {[4, 3, 2, 1, 0].map((tick) => {
            const hour = (tick / 4) * axisMax;
            return (
              <span key={tick}>
                {hour === 0 ? "0" : `${hour}h`}
              </span>
            );
          })}
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
                      Math.min(100, (item.hours / axisMax) * 100)
                    }%`,
                  }}
                  title={`${item.day}: ${item.hours} hours`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p role="alert" style={{ fontSize: 12, color: "#b45309" }}>{error}</p>}

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
  const [goalMinutes, setGoalMinutes] = useState(getDailyStudyGoal);

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

export default function DashboardAnalytics() {
  const { data, loading } = useStudyInsights();
  const metrics = focusMetrics(data);

  return (
    <div className="sf-dashboard-analytics">
      <WeeklyFocusChart />
      <DailyGoal focusMinutes={loading && !data ? 0 : Math.round(metrics.todaySeconds / 60)} />
    </div>
  );
}
