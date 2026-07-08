import React from 'react';

export default function HeroSection({
  dailyChallenge = null,
  onSolveDaily = null
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#3b46f1] text-white p-8 md:p-12 shadow-xl">
      {/* Background grid/dots decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        
        {/* Left 2 Columns: Title, Subtitle, and Mentors */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3">
            Challenges 💪
          </h1>
          <p className="text-base md:text-lg text-blue-100 font-medium leading-relaxed max-w-xl">
            We launch contests regularly so you can practice your craft, gain exposure and earn great prizes. Explore our open challenges and submit your work!
          </p>
          
          {/* Mentors Section */}
          <div className="pt-4 space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-blue-200">Our mentors and alumni from:</span>
            <div className="flex flex-wrap items-center gap-6 text-sm font-black text-blue-100/80">
              <span className="flex items-center gap-1.5"><i className="fa-brands fa-google text-base" /> Google</span>
              <span className="flex items-center gap-1.5"><i className="fa-brands fa-microsoft text-base" /> Microsoft</span>
              <span className="flex items-center gap-1.5"><i className="fa-brands fa-nvidia text-base" /> Nvidia</span>
              <span className="flex items-center gap-1.5"><i className="fa-brands fa-meta text-base" /> Meta</span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Floating Featured Daily Challenge Card */}
        {dailyChallenge ? (
          <div className="lg:col-span-1 bg-white text-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-100 transition-all duration-300 hover:scale-[1.02]">
            {/* Top orange border strip */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f59e0b]" />

            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ff5500]">
                <i className="fa-solid fa-gamepad text-lg" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
              {dailyChallenge.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
              {dailyChallenge.description}
            </p>

            <button
              onClick={onSolveDaily}
              className="w-full py-3 text-white font-extrabold rounded-2xl text-xs hover:-translate-y-0.5 transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f59e0b' }}
            >
              More Details
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </button>
          </div>
        ) : (
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-md text-white/90 border border-white/20 rounded-3xl p-6 text-center text-xs font-semibold">
            No daily challenge scheduled for today. Check back tomorrow!
          </div>
        )}

      </div>
    </div>
  );
}
