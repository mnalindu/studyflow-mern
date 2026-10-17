
import "./Hero.css";

// Icons used inside the Hero section
function HeroIcon({ name, size = 19, strokeWidth = 1.8 }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7V5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    leaf: (
      <>
        <path d="M20 4c-8 0-14 3-14 11a5 5 0 0 0 5 5c8 0 11-6 9-16Z" />
        <path d="M4 21c2-6 7-10 13-13" />
      </>
    ),
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
      </>
    ),
    task: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m8 12 3 3 6-7" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h3M14 14h3M8 17h3" />
      </>
    ),
    note: (
      <>
        <path d="M7 3h9l4 4v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M15 3v5h5M9 13h7M9 17h5" />
      </>
    ),
    flame: (
      <path d="M12 22c4.4 0 7-3 7-7 0-3.1-1.8-5.6-4.1-7.7.1 2.4-1.2 3.5-2.2 3.7C12 7.7 10 5.3 8 3c.1 3.4-1.1 5.7-2.7 8C4.4 12.4 4 13.7 4 15c0 4 3 7 8 7Z" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

// Dashboard preview displayed on the right side
function DashboardPreview() {
  return (
    <div className="sf-hero__art" aria-hidden="true">
      <div className="sf-hero__halo" />

      <span className="sf-hero__sparkle sf-hero__sparkle--one">
        ✦
      </span>
      <span className="sf-hero__sparkle sf-hero__sparkle--two">
        ✳
      </span>
      <span className="sf-hero__sparkle sf-hero__sparkle--three">
        ✧
      </span>

      <div className="sf-preview">
        <div className="sf-preview__window-bar">
          <div className="sf-preview__dots">
            <i />
            <i />
            <i />
          </div>
          <span>MY LITTLE PRODUCTIVITY SPACE</span>
        </div>

        <div className="sf-preview__workspace">
          <div className="sf-preview__sidebar">
            <span className="sf-preview__leaf">
              <HeroIcon name="leaf" size={21} />
            </span>
            <HeroIcon name="grid" size={21} />
            <HeroIcon name="task" size={21} />
            <HeroIcon name="clock" size={21} />
            <HeroIcon name="calendar" size={21} />
            <HeroIcon name="note" size={21} />
          </div>

          <div className="sf-preview__main">
            <div className="sf-preview__greeting">
              <span>LET'S MAKE TODAY COUNT</span>
              <strong>You've got this, Alex. ☀</strong>
            </div>

            <div className="sf-preview__message">
              <div>
                A little focus.
                <strong>A lot of possibility.</strong>
              </div>
              <span>✳</span>
            </div>

            <div className="sf-preview__stats">
              <div className="sf-preview__stat">
                <div className="sf-preview__stat-label">
                  Tasks complete
                  <HeroIcon name="task" size={13} />
                </div>
                <p>
                  <strong>4</strong> / 6
                </p>
              </div>

              <div className="sf-preview__stat">
                <div className="sf-preview__stat-label">
                  Focus time
                  <HeroIcon name="clock" size={13} />
                </div>
                <p>
                  <strong>1h</strong> 25m
                </p>
              </div>

              <div className="sf-preview__stat">
                <div className="sf-preview__stat-label">
                  Study streak
                  <HeroIcon name="flame" size={13} />
                </div>
                <p>
                  <strong>5</strong> days
                </p>
              </div>
            </div>

            <div className="sf-preview__bottom">
              <div className="sf-preview__wins">
                <div className="sf-preview__section-title">
                  Today's little wins
                  <span>•••</span>
                </div>

                <div className="sf-preview__win">
                  <span>✓</span>
                  <s>Revise chapter 04</s>
                </div>

                <div className="sf-preview__win">
                  <span>✓</span>
                  <s>Finish database assignment</s>
                </div>

                <div className="sf-preview__win">
                  <span>○</span>
                  Plan tomorrow's tasks
                </div>
              </div>

              <div className="sf-preview__focus">
                <span>TIME TO FOCUS</span>
                <strong>25:00</strong>
                <small>One thing at a time.</small>
                <div className="sf-preview__focus-button">
                  ▶ Start session
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sf-hero__floating sf-hero__floating--focus">
        <HeroIcon name="flame" size={23} />
        <div>
          <strong>In my focus era</strong>
          <span>One session at a time.</span>
        </div>
      </div>

      <div className="sf-hero__floating sf-hero__floating--win">
        <span className="sf-hero__win-icon">
          <HeroIcon name="check" size={21} />
        </span>
        <div>
          <strong>Small win unlocked!</strong>
          <span>Progress looks good on you.</span>
        </div>
        <span className="sf-hero__floating-star">✧</span>
      </div>
    </div>
  );
}

// Main Hero Section
export default function Hero() {
  return (
    <section
      className="sf-hero"
      aria-labelledby="sf-hero-title"
    >
      <div className="sf-hero__inner">
        <div className="sf-hero__copy">
          <p className="sf-hero__eyebrow">
            <span />
            YOUR NEXT CHAPTER, A LITTLE MORE ORGANIZED
          </p>

          <h1 id="sf-hero-title">
            Big dreams.
            <br />
            Busy days.
            <br />
            Find your flow.
          </h1>

          <p className="sf-hero__description">
            Less juggling, more getting there. Bring your
            tasks, study sessions, and bright ideas
            together in one calm little corner of the
            internet.
          </p>

          <div className="sf-hero__actions">
            <a
              className="sf-hero__primary"
              href="#dashboard"
            >
              Back to my dashboard
              <HeroIcon name="arrow" size={20} />
            </a>

            <a
              className="sf-hero__secondary"
              href="#features"
            >
              <span className="sf-hero__play">
                <HeroIcon name="play" size={14} />
              </span>
              Explore the demo
            </a>
          </div>

          <p className="sf-hero__reassurance">
            <HeroIcon name="check" size={18} />
            Your pace. Your progress. Your space.
          </p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}
