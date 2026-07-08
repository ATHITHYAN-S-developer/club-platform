import React from 'react';

export default function HeroSection({
  user = null,
  level = { name: 'Beginner', xpRequired: 0 },
  userRank = null,
  onStartClick
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8 shadow-sm">
      {/* Decorative colored glow spheres */}
      <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[var(--orange)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left: Title & Pitch */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[var(--orange)] bg-[var(--orange)]/10 uppercase">
            <i className="fa-solid fa-code" />
            Empower Your Mind
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
            Coding Challenges
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            Sharpen your programming skills, build real-world AI pipelines, earn XP rewards, and compete with the brightest minds in the MindCraft AI Club.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartClick}
              className="px-6 py-3 bg-[var(--orange)] text-white hover:brightness-110 font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-[var(--orange)]/25 flex items-center gap-2 cursor-pointer border-none"
              style={{ backgroundColor: 'var(--orange)', color: '#ffffff' }}
            >
              Start Solving
              <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
        </div>

        {/* Right: 4 beautifully stylized Stats Cards */}
        {user ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Total XP',
                value: `${(user.challengeXp || 0).toLocaleString()} XP`,
                desc: 'Earned solving tasks',
                icon: 'fa-star',
                color: '#f59e0b',
                gradient: 'from-[#f59e0b]/5 to-[#f59e0b]/0'
              },
              {
                label: 'Streak',
                value: `${user.currentStreak || 0} Days`,
                desc: 'Consecutive daily runs',
                icon: 'fa-fire',
                color: '#ef4444',
                gradient: 'from-[#ef4444]/5 to-[#ef4444]/0'
              },
              {
                label: 'Club Rank',
                value: userRank ? `#${userRank.rank}` : '—',
                desc: 'Overall standings rank',
                icon: 'fa-trophy',
                color: '#10b981',
                gradient: 'from-[#10b981]/5 to-[#10b981]/0'
              },
              {
                label: 'Skill Level',
                value: level.name,
                desc: 'Current student rating',
                icon: 'fa-ranking-star',
                color: '#8b5cf6',
                gradient: 'from-[#8b5cf6]/5 to-[#8b5cf6]/0'
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border border-[var(--border)] bg-gradient-to-br ${stat.gradient} bg-[var(--card)] p-4 flex flex-col justify-between shadow-xs transition-all duration-300 hover:border-[var(--orange)]/30 hover:scale-[1.02]`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    <i className={`fa-solid ${stat.icon}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-lg md:text-xl font-black text-[var(--text)] tracking-tight">{stat.value}</p>
                  <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 border border-dashed border-[var(--border-light)] rounded-2xl bg-[var(--surface)] text-sm text-[var(--text-muted)]">
            Log in to view your real-time ranking stats.
          </div>
        )}

      </div>
    </div>
  );
}
