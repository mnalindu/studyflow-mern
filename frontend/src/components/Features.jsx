
import "./Features.css";

// Reusable SVG icons
function FeatureIcon({ name, size = 23 }) {
  const icons = {
    check: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m8 12 3 3 7-8" />
        <path d="M16 4h4v4" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
        <rect x="3" y="13" width="4" height="7" rx="2" />
        <rect x="17" y="13" width="4" height="7" rx="2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h17" />
        <path d="M8 16v-5M13 16V6M18 16V9" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 4C12 4 5 7 5 15a5 5 0 0 0 5 5c8 0 11-8 10-16Z" />
        <path d="M4 21c3-6 8-10 13-13" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="13" r="9" />
        <path d="M12 13l3-3M12 13v-5M9 2h6" />
      </>
    ),
    note: (
      <>
        <path d="M17 4H7a3 3 0 0 0-3 3v12a2 2 0 0 0 2 2h11" />
        <path d="M9 9h5M9 13h4M15 19l5-5 2 2-5 5-3 1z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16" />
        <path d="m14 6 6 6-6 6" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

// Benefits displayed immediately below the Hero
const benefits = [
  { icon: "check", label: "A clearer plan" },
  { icon: "headphones", label: "A quieter mind" },
  { icon: "chart", label: "A little more progress" },
  { icon: "leaf", label: "A better study day" },
];

function BenefitsStrip() {
  return (
    <div className="sf-benefits">
      {benefits.map((benefit) => (
        <div className="sf-benefits__item" key={benefit.label}>
          <FeatureIcon name={benefit.icon} size={22} />
          <span>{benefit.label}</span>
        </div>
      ))}
    </div>
  );
}

// Green card task preview
function TaskPreview() {
  return (
    <div className="sf-feature-tasks">
      <div className="sf-feature-task">
        <span className="sf-feature-task__check completed">
          ✓
        </span>
        <span>Finish one small thing</span>
        <small className="sf-task-high">High</small>
      </div>

      <div className="sf-feature-task">
        <span className="sf-feature-task__check" />
        <span>Make space for the next</span>
        <small className="sf-task-today">Today</small>
      </div>
    </div>
  );
}

// Blue card timer preview
function TimerPreview() {
  return (
    <div className="sf-feature-timer">
      <div className="sf-feature-timer__time">25:00</div>
      <div className="sf-feature-timer__caption">
        FOCUS TIME · JUST YOU & YOUR NEXT STEP
      </div>
    </div>
  );
}

// Gold card progress chart preview
function ChartPreview() {
  const bars = [35, 58, 46, 84, 70, 105, 124];

  return (
    <div className="sf-feature-chart" aria-label="Illustrative progress chart">
      {bars.map((height, index) => (
        <div
          className={`sf-feature-chart__bar ${
            index === bars.length - 1 ? "sf-feature-chart__bar--last" : ""
          }`}
          style={{ height: `${height}px` }}
          key={index}
        />
      ))}
    </div>
  );
}

// Main Features section
export default function Features() {
  return (
    <section className="sf-features" id="features">
      <div className="sf-features__container">

        <BenefitsStrip />

        <div className="sf-features__intro">
          <p className="sf-features__eyebrow">
            LESS TAB-HOPPING. MORE DOING.
          </p>

          <h2>
            Everything you need.
            <br />
            <span>Room to breathe included.</span>
          </h2>

          <p className="sf-features__description">
            A study space that keeps the important things together,
            so you can put your energy into what comes next.
          </p>
        </div>

        <div className="sf-features__grid">

          {/* Card 1: Tasks */}
          <article className="sf-feature-card sf-feature-card--tasks">
            <div className="sf-feature-card__icon">
              <FeatureIcon name="check" size={30} />
            </div>

            <h3>Give your day a little direction.</h3>

            <p>
              Turn big assignments into clear tasks. Set
              priorities and deadlines, then enjoy that
              satisfying check.
            </p>

            <TaskPreview />

            <a href="#dashboard" className="sf-feature-card__link">
              Make a plan
              <FeatureIcon name="arrow" size={18} />
            </a>
          </article>

          {/* Card 2: Focus */}
          <article className="sf-feature-card sf-feature-card--focus">
            <div className="sf-feature-card__icon">
              <FeatureIcon name="clock" size={30} />
            </div>

            <h3>Find your focus. Keep your calm.</h3>

            <p>
              A Pomodoro timer, gentle breaks, and a
              distraction-free focus mode. One session,
              one step closer.
            </p>

            <TimerPreview />

            <a href="#dashboard" className="sf-feature-card__link">
              Find your rhythm
              <FeatureIcon name="arrow" size={18} />
            </a>
          </article>

          {/* Card 3: Progress */}
          <article className="sf-feature-card sf-feature-card--progress">
            <div className="sf-feature-card__icon">
              <FeatureIcon name="chart" size={30} />
            </div>

            <h3>See the small wins add up.</h3>

            <p>
              Track completed focus sessions, daily goals,
              and study streaks. Notice the effort you're
              putting in.
            </p>

            <ChartPreview />

            <a href="#dashboard" className="sf-feature-card__link">
              Explore your dashboard
              <FeatureIcon name="arrow" size={18} />
            </a>
          </article>

        </div>

        {/* Extra features displayed below the cards */}
        <div className="sf-features__extras">
          <div>
            <FeatureIcon name="note" size={21} />
            <span>Notes for your next good idea</span>
          </div>

          <div>
            <FeatureIcon name="calendar" size={21} />
            <span>Deadlines in one place</span>
          </div>

          <div>
            <FeatureIcon name="target" size={21} />
            <span>Goals that fit your pace</span>
          </div>
        </div>

        <div className="sf-features__divider" />
      </div>
    </section>
  );
}
