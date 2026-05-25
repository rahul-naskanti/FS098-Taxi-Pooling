import React from 'react';
import Header from '../../components/common/Header/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import CostCalculatorSection from './components/CostCalculatorSection.jsx';
import ServicesSection from './components/ServicesSection.jsx';
import SafetyFeaturesSection from './components/SafetyFeaturesSection.jsx';
import AboutSection from './components/AboutSection.jsx';
import TestimonialsSection from './components/TestimonialsSection.jsx';
import FAQsSection from './components/FAQsSection.jsx';
import CallToActionSection from './components/CallToActionSection.jsx';
import Footer from '../../components/common/Footer/Footer.jsx';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between overflow-x-hidden text-slate-200">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* Interactive savings Estimator */}
        <CostCalculatorSection />

        {/* Features / Services Section */}
        <ServicesSection />

        {/* Trust & Safety Features */}
        <SafetyFeaturesSection />

        {/* How It Works / About Section */}
        <AboutSection />

        {/* User Testimonials */}
        <TestimonialsSection />

        {/* Frequently Asked Questions */}
        <FAQsSection />

        {/* CTA Banner */}
        <CallToActionSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
