import Link from "next/link";
import { prisma } from "../lib/prisma";
import { ELEMENT_COLORS } from "../lib/theme";

export default async function Home() {
  // 1. Fetch record counts simultaneously from the database
  const [charCount, weaponCount, artifactCount] = await Promise.all([
    prisma.character.count(),
    prisma.weapon.count(),
    prisma.artifactSet.count(),
  ]);

  // 2. Structured data for grid cards (100% English & Official Game Terms)
  const cards = [
    {
      href: "/characters",
      label: "Characters",
      subLabel: "ROSTER ARCHIVE",
      count: charCount,
      desc: "Detailed stats, combat talents, constellation configurations, and ascension materials.",
      gradient: "from-amber-500/20 to-orange-500/5",
    },
    {
      href: "/weapons",
      label: "Weapons",
      subLabel: "ARMORY DATABASE",
      count: weaponCount,
      desc: "Base attributes, passive abilities, and upgrade scaling across elite ascension tiers.",
      gradient: "from-blue-500/20 to-indigo-500/5",
    },
    {
      href: "/artifacts",
      label: "Artifacts",
      subLabel: "REPLICAS & SETS",
      count: artifactCount,
      desc: "Set activation bonuses for 2-piece and 4-piece combinations to optimize builds.",
      gradient: "from-purple-500/20 to-pink-500/5",
    },
  ];

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center px-4 py-16 overflow-hidden">
      
      {/* BACKGROUND DECORATIONS (Atmospheric mist/glow effects) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl w-full mx-auto">
        
        {/* ELEMENTAL NAV BAR (Glow-in-the-dark elemental matrix) */}
        <div className="flex justify-center flex-wrap gap-5 mb-14">
          {Object.entries(ELEMENT_COLORS).map(([name, color]) => (
            <div
              key={name}
              title={name}
              className="relative w-12 h-12 rounded-full border flex items-center justify-center font-bold text-xs uppercase tracking-tighter transition-all duration-500 hover:scale-125 hover:rotate-12 cursor-help group backdrop-blur-sm"
              style={{
                borderColor: `${color}60`,
                boxShadow: `0 0 20px -3px ${color}40, inset 0 0 12px ${color}20`,
                backgroundColor: `${color}10`,
                color: color
              }}
            >
              {/* Short elemental code prefix */}
              <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                {name.substring(0, 2)}
              </span>
              {/* Radial glow overlay on hover */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                style={{ backgroundColor: `${color}30` }}
              />
            </div>
          ))}
        </div>

        {/* HERO SECTION (Classic Teyvat cinematic typography) */}
        <div className="text-center mb-20 relative">
          {/* Elegant geometric divider wire */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent pointer-events-none" />
          
          <div className="relative inline-block bg-neutral-950 px-8">
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-[0.2em] uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_12px_rgba(217,119,6,0.3)] font-serif">
              LEIBO
            </h1>
            <div className="w-24 h-[2px] bg-amber-400 mx-auto mb-4 shadow-[0_0_8px_#fbbf24]" />
          </div>
          
          <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto tracking-widest uppercase font-light mt-2">
            Genshin Impact Database 
            <span className="block text-xs text-neutral-500 mt-1 font-sans italic tracking-normal normal-case">
              A static tracking archive synced directly from the core game structure data.
            </span>
          </p>
        </div>

        {/* DASHBOARD GRID CARDS (Fantasy UI container slots) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="relative bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md rounded-2xl p-8 transition-all duration-500 hover:-translate-y-3 hover:border-amber-500/50 block group overflow-hidden shadow-2xl"
            >
              {/* Dynamic aura blend backdrop */}
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Metallic corner brackets replicating the game UI */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-700 group-hover:border-amber-400 transition-colors" />

              {/* Record counter indicator */}
              <div className="relative text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mb-4 tracking-tight transition-transform duration-500 group-hover:scale-110 origin-left drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                {c.count}
              </div>

              {/* Category core title */}
              <div className="relative text-xl font-bold text-neutral-100 tracking-wide flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                {c.label}
                <span className="transform translate-x-0 opacity-0 group-hover:translate-x-2 group-hover:opacity-100 transition-all duration-300 text-amber-400">
                  &rarr;
                </span>
              </div>

              {/* Technical sub-header label */}
              <div className="relative text-[10px] text-amber-500/60 font-mono tracking-widest uppercase mb-4">
                {c.subLabel}
              </div>

              {/* Summary details specification */}
              <div className="relative text-xs text-neutral-400 leading-relaxed font-light group-hover:text-neutral-300 transition-colors">
                {c.desc}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
