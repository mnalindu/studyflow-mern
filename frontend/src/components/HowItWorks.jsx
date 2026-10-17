
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "Make it yours",
    description:
      "Open your workspace, add your tasks, and choose a realistic goal for the day.",
  },
  {
    number: "02",
    title: "Take one focused step",
    description:
      "Pick a task, start a 25-minute session, and give one thing your attention.",
  },
  {
    number: "03",
    title: "Celebrate your progress",
    description:
      "Check off a task, save an idea, or finish a session. Every little win counts.",
  },
];

function HowItWorks() {
  return (
    <section
      className="sf-how"
      id="how-it-works"
      aria-labelledby="sf-how-title"
    >
      <div className="sf-how__container">
        {/* Left Side */}
        <div className="sf-how__content">
          <p className="sf-how__eyebrow">
            A SIMPLER WAY TO STUDY
          </p>

          <h2 id="sf-how-title">
            From “where do I start?”
            <br />
            <span>to “look what I did.”</span>
          </h2>

          <p className="sf-how__description">
            No complicated systems. Just a little structure
            to help you show up for yourself.
          </p>

          <a href="#dashboard" className="sf-how__link">
            Take a look inside
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>

        {/* Right Side */}
        <ol className="sf-how__steps">
          {steps.map((step) => (
            <li className="sf-how__step" key={step.number}>
              <div className="sf-how__step-number">
                {step.number}
              </div>

              <div className="sf-how__step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
