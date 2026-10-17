
import { useState } from "react";
import { Leaf, ArrowUpRight, Menu, X } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="navbar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <Leaf size={28} strokeWidth={1.8} />
          </span>
          <span>
            StudyFlow<span className="brand-dot">.</span>
          </span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#faqs" onClick={closeMenu}>FAQs</a>
          <a href="#dashboard" className="mobile-dashboard" onClick={closeMenu}>
            My dashboard <ArrowUpRight size={18} />
          </a>
        </nav>

        <a href="#dashboard" className="dashboard-button">
          My dashboard
          <ArrowUpRight size={19} />
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>
    </header>
  );
}
