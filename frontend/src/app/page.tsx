import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import Footer from "./components/Footer";
import { Contact } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

       <section id="home">
        <Hero />
      </section>

      <section id="categories">
        <Categories />
      </section>

      <section id="how-it-works">
        <HowItWorks />
      </section>

       <section id="about">
        <About />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </main>
  );
}