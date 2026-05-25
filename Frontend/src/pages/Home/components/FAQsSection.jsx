import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

function FAQsSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqItems = [
    {
      question: "How do route match calculations and fares work?",
      answer: "When a passenger searches for a route (e.g., Ameerpet to Madhapur), our algorithm matches them with drivers traveling a similar path (e.g., Ameerpet to Hitech City). Fares are split proportionally based on the distance overlap and the number of active pool riders. Fares are directly credited to the driver to offset fuel."
    },
    {
      question: "How is the community verification process handled?",
      answer: "All users must sign up using their official corporate email addresses or student ID credentials. During onboarding, these accounts are verified. We also request valid driver's licenses and vehicle details from drivers before they can create a pool."
    },
    {
      question: "What happens if a commuter cancels the pool request?",
      answer: "Passengers can cancel bookings free of charge up to 30 minutes before the departure time. Cancellations inside the 30-minute window or driver last-minute cancellations trigger minor rating adjustments to maintain reliability in the pool community."
    },
    {
      question: "Can I choose whom to share my taxi pool with?",
      answer: "Yes. When a passenger requests to join, the driver has full control to accept or reject the request. Passengers can also view driver ratings, reviews, and corporate profiles before requesting a seat."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#0b0f19] relative">
      {/* Decorative divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Support
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Got questions about taxi pooling? We have compiled answers to the most common queries.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-bold font-display hover:bg-slate-850/30 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base leading-snug">{item.question}</span>
                  <span className="text-emerald-400 text-lg shrink-0 ml-4">
                    {isOpen ? <HiChevronUp /> : <HiChevronDown />}
                  </span>
                </button>
                
                {/* Accordion Body (Collapsible) */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-60 border-t border-slate-850' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 py-5 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans bg-slate-950/30">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FAQsSection;
