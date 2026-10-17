
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";

function App() {
  return (
    <>
      <Navbar />

      <main id="home">
        <Hero />
        <Features />
        <HowItWorks />
        <FAQs />
      </main>
    </>
  );
}

export default App;
