
import { useState } from "react";

import {
  Sun,
  Plus,
  Clock3,
  SquareCheck,
  Flame,
  Timer,
  ChevronRight,
  Leaf,
} from "lucide-react";

import { useStudyTasks } from "./StudyTasksContext";
import { useStudyInsights, focusMetrics, focusDisplay, chartAxisMax } from "../hooks/useStudyInsights";
import "./AnalyticsPage.css";


// -----------------------------------
// Statistics Card
// -----------------------------------

function AnalyticsStatCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  type,
}) {
  return (
    <article
      className={`sf-analytics-stat sf-analytics-stat--${type}`}
    >
      <div className="sf-analytics-stat__header">
        <h3>{title}</h3>

        <span className="sf-analytics-stat__icon">
          <Icon size={21} strokeWidth={1.8} />
        </span>
      </div>

      <div className="sf-analytics-stat__number">
        <strong>{value}</strong>

        {unit && <span>{unit}</span>}
      </div>

      <p>{description}</p>
    </article>
  );
}

// -----------------------------------
// Statistics Section
// -----------------------------------

function AnalyticsStatistics({ insights, loading }) {
  const { tasks, completedCount } = useStudyTasks();
  const metrics = focusMetrics(insights);
  const display = focusDisplay(metrics.totalFocusSeconds);

  const completionRate =
    tasks.length > 0
      ? Math.round(
          (completedCount / tasks.length) * 100
        )
      : 0;

  const focusValue = loading && !insights ? "…" : display.value;
  const currentStreak = loading && !insights ? "…" : metrics.streak;
  const completedSessions = loading && !insights ? "…" : metrics.totalSessions;

  const statistics = [
    {
      title: "Your focus time",
      value: focusValue,
      unit: display.unit,
      description: "Completed focus sessions",
      icon: Clock3,
      type: "focus",
    },
    {
      title: "Completion rate",
      value: completionRate,
      unit: "%",
      description: `${completedCount} ${
        completedCount === 1 ? "task" : "tasks"
      } completed`,
      icon: SquareCheck,
      type: "completion",
    },
    {
      title: "Current streak",
      value: currentStreak,
      unit: "days",
      description: "Days with a focus session",
      icon: Flame,
      type: "streak",
    },
    {
      title: "Sessions",
      value: completedSessions,
      unit: "",
      description: "One step at a time",
      icon: Timer,
      type: "sessions",
    },
  ];

  return (
    <section
      className="sf-analytics-page__statistics"
      aria-label="Your study statistics"
    >
      {statistics.map((stat) => (
        <AnalyticsStatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </section>
  );
}

// -----------------------------------
// Weekly Focus Chart
// -----------------------------------

function AnalyticsWeeklyChart({ insights, loading }) {
  const [period, setPeriod] = useState("thisWeek");
  const metrics = focusMetrics(insights);
  const data = period === "thisWeek" ? metrics.currentWeek : metrics.previousWeek;
  const axisMax = chartAxisMax(data);

  const periodLabel =
    period === "thisWeek" ? "This week" : "Last week";

  function changePeriod() {
    setPeriod((current) =>
      current === "thisWeek"
        ? "lastWeek"
        : "thisWeek"
    );
  }

  const chartDescription = data
    .map(
      (item) =>
        `${item.day}: ${item.hours.toFixed(2)} hours`
    )
    .join(", ");

  return (
    <section
      className="sf-analytics-page__chart-card"
      aria-labelledby="sf-analytics-weekly-title"
    >
      {/* Chart Heading */}
      <div className="sf-analytics-page__chart-header">
        <div>
          <h2 id="sf-analytics-weekly-title">
            Your focus, in perspective
          </h2>

          <p>
            Small efforts add up to something great.
          </p>
        </div>

        <button
          type="button"
          className="sf-analytics-page__week-button"
          onClick={changePeriod}
          aria-label={`Currently showing ${periodLabel}. Show ${
            period === "thisWeek"
              ? "last week"
              : "this week"
          }`}
        >
          {periodLabel}

          <ChevronRight size={18} />
        </button>
      </div>

      {/* Chart Legend */}
      <div className="sf-analytics-page__chart-legend">
        <span>
          <span className="sf-analytics-page__legend-dot" />
          Focus time
        </span>

        <span>{loading && !insights ? "Loading focus data..." : "Completed focus sessions"}</span>
      </div>

      {/* Chart Body */}
      <div
        className="sf-analytics-page__chart"
        role="img"
        aria-label={`Weekly focus chart. ${chartDescription}`}
      >
        {/* Y Axis */}
        <div className="sf-analytics-page__y-axis">
          {[4, 3, 2, 1, 0].map((tick) => {
            const hours = (tick / 4) * axisMax;
            return <span key={tick}>{hours === 0 ? "0" : `${hours}h`}</span>;
          })}
        </div>

        {/* Chart Plot */}
        <div className="sf-analytics-page__plot">

          {/* Horizontal Grid Lines */}
          <div
            className="sf-analytics-page__grid-lines"
            aria-hidden="true"
          >
            {[4, 3, 2, 1, 0].map((hour) => (
              <span key={hour} />
            ))}
          </div>

          {/* Seven Daily Bars */}
          <div className="sf-analytics-page__bars">
            {data.map((item, index) => {
              const height =
                Math.min(100, (item.hours / axisMax) * 100);

              return (
                <div
                  className="sf-analytics-page__bar-column"
                  key={item.day}
                  title={`${item.day}: ${item.hours.toFixed(2)} hours`}
                >
                  <div
                    className={`sf-analytics-page__bar ${
                      index === 1
                        ? "sf-analytics-page__bar--highlight"
                        : ""
                    }`}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X Axis */}
      <div className="sf-analytics-page__x-axis">
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
// Page Footer
// -----------------------------------

function AnalyticsFooter() {
  return (
    <footer className="sf-analytics-page__footer">
      <span>
        <Leaf size={16} />
        Built for your next big chapter.
      </span>

      <span>
        StudyFlow · Your student space
      </span>
    </footer>
  );
}

// -----------------------------------
// Main Analytics Page
// -----------------------------------

export default function AnalyticsPage() {
  const { data: insights, loading, error } = useStudyInsights();

  function goToTasks() {
    window.location.hash = "#tasks";
  }

  return (
    <div className="sf-analytics-page">

      {/* Page Heading */}
      <div className="sf-analytics-page__heading">
        <div>
          <p className="sf-analytics-page__eyebrow">
            <Sun size={17} />
            A GOOD DAY TO MAKE PROGRESS
          </p>

          <h1>See how far you’ve come.</h1>

          <p className="sf-analytics-page__description">
            Stay organized, keep your focus, and
            take it one step at a time.
          </p>
        </div>

        <button
          type="button"
          className="sf-analytics-page__add"
          onClick={goToTasks}
        >
          <Plus size={20} />
          Add task
        </button>
      </div>

      {/* Four Statistics Cards */}
      <AnalyticsStatistics insights={insights} loading={loading} />

      {/* Weekly Chart */}
      <AnalyticsWeeklyChart insights={insights} loading={loading} />

      {/* Informational Note */}
      <p className="sf-analytics-page__note">
        {error
          ? `Unable to refresh study analytics: ${error}`
          : "Study time includes completed focus sessions saved to MongoDB. Weeks begin on Monday."}
      </p>

      {/* Footer */}
      <AnalyticsFooter />

    </div>
  );
}
