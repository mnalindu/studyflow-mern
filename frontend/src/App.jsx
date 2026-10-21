
import { useState, useEffect } from "react";

// Home Page Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

// Authentication Pages
import Login from "./components/Login";
import Signup from "./components/Signup";

// Workspace
import Dashboard from "./components/Dashboard";

// Shared Task Context
import {
  StudyTasksProvider,
} from "./components/StudyTasksContext";

function AppContent() {
  const [hash, setHash] = useState(
    () => window.location.hash || "#home"
  );

  // -----------------------------------
  // Listen for route changes
  // -----------------------------------

  useEffect(() => {
    function handleHashChange() {
      setHash(
        window.location.hash || "#home"
      );
    }

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

  // -----------------------------------
  // Scroll handling
  // -----------------------------------

  useEffect(() => {
    const standalonePages = [
      "#home",
      "#login",
      "#signup",
      "#dashboard",
      "#tasks",
      "#focus",
      "#calendar",
      "#analytics",
      "#notes",
    ];

    if (standalonePages.includes(hash)) {
      window.scrollTo(0, 0);
      return;
    }

    const sectionId = hash.replace("#", "");

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          block: "start",
        });
    });

    return () => cancelAnimationFrame(frame);
  }, [hash]);

  // -----------------------------------
  // Login
  // -----------------------------------

  if (hash === "#login") {
    return <Login />;
  }

  // -----------------------------------
  // Signup
  // -----------------------------------

  if (hash === "#signup") {
    return <Signup />;
  }

  // -----------------------------------
  // Workspace Routes
  // -----------------------------------

  const workspaceRoutes = {
    "#dashboard": "dashboard",
    "#tasks": "tasks",
    "#focus": "focus",
    "#calendar": "calendar",
    "#analytics": "analytics",
    "#notes": "notes",
  };

  if (
    Object.prototype.hasOwnProperty.call(
      workspaceRoutes,
      hash
    )
  ) {
    return (
      <Dashboard
        view={workspaceRoutes[hash]}
      />
    );
  }

  // -----------------------------------
  // Home Page
  // -----------------------------------

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

// -----------------------------------
// Shared Provider
// -----------------------------------

export default function App() {
  return (
    <StudyTasksProvider>
      <AppContent />
    </StudyTasksProvider>
  );
}
