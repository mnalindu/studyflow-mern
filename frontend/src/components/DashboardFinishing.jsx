
import {
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  NotebookPen,
  CalendarDays,
  Leaf,
} from "lucide-react";

import "./DashboardFinishing.css";

// Temporary tasks based on the reference design.
// Real task data will be connected later.
const sampleUpcomingTasks = [
  {
    id: 1,
    title: "Finish database assignment",
    subject: "Computer Science",
    daysFromToday: 1,
    priority: "High",
  },
  {
    id: 2,
    title: "Revise chapter 04: Integration",
    subject: "Mathematics",
    daysFromToday: 2,
    priority: "Medium",
  },
];

// Create sample future dates
function getUpcomingDate(daysFromToday) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);

  return {
    month: date
      .toLocaleDateString("en-US", {
        month: "short",
      })
      .toUpperCase(),

    day: date.getDate(),
  };
}

// ----------------------------------
// STUDY SIDEKICK
// ----------------------------------

function StudySidekick({ onFocus }) {
  return (
    <section
      className="sf-study-sidekick"
      aria-labelledby="sf-sidekick-title"
    >
      <div className="sf-study-sidekick__icon">
        <Sparkles size={25} strokeWidth={1.8} />
      </div>

      <div className="sf-study-sidekick__content">
        <h2 id="sf-sidekick-title">
          Your study sidekick
        </h2>

        <p>
          Start with your highest-priority task.
          A 25-minute focus session is a great first step.
        </p>
      </div>

      <button
        type="button"
        className="sf-study-sidekick__button"
        onClick={onFocus}
      >
        Let's focus
        <ArrowUpRight size={18} />
      </button>
    </section>
  );
}

// ----------------------------------
// COMING UP NEXT
// ----------------------------------

function ComingUpNext({ showNotice }) {
  return (
    <section
      className="sf-finishing-card sf-upcoming"
      aria-labelledby="sf-upcoming-title"
    >
      <div className="sf-finishing-card__header">
        <h2 id="sf-upcoming-title">
          Coming up next
        </h2>

        <button
          type="button"
          className="sf-finishing-card__header-link"
          onClick={() =>
            showNotice(
              "The full Calendar page will be added in an upcoming development step."
            )
          }
        >
          Open calendar
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="sf-upcoming__list">
        {sampleUpcomingTasks.map((task) => {
          const date = getUpcomingDate(
            task.daysFromToday
          );

          return (
            <article
              className="sf-upcoming__task"
              key={task.id}
            >
              <div className="sf-upcoming__date">
                <span>{date.month}</span>
                <strong>{date.day}</strong>
              </div>

              <div className="sf-upcoming__details">
                <h3>{task.title}</h3>
                <p>{task.subject}</p>
              </div>

              <span
                className={`sf-upcoming__priority sf-upcoming__priority--${task.priority.toLowerCase()}`}
              >
                Upcoming
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ----------------------------------
// THOUGHT OF THE DAY
// ----------------------------------

function ThoughtOfTheDay({ showNotice }) {
  return (
    <section
      className="sf-finishing-card sf-thought"
      aria-labelledby="sf-thought-title"
    >
      <div className="sf-thought__header">
        <h2 id="sf-thought-title">
          Thought of the day
        </h2>

        <NotebookPen
          size={22}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </div>

      <p className="sf-thought__quote">
        Progress is not always loud. Sometimes it is
        simply showing up, opening your books, and
        trying again. 🌱
      </p>

      <button
        type="button"
        className="sf-thought__action"
        onClick={() =>
          showNotice(
            "Your personal Notes page will be added in a future step."
          )
        }
      >
        Make space for your thoughts
        <ArrowRight size={18} />
      </button>
    </section>
  );
}

// ----------------------------------
// DASHBOARD FOOTER
// ----------------------------------

function DashboardFooter() {
  return (
    <footer className="sf-dash-bottom-footer">
      <span>
        <Leaf size={15} />
        Built for your next big chapter.
      </span>

      <span>
        StudyFlow · Your student space
      </span>
    </footer>
  );
}

// ----------------------------------
// MAIN COMPONENT
// ----------------------------------

export default function DashboardFinishing({
  showNotice,
}) {
  function handleFocus() {
    // Scroll to the existing Pomodoro timer
    const timer = document.querySelector(
      ".sf-focus-card"
    );

    if (timer) {
      const prefersReducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      timer.scrollIntoView({
        behavior: prefersReducedMotion
          ? "instant"
          : "smooth",
        block: "center",
      });
    } else {
      showNotice(
        "The Focus Timer is not available yet."
      );
    }
  }

  return (
    <div className="sf-dashboard-finishing">

      <StudySidekick
        onFocus={handleFocus}
      />

      <div className="sf-dashboard-finishing__grid">
        <ComingUpNext
          showNotice={showNotice}
        />

        <ThoughtOfTheDay
          showNotice={showNotice}
        />
      </div>

      <DashboardFooter />
    </div>
  );
}
