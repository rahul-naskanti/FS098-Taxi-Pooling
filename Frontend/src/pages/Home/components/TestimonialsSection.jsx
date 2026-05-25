import React from 'react';
import { FaStar, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';

function TestimonialsSection() {
  const reviews = [
    {
      name: "Vivek K.",
      role: "Passenger (Ameerpet → Madhapur)",
      occupation: "Software Engineer",
      feedback: "Travelling to office was costing me ₹300+ a day on solo cabs. TaxiPool matched me with Rahul on the same route. Now I spend less than half of that and travel comfortably!",
      rating: 5,
      avatarInitials: "VK"
    },
    {
      name: "Rahul S.",
      role: "Driver (Ameerpet → Hitech City)",
      occupation: "Tech Lead",
      feedback: "I have 3 empty seats in my car every day. TaxiPool helps me match routes dynamically. It covers my monthly fuel costs and reduces traffic congestion.",
      rating: 5,
      avatarInitials: "RS"
    },
    {
      name: "Priya M.",
      role: "Passenger (Secunderabad → Gachibowli)",
      occupation: "Data Analyst",
      feedback: "Safety was my primary concern as a woman commuter. Knowing that everyone is verified with official corporate or university emails makes me feel secure.",
      rating: 5,
      avatarInitials: "PM"
    }
  ];

  return (
    <section className="py-24 bg-[#0a0d17] relative">
      {/* Decorative divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Success Stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Loved by Daily Commuters
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Hear from professionals and students who have swapped solo rides for shared commuter pools.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800/80 rounded-3xl p-8 relative flex flex-col justify-between shadow-lg"
            >
              {/* Quote icon decoration */}
              <FaQuoteLeft className="absolute top-6 right-6 text-slate-800 text-3xl opacity-30" />

              <div className="space-y-4">
                {/* Rating */}
                <div className="flex text-amber-400 text-xs gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                {/* Feedback text */}
                <p className="text-slate-300 text-sm leading-relaxed font-sans italic">
                  "{review.feedback}"
                </p>
              </div>

              {/* User details */}
              <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-slate-850">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                  {review.avatarInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                    {review.name}{' '}
                    <FaCheckCircle className="text-[10px] text-emerald-400" title="Verified Commuter" />
                  </p>
                  <p className="text-[11px] text-slate-400 font-sans leading-tight">
                    {review.occupation}
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">
                    {review.role}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TestimonialsSection;
