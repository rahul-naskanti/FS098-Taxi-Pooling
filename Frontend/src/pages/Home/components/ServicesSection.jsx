import React from 'react';
import { FaRoute, FaShieldAlt, FaMapMarkedAlt, FaWallet } from 'react-icons/fa';

function ServicesSection() {
  const featuresList = [
    {
      icon: <FaRoute className="text-2xl text-emerald-400" />,
      title: "Real-time Ride Matching",
      description: "Our dynamic routing algorithm matches you instantly with drivers travelling in your direction, ensuring zero detours."
    },
    {
      icon: <FaShieldAlt className="text-2xl text-teal-400" />,
      title: "Secure Authentication",
      description: "Rest easy with verified corporate emails, student IDs, and secure role-based routes keeping community commutes safe."
    },
    {
      icon: <FaMapMarkedAlt className="text-2xl text-emerald-400" />,
      title: "Live Ride Tracking",
      description: "Track your co-riders, verify active routes in real-time, and get estimated arrival times to stay perfectly synchronized."
    },
    {
      icon: <FaWallet className="text-2xl text-teal-400" />,
      title: "Affordable Daily Commute",
      description: "Split fuel costs directly and transparently. Turn empty vehicle seats into savings for yourself and the community."
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0a0d17] relative">
      {/* Decorative divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Platform Benefits
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Designed for Smarter, Cheaper Commutes
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No more high fuel rates, empty seats, or boring daily traffic. Share your rides and pool together.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresList.map((feature, idx) => (
            <div
              key={idx}
              className="relative p-8 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1.5 shadow-lg group hover:shadow-emerald-500/5"
            >
              {/* Highlight gradient line on hover */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:w-full transition-all duration-300 rounded-t-2xl"></div>

              {/* Icon container */}
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-emerald-500/20 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title & Desc */}
              <h3 className="text-lg font-bold text-white mb-3 font-display group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
