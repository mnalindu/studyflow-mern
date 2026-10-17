
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";

function App() {
  return (
    <>
      <Navbar />

      <main id="home">
        <Hero />
        <Features />
      </main>
    </>
  );
}

export default App;
