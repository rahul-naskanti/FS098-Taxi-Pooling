import React from 'react';
import { FaCarSide, FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-[#090c15] border-t border-slate-900 pt-16 pb-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900/60">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
                <FaCarSide className="text-base" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white font-display">
                FS098 <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">TaxiPool</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Real-time taxi pooling for daily commuters, office professionals, and students. Reduce traffic, split fares, and build community connections.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#home" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">About / How It Works</a></li>
            </ul>
          </div>

          {/* Contact / Newsletter Placeholder */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Stay Connected</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Subscribe to get updates on matching routes and service updates.
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500/50 focus:outline-none text-white"
              />
              <button className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} FS098 TaxiPool. All rights reserved. Built with React and Tailwind.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400 text-base">
            <a href="#" className="p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 hover:text-white hover:scale-105 transition-all" aria-label="Github">
              <FaGithub />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 hover:text-white hover:scale-105 transition-all" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 hover:text-white hover:scale-105 transition-all" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 hover:text-white hover:scale-105 transition-all" aria-label="Email">
              <FaEnvelope />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
