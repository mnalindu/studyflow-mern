
import { useState } from "react";
import "./FAQs.css";

const faqs = [
  {
    question: "Can I try StudyFlow without signing up?",
    answer:
      "Yes! We're building a demo experience so you can explore the StudyFlow workspace before creating an account. Guest access will be connected in a later development step.",
  },
  {
    question: "Is this a real account system?",
    answer:
      "We're currently developing the application. Once the MERN backend and authentication are connected, you'll be able to create an account and securely access your own study workspace.",
  },
  {
    question: "Where does my study data go?",
    answer:
      "The current frontend uses illustrative data. When the backend is complete, your tasks, goals, and study sessions will be stored in MongoDB and linked to your account.",
  },
  {
    question: "Are AI suggestions and study rooms live?",
    answer:
      "Not yet! AI-powered study suggestions and collaborative study rooms are planned features. We're starting with tasks, focus sessions, goals, and progress tracking.",
  },
];

export default function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  function toggleFAQ(index) {
    setActiveIndex((current) =>
      current === index ? null : index
    );
  }

  return (
    <section
      className="sf-faq"
      id="faqs"
      aria-labelledby="sf-faq-title"
    >
      <div className="sf-faq__container">

        {/* Left Side Heading */}
        <div className="sf-faq__intro">
          <p className="sf-faq__eyebrow">
            A FEW THINGS YOU MIGHT WONDER
          </p>

          <h2 id="sf-faq-title">
            A little clarity
            <br />
            <span>before you begin.</span>
          </h2>
        </div>

        {/* Right Side Accordion */}
        <div className="sf-faq__list">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                className={`sf-faq__item ${
                  isOpen ? "sf-faq__item--open" : ""
                }`}
                key={faq.question}
              >
                <h3 className="sf-faq__question">
                  <button
                    type="button"
                    className="sf-faq__button"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={`sf-faq-answer-${index}`}
                    id={`sf-faq-question-${index}`}
                  >
                    <span>{faq.question}</span>

                    <span
                      className="sf-faq__icon"
                      aria-hidden="true"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                <div
                  id={`sf-faq-answer-${index}`}
                  className="sf-faq__answer"
                  role="region"
                  aria-labelledby={`sf-faq-question-${index}`}
                  hidden={!isOpen}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
