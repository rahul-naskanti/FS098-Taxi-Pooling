import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

function CallToActionSection() {
  return (
    <section className="py-20 bg-[#0a0d17] relative overflow-hidden">
      {/* Glow decorative shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-[#111a2e] to-slate-900 border border-slate-800 rounded-3xl p-10 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          {/* Top colored line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display leading-tight">
              Ready to Save Money on Your Daily Commute?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Join thousands of office employees and college students who are matching paths daily. Register today to share a ride!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
            >
              Sign Up to Pool <FaArrowRight className="text-xs" />
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 border border-slate-700 hover:border-slate-500 text-white font-semibold rounded-xl bg-slate-950/40 backdrop-blur-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Become a Driver
            </Link>
          </div>

          {/* Quick trust trust indicators */}
          <div className="pt-6 border-t border-slate-800/80 max-w-md mx-auto flex items-center justify-center gap-8 text-[11px] text-slate-500 font-medium">
            <span>✓ Verified Profiles</span>
            <span>✓ Zero Setup Fees</span>
            <span>✓ Safe & Reliable</span>
          </div>

        </div>
      </div>
    </section>
  );
}

export default CallToActionSection;
