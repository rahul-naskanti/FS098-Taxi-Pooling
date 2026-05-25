import React from 'react';
import { FaSearch, FaUserCheck, FaMapMarkerAlt } from 'react-icons/fa';

function AboutSection() {
  const steps = [
    {
      stepNum: "01",
      icon: <FaSearch className="text-xl text-emerald-400" />,
      title: "Search Ride",
      description: "Enter your current source, target destination, and preferred departure time to scan available routes."
    },
    {
      stepNum: "02",
      icon: <FaUserCheck className="text-xl text-teal-400" />,
      title: "Match with Drivers",
      description: "Review matching drivers based on route overlap, ratings, and pricing. Request or join instantly."
    },
    {
      stepNum: "03",
      icon: <FaMapMarkerAlt className="text-xl text-emerald-400" />,
      title: "Start Journey",
      description: "Verify co-commuters on the map, coordinate meeting points, and hop on for an eco-friendly ride."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#0b0f19] relative overflow-hidden">
      {/* Subtle bottom glowing background blob */}
      <div className="absolute -bottom-1/3 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Sharing a Ride Has Never Been Simpler
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Set your destinations, let our algorithms match you in seconds, and start saving instantly.
          </p>
        </div>

        {/* Steps Cards Wrapper */}
        <div className="relative">
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-500/10 via-slate-800 to-teal-500/10 -translate-y-12 -z-10"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                
                {/* Step indicator and Icon badge */}
                <div className="relative mb-8 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800 group-hover:border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                    {step.icon}
                  </div>
                  
                  {/* Step Number Badge */}
                  <span className="absolute -top-3 -right-3 text-[10px] font-extrabold font-display px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 rounded-full shadow shadow-black/50">
                    {step.stepNum}
                  </span>
                </div>

                {/* Step Content */}
                <div className="max-w-xs space-y-3">
                  <h3 className="text-xl font-bold text-white font-display group-hover:text-emerald-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default AboutSection;
