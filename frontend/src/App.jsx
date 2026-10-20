
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

// Dashboard
import Dashboard from "./components/Dashboard";

// Shared Tasks Provider
import {
  StudyTasksProvider,
} from "./components/StudyTasksContext";

function AppContent() {
  const [hash, setHash] = useState(
    () => window.location.hash || "#home"
  );

  useEffect(() => {
    function handleHashChange() {
      setHash(window.location.hash || "#home");
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

  useEffect(() => {
    const standalonePages = [
      "#login",
      "#signup",
      "#dashboard",
      "#tasks",
      "#focus",
      "#home",
    ];

    if (standalonePages.includes(hash)) {
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

  // Login
  if (hash === "#login") {
    return <Login />;
  }

  // Signup
  if (hash === "#signup") {
    return <Signup />;
  }

  // Dashboard, My Tasks and Focus Timer
  if (
    hash === "#dashboard" ||
    hash === "#tasks" ||
    hash === "#focus"
  ) {
    let view = "dashboard";

    if (hash === "#tasks") {
      view = "tasks";
    }

    if (hash === "#focus") {
      view = "focus";
    }

    return <Dashboard view={view} />;
  }

  // Home
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

// Shared provider wraps the whole app
export default function App() {
  return (
    <StudyTasksProvider>
      <AppContent />
    </StudyTasksProvider>
  );
}
