
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

// Dashboard
import Dashboard from "./components/Dashboard";

// Shared Task Context
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

  // Dashboard and My Tasks
  if (hash === "#dashboard" || hash === "#tasks") {
    return (
      <Dashboard
        view={
          hash === "#tasks"
            ? "tasks"
            : "dashboard"
        }
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

// IMPORTANT: Wrap the application with the provider
export default function App() {
  return (
    <StudyTasksProvider>
      <AppContent />
    </StudyTasksProvider>
  );
}
