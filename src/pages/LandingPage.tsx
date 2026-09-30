import "../styles/landing.css";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import ThumbnailStudio from "../components/landing/ThumbnailStudio";
import ShortsStudio from "../components/landing/ShortsStudio";
import HowItWorks from "../components/landing/HowItWorks";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="wl-landing">
      <Navbar />
      <Hero />
      <ThumbnailStudio />
      <ShortsStudio />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
