import React from 'react';

interface FactoryVisualProps {
  industry: string | null | undefined;
}

export const FactoryVisual: React.FC<FactoryVisualProps> = ({ industry }) => {
  const ind = industry || '🚗 Automotive';

  // Render the SVG based on the industry selection
  const renderSVG = () => {
    switch (ind) {
      case '🚗 Automotive':
        return (
          <svg className="w-full h-full text-red-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="auto-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Background Glow */}
            <circle cx="100" cy="100" r="80" fill="url(#auto-glow)" />
            {/* Car Chassis outline */}
            <path d="M40 140 H160 M50 140 L60 115 H140 L150 140 M75 115 L85 90 H115 L125 115" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="70" cy="140" r="12" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="130" cy="140" r="12" stroke="currentColor" strokeWidth="2.5" />
            {/* Robotic Arm */}
            <path d="M140 40 L110 70 L90 100" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
            <circle cx="110" cy="70" r="6" fill="#64748B" />
            <circle cx="140" cy="40" r="8" fill="#475569" />
            {/* Welding Nozzle & Sparks */}
            <path d="M90 100 L82 108" stroke="currentColor" strokeWidth="3" />
            <circle cx="82" cy="108" r="3" fill="#F59E0B" className="animate-ping" />
            <line x1="82" y1="108" x2="70" y2="100" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="108" x2="88" y2="120" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="108" x2="68" y2="114" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="108" x2="80" y2="92" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case '📱 Electronics':
        return (
          <svg className="w-full h-full text-blue-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="elec-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#elec-glow)" />
            {/* Circuit Board Grid */}
            <rect x="50" y="50" width="100" height="100" rx="8" stroke="currentColor" strokeWidth="2.5" />
            <line x1="50" y1="80" x2="150" y2="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50" y1="120" x2="150" y2="120" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="80" y1="50" x2="80" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="120" y1="50" x2="120" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            {/* Center Microchip */}
            <rect x="85" y="85" width="30" height="30" rx="4" fill="currentColor" />
            {/* Connection traces */}
            <path d="M100 50 V85 M100 115 V150 M50 100 H85 M115 100 H150" stroke="currentColor" strokeWidth="2" />
            {/* Pick & place head */}
            <circle cx="100" cy="100" r="6" fill="#06B6D4" className="animate-pulse" />
            <path d="M100 25 V75" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <line x1="90" y1="75" x2="110" y2="75" stroke="#64748B" strokeWidth="2" />
          </svg>
        );
      case '💊 Pharmaceutical':
        return (
          <svg className="w-full h-full text-emerald-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pharma-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#pharma-glow)" />
            {/* Laboratory Beaker / Flask */}
            <path d="M85 50 H115 M100 50 V75 M100 75 L65 145 A10 10 0 0 0 74 160 H126 A10 10 0 0 0 135 145 L100 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Liquid Level */}
            <path d="M75 125 H125 L129 133 H71 L75 125 Z" fill="currentColor" fillOpacity="0.5" />
            {/* Chemical Molecules */}
            <circle cx="70" cy="70" r="8" stroke="currentColor" strokeWidth="2" />
            <circle cx="130" cy="70" r="8" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="35" r="5" fill="currentColor" />
            <line x1="78" y1="70" x2="122" y2="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Bubbles */}
            <circle cx="95" cy="115" r="3" fill="currentColor" className="animate-bounce" />
            <circle cx="108" cy="130" r="4" fill="currentColor" />
            <circle cx="88" cy="140" r="3" fill="currentColor" />
          </svg>
        );
      case '🍪 Food Processing':
        return (
          <svg className="w-full h-full text-amber-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="food-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#food-glow)" />
            {/* Conveyor Belt */}
            <rect x="40" y="115" width="120" height="15" rx="7.5" stroke="currentColor" strokeWidth="3" />
            <circle cx="50" cy="122.5" r="4" fill="currentColor" />
            <circle cx="75" cy="122.5" r="4" fill="currentColor" />
            <circle cx="100" cy="122.5" r="4" fill="currentColor" />
            <circle cx="125" cy="122.5" r="4" fill="currentColor" />
            <circle cx="150" cy="122.5" r="4" fill="currentColor" />
            {/* Extruder Nozzle */}
            <path d="M100 45 V85 L90 95 H110 L100 85 Z" fill="#94A3B8" />
            <line x1="80" y1="45" x2="120" y2="45" stroke="#64748B" strokeWidth="4" />
            {/* Food item on conveyor */}
            <circle cx="70" cy="102" r="10" fill="currentColor" />
            <circle cx="100" cy="104" r="7" fill="currentColor" className="animate-pulse" />
            <circle cx="130" cy="102" r="10" fill="currentColor" fillOpacity="0.4" />
            {/* Chocolate Chips */}
            <circle cx="68" cy="98" r="1.5" fill="#451A03" />
            <circle cx="73" cy="104" r="1.5" fill="#451A03" />
            <circle cx="128" cy="98" r="1.5" fill="#451A03" />
            <circle cx="133" cy="104" r="1.5" fill="#451A03" />
          </svg>
        );
      case '🧵 Textile':
        return (
          <svg className="w-full h-full text-purple-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="textile-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#textile-glow)" />
            {/* Loom Thread Frame */}
            <rect x="50" y="50" width="100" height="100" rx="4" stroke="currentColor" strokeWidth="2.5" />
            {/* Weaving Threads */}
            <line x1="70" y1="50" x2="70" y2="150" stroke="currentColor" strokeWidth="1.5" />
            <line x1="90" y1="50" x2="90" y2="150" stroke="currentColor" strokeWidth="1.5" />
            <line x1="110" y1="50" x2="110" y2="150" stroke="currentColor" strokeWidth="1.5" />
            <line x1="130" y1="50" x2="130" y2="150" stroke="currentColor" strokeWidth="1.5" />
            
            <line x1="50" y1="70" x2="150" y2="70" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="50" y1="90" x2="150" y2="90" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="50" y1="110" x2="150" y2="110" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            <line x1="50" y1="130" x2="150" y2="130" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
            {/* Moving Shuttle */}
            <path d="M80 84 L120 90 L80 96 Z" fill="currentColor" className="animate-bounce" />
            {/* Spindle wheel */}
            <circle cx="100" cy="100" r="16" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
          </svg>
        );
      case '🧴 Cosmetics':
        return (
          <svg className="w-full h-full text-pink-500/80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cosm-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#cosm-glow)" />
            {/* Fragrance Bottle */}
            <path d="M75 90 H125 V155 H75 V90 Z" stroke="currentColor" strokeWidth="3" rx="6" />
            <path d="M90 90 V70 H110 V90" stroke="currentColor" strokeWidth="2" />
            {/* Spray Pump / Cap */}
            <circle cx="100" cy="62" r="5" fill="currentColor" />
            <path d="M100 62 L88 56" stroke="currentColor" strokeWidth="2" />
            {/* Mist Particles */}
            <circle cx="78" cy="50" r="2.5" fill="currentColor" className="animate-ping" />
            <circle cx="68" cy="45" r="1.5" fill="currentColor" />
            <circle cx="82" cy="40" r="2" fill="currentColor" />
            <circle cx="72" cy="35" r="1" fill="currentColor" />
            {/* Liquid contents */}
            <path d="M77 115 C85 110 115 120 123 115 V152 H77 V115 Z" fill="currentColor" fillOpacity="0.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-slate-500/5 backdrop-blur-sm rounded-2xl border border-slate-500/10">
      <div className="w-48 h-48 sm:w-56 sm:h-56">
        {renderSVG()}
      </div>
    </div>
  );
};
