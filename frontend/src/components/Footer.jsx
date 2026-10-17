
import "./Footer.css";

function FooterLogo() {
  return (
    <a
      href="#home"
      className="sf-footer__brand"
      aria-label="StudyFlow Home"
    >
      <span className="sf-footer__logo-icon">
        <svg
          width="27"
          height="27"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 4C12 4 5 7 5 15a5 5 0 0 0 5 5c8 0 11-8 10-16Z" />
          <path d="M4 21c3-6 8-10 13-13" />
        </svg>
      </span>

      <span className="sf-footer__brand-text">
        StudyFlow<span>.</span>
      </span>
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="sf-footer">
      <div className="sf-footer__container">

        {/* Top Footer Row */}
        <div className="sf-footer__top">
          <FooterLogo />

          <p className="sf-footer__tagline">
            A little more focused. A little more you.
          </p>

          <nav
            className="sf-footer__navigation"
            aria-label="Footer navigation"
          >
            <a href="#features">Features</a>
            <a href="#faqs">FAQs</a>
            <a href="#dashboard">Dashboard</a>
          </nav>
        </div>

        {/* Bottom Footer Row */}
        <div className="sf-footer__bottom">
          <p>
            © 2026 StudyFlow · Frontend demo
          </p>
        </div>
      </div>
    </footer>
  );
}
