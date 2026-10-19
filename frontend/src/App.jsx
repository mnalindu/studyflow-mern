
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
import Dashboard from "./components/Dashboard";

function App() {
  const [hash, setHash] = useState(
    () => window.location.hash || "#home"
  );

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", handleHashChange);

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

  if (hash === "#login") {
    return <Login />;
  }

  if (hash === "#signup") {
    return <Signup />;
  }

  if (hash === "#dashboard") {
    return <Dashboard />;
  }

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
