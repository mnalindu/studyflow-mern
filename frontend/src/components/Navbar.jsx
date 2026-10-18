
import { useState } from "react";
import { Leaf, ArrowUpRight, Menu, X } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="navbar">

        {/* StudyFlow Logo */}
        <a
          href="#home"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-icon">
            <Leaf size={28} strokeWidth={1.8} />
          </span>

          <span>
            StudyFlow<span className="brand-dot">.</span>
          </span>
        </a>

        {/* Navigation Links */}
        <nav
          id="studyflow-navigation"
          className={`nav-links ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          <a href="#features" onClick={closeMenu}>
            Features
          </a>

          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>

          <a href="#faqs" onClick={closeMenu}>
            FAQs
          </a>

          {/* Mobile Authentication Buttons */}
          <div className="mobile-auth">
            <a
              href="#login"
              className="mobile-signin"
              onClick={closeMenu}
            >
              Sign in
            </a>

            <a
              href="#signup"
              className="mobile-getstarted"
              onClick={closeMenu}
            >
              Get started
              <ArrowUpRight size={18} />
            </a>
          </div>
        </nav>

        {/* Desktop Authentication Buttons */}
        <div className="nav-auth">
          <a
            href="#login"
            className="nav-signin"
          >
            Sign in
          </a>

          <a
            href="#signup"
            className="nav-getstarted"
          >
            Get started
            <ArrowUpRight size={19} strokeWidth={1.9} />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="studyflow-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>
    </header>
  );
}
