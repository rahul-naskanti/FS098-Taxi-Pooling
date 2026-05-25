import React from 'react';
import { FaShieldAlt, FaEnvelopeOpen, FaStar, FaShareAlt, FaBell } from 'react-icons/fa';

function SafetyFeaturesSection() {
  const safetyList = [
    {
      icon: <FaEnvelopeOpen className="text-emerald-400 text-lg" />,
      title: "Verified Community Only",
      description: "Mandatory corporate email (@company.com) or university verification ensures you commute only with verified professionals and peers."
    },
    {
      icon: <FaStar className="text-emerald-400 text-lg" />,
      title: "Mutual Rating Checks",
      description: "Both drivers and passengers are rated. Anyone dropping below standard rating limits is automatically restricted."
    },
    {
      icon: <FaShareAlt className="text-emerald-400 text-lg" />,
      title: "Share Live Route status",
      description: "Instantly share your active pooling coordinates and estimated arrival times with family or colleagues in one click."
    },
    {
      icon: <FaBell className="text-emerald-400 text-lg" />,
      title: "SOS In-App Alert",
      description: "An instant emergency trigger is available to immediately share logs, routes, and coordinates with local authorities and helpline teams."
    }
  ];

  return (
    <section className="py-24 bg-[#0b0f19] relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Safety Mockup Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-[380px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

              {/* Header */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
                <FaShieldAlt className="text-emerald-400 text-xl" />
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-display">Safety Shield</h4>
                  <p className="text-[10px] text-slate-500">Active protection during trip</p>
                </div>
              </div>

              {/* Verification card */}
              <div className="space-y-4">
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-850">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Commuter Profile</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded">Corporate Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">JD</div>
                    <div>
                      <p className="text-xs font-bold text-white">John Doe</p>
                      <p className="text-[9px] text-slate-500">Google Inc. | john.d@google.com</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-850 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Live Tracking</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span> On Route
                    </span>
                  </div>
                  <button className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    <FaShareAlt className="text-[9px]" /> Share Live Status
                  </button>
                </div>

                {/* Distress Alert Button */}
                <button className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 text-xs font-extrabold text-red-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-500/5 hover:shadow-red-500/10 active:scale-98">
                  <FaShieldAlt className="text-sm" /> Trigger emergency SOS
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Descriptions */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Safety First
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
                Your Security is Our Absolute Priority
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                FS098 TaxiPool is designed around safety. By establishing strict identity loops and verification structures, we keep your daily commute safe and worry-free.
              </p>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {safetyList.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-bold text-white font-display">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed pl-11">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SafetyFeaturesSection;
