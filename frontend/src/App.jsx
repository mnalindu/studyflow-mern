
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [hash, setHash] = useState(
    () => window.location.hash || "#home"
  );

  // Listen for URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#home");
    };

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, []);

  // Handle page navigation and scrolling
  useEffect(() => {
    if (
      hash === "#login" ||
      hash === "#signup" ||
      hash === "#home"
    ) {
      window.scrollTo(0, 0);
      return;
    }

    const sectionId = hash.replace("#", "");

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [hash]);

  // Login Page
  if (hash === "#login") {
    return <Login />;
  }

  // Signup Page
  if (hash === "#signup") {
    return <Signup />;
  }

  // Home Page
  return (
    <>
      <Navbar />

      <main id="home">
        <Hero />
        <Features />
        <HowItWorks />
        <FAQs />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}

export default App;
