import Features from "./components/Features";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import Footer from "../../components/Footer";

export default function Landing() {
  return (
    <div className="select-none">
      <Navigation />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
