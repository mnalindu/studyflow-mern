
import {
  Plus,
  CalendarDays,
  NotebookPen,
  ArrowUpRight,
  SquareCheck,
  Clock3,
  Flame,
  Target,
} from "lucide-react";

import { useStudyTasks } from "./StudyTasksContext";
import "./DashboardOverview.css";

const quickActions = [
  {
    title: "Add a task",
    subtitle: "Make a little plan",
    icon: Plus,
    type: "task",
  },
  {
    title: "My schedule",
    subtitle: "Stay one step ahead",
    icon: CalendarDays,
    type: "schedule",
  },
  {
    title: "Quick note",
    subtitle: "Catch a good idea",
    icon: NotebookPen,
    type: "note",
  },
];

const statistics = [
  {
    title: "Tasks completed",
    value: "0",
    unit: "/ 0",
    description: "Every check is a small win",
    icon: SquareCheck,
    type: "tasks",
  },
  {
    title: "Focus time",
    value: "0",
    unit: "min",
    description: "Time invested in yourself",
    icon: Clock3,
    type: "focus",
  },
  {
    title: "Study streak",
    value: "0",
    unit: "days",
    description: "Your next chapter starts today",
    icon: Flame,
    type: "streak",
  },
  {
    title: "Daily goal",
    value: "0%",
    unit: "",
    description: "0 of 120 minutes completed",
    icon: Target,
    type: "goal",
  },
];

// =====================================
// Quick Actions
// =====================================

function QuickActions({ showNotice }) {
  function handleAction(type) {
    if (type === "task") {
      window.location.hash = "#tasks";
      return;
    }

    if (type === "schedule") {
      window.location.hash = "#calendar";
      return;
    }

    if (type === "note") {
      window.location.hash = "#notes";
      return;
    }

    showNotice("This feature will be available soon.");
  }

  return (
    <section
      className="sf-dash-overview__quick"
      aria-label="Quick actions"
    >
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.title}
            type="button"
            className={`sf-dash-quick-card sf-dash-quick-card--${action.type}`}
            onClick={() =>
              handleAction(action.type)
            }
          >
            <span className="sf-dash-quick-card__icon">
              <Icon
                size={23}
                strokeWidth={1.8}
              />
            </span>

            <span className="sf-dash-quick-card__text">
              <strong>{action.title}</strong>
              <small>{action.subtitle}</small>
            </span>

            <ArrowUpRight
              size={19}
              className="sf-dash-quick-card__arrow"
            />
          </button>
        );
      })}
    </section>
  );
}

// =====================================
// Statistics Cards
// =====================================

function StatisticsCards({
  dailyGoalMinutes = 120,
}) {
  const {
    tasks,
    completedCount,
  } = useStudyTasks();

  const currentStatistics = statistics.map(
    (stat) => {
      if (stat.type === "tasks") {
        return {
          ...stat,
          value: String(completedCount),
          unit: `/ ${tasks.length}`,
        };
      }

      if (stat.type === "goal") {
        return {
          ...stat,
          description:
            `0 of ${dailyGoalMinutes} minutes completed`,
        };
      }

      return stat;
    }
  );

  return (
    <section
      className="sf-dash-overview__summary"
      aria-labelledby="sf-dash-overview-title"
    >
      <div className="sf-dash-overview__heading">
        <h2 id="sf-dash-overview-title">
          Your day at a glance
        </h2>

        <span className="sf-dash-overview__status">
          <span />
          Updated as you go
        </span>
      </div>

      {/* Statistics Grid */}
      <div className="sf-dash-overview__stats">
        {currentStatistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className={`sf-dash-stat sf-dash-stat--${stat.type}`}
              key={stat.title}
            >
              <div className="sf-dash-stat__top">
                <h3>{stat.title}</h3>

                <span className="sf-dash-stat__icon">
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                  />
                </span>
              </div>

              <div className="sf-dash-stat__value">
                <strong>{stat.value}</strong>

                {stat.unit && (
                  <span>{stat.unit}</span>
                )}
              </div>

              <p className="sf-dash-stat__description">
                {stat.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// =====================================
// Main Dashboard Overview
// =====================================

export default function DashboardOverview({
  showNotice,
  dailyGoalMinutes = 120,
}) {
  return (
    <div className="sf-dash-overview">
      <QuickActions
        showNotice={showNotice}
      />

      <StatisticsCards
        dailyGoalMinutes={dailyGoalMinutes}
      />
    </div>
  );
}
