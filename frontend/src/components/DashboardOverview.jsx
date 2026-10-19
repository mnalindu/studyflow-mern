
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

import "./DashboardOverview.css";

// Quick Action Cards
const quickActions = [
  {
    title: "Add a task",
    subtitle: "Make a little plan",
    icon: Plus,
    type: "task",
    message:
      "Task creation will be available when we build the task manager.",
  },
  {
    title: "My schedule",
    subtitle: "Stay one step ahead",
    icon: CalendarDays,
    type: "schedule",
    message:
      "Your calendar and schedule will be added soon.",
  },
  {
    title: "Quick note",
    subtitle: "Catch a good idea",
    icon: NotebookPen,
    type: "note",
    message:
      "The Notes feature will be added in an upcoming step.",
  },
];

// Temporary statistics matching the reference screenshot.
// Later these will come from the database.
const statistics = [
  {
    title: "Tasks completed",
    value: "1",
    unit: "/ 4",
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

// Quick Action Component
function QuickActions({ showNotice }) {
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
            onClick={() => showNotice(action.message)}
          >
            <span className="sf-dash-quick-card__icon">
              <Icon size={23} strokeWidth={1.8} />
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

// Statistics Component
function StatisticsCards() {
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
          Your study snapshot
        </span>
      </div>

      <div className="sf-dash-overview__stats">
        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className={`sf-dash-stat sf-dash-stat--${stat.type}`}
              key={stat.title}
            >
              <div className="sf-dash-stat__top">
                <h3>{stat.title}</h3>

                <span className="sf-dash-stat__icon">
                  <Icon size={21} strokeWidth={1.8} />
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

// Main Dashboard Overview Component
export default function DashboardOverview({ showNotice }) {
  return (
    <div className="sf-dash-overview">
      <QuickActions showNotice={showNotice} />

      <StatisticsCards />
    </div>
  );
}
