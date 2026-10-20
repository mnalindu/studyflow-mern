
import { useState, useEffect } from "react";

// Home Page
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

// Authentication
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

  // Listen for navigation changes
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

  // Reset scroll for standalone pages
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
    ];

    if (standalonePages.includes(hash)) {
      window.scrollTo(0, 0);
      return;
    }

    // Scroll to Home Page sections
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

  // Login Page
  if (hash === "#login") {
    return <Login />;
  }

  // Signup Page
  if (hash === "#signup") {
    return <Signup />;
  }

  // Workspace Routes
  const workspaceRoutes = {
    "#dashboard": "dashboard",
    "#tasks": "tasks",
    "#focus": "focus",
    "#calendar": "calendar",
    "#analytics": "analytics",
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

// Shared provider for task management
export default function App() {
  return (
    <StudyTasksProvider>
      <AppContent />
    </StudyTasksProvider>
  );
}
