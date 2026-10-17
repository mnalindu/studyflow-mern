
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section
      className="sf-final-cta"
      id="get-started"
      aria-labelledby="sf-cta-title"
    >
      <div className="sf-final-cta__container">
        <div className="sf-final-cta__card">

          {/* Decorative circles */}
          <div
            className="sf-final-cta__circle sf-final-cta__circle--left"
            aria-hidden="true"
          />
          <div
            className="sf-final-cta__circle sf-final-cta__circle--right"
            aria-hidden="true"
          />

          {/* Decorative sparkle */}
          <svg
            className="sf-final-cta__sparkle"
            width="65"
            height="65"
            viewBox="0 0 80 80"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M40 5V75M5 40H75M15 15L65 65M65 15L15 65"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>

          <div className="sf-final-cta__content">
            <p className="sf-final-cta__eyebrow">
              A FRESH PAGE. A LITTLE POSSIBILITY.
            </p>

            <h2 id="sf-cta-title">
              Your next good study day
              <br />
              starts right here.
            </h2>

            <p className="sf-final-cta__description">
              Make room for your goals. We'll help you
              find your flow.
            </p>

            <a
              className="sf-final-cta__button"
              href="#dashboard"
            >
              Open my dashboard

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>

            <p className="sf-final-cta__note">
              Or{" "}
              <a href="#features">
                explore the demo first
              </a>
              . No sign-up needed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
