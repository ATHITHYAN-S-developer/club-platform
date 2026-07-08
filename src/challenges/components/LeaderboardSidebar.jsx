import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function LeaderboardSidebar({
  users = [],
  submissions = [],
  user = null
}) {
  
  // Calculate top 10 members from submissions & user profiles
  const topMembers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.challengeXp || 0) - (a.challengeXp || 0))
      .slice(0, 10);
  }, [users]);

  // Compute Weekly Progress (number of challenges solved in the past 7 days)
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);

    const solvedCount = submissions.filter(s => {
      if (s.userId !== user?.id || s.status !== 'passed') return false;
      return new Date(s.submittedAt) >= startOfWeek;
    }).length;

    const target = 10;
    const pct = Math.min((solvedCount / target) * 100, 100);

    return { solvedCount, target, pct };
  }, [submissions, user]);

  // Dynamic Achievements list
  const achievements = useMemo(() => {
    const passed = submissions.filter(s => s.userId === user?.id && s.status === 'passed');
    const streak = user?.currentStreak || 0;

    return [
      {
        id: 'first_prob',
        name: 'First Blood',
        desc: 'Solve your first coding challenge',
        reward: '100 XP',
        icon: 'fa-droplet',
        color: '#ef4444',
        unlocked: passed.length >= 1
      },
      {
        id: 'streak_solver',
        name: 'Daily Grind',
        desc: 'Maintain a 7+ day challenge streak',
        reward: '250 XP',
        icon: 'fa-fire',
        color: '#f59e0b',
        unlocked: streak >= 7
      },
      {
        id: 'speed_solver',
        name: 'Speed Demon',
        desc: 'Solve a challenge under 5 minutes',
        reward: '150 XP',
        icon: 'fa-bolt',
        color: '#3b82f6',
        unlocked: submissions.some(s => s.userId === user?.id && s.status === 'passed' && s.timeTaken && s.timeTaken <= 300)
      },
      {
        id: 'top_ten',
        name: 'Elite Core',
        desc: 'Reach the Top 10 on Leaderboard',
        reward: '500 XP',
        icon: 'fa-crown',
        color: '#8b5cf6',
        unlocked: topMembers.some(m => m.id === user?.id)
      }
    ];
  }, [submissions, user, topMembers]);

  // GitHub contribution heatmap: Renders the last 15 weeks (105 days)
  const heatmapData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Start exactly 15 weeks ago, aligned to the starting Sunday
    const startDate = new Date();
    startDate.setDate(now.getDate() - 105);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Align to Sunday

    // Map passed submissions dates
    const passedDates = new Set(
      submissions
        .filter(s => s.userId === user?.id && s.status === 'passed')
        .map(s => new Date(s.submittedAt).toDateString())
    );

    const tempDate = new Date(startDate);
    while (tempDate <= now) {
      data.push({
        dateStr: tempDate.toDateString(),
        solved: passedDates.has(tempDate.toDateString())
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Group into weeks (arrays of 7 days)
    const weeks = [];
    let currentWeek = [];
    data.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  }, [submissions, user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-6">
      
      {/* COLUMN 1: Weekly Progress & Heatmap */}
      <div className="space-y-6">
        
        {/* 📊 Weekly Progress Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--orange)] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-chart-line" />
            Weekly Progress
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text)]">Problems Solved</span>
              <span className="font-extrabold text-[var(--orange)]">{weeklyProgress.solvedCount} / {weeklyProgress.target}</span>
            </div>
            
            <div className="w-full bg-[var(--surface)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ width: `${weeklyProgress.pct}%`, backgroundColor: 'var(--orange)' }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed">Solve {weeklyProgress.target} problems weekly to accelerate XP multiplier.</p>
          </div>
        </div>

        {/* 📅 Contributions Heatmap Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--orange)] flex items-center gap-2">
              <i className="fa-solid fa-calendar-days" />
              Contribution Grid
            </h3>
            <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">15 Weeks</span>
          </div>
          
          <div className="flex justify-center p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-light)] overflow-x-auto">
            <div className="grid grid-flow-col gap-1 text-center">
              {heatmapData.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="w-2.5 h-2.5 rounded-[2px] transition-colors"
                      style={{
                        backgroundColor: day.solved ? 'var(--orange)' : 'var(--border)',
                        opacity: day.solved ? 1 : 0.45
                      }}
                      title={`${day.dateStr}: ${day.solved ? 'Passed Submission' : 'No Submissions'}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] mt-3 font-bold uppercase">
            <span>Less</span>
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[var(--border)] opacity-45" />
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[var(--orange)]" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Unlock Achievements */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm h-fit">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--orange)] mb-4 flex items-center gap-2">
          <i className="fa-solid fa-trophy" />
          Unlock Achievements
        </h3>
        <div className="space-y-3.5">
          {achievements.map((badge) => (
            <div 
              key={badge.id} 
              className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
                badge.unlocked 
                  ? 'bg-[var(--surface)] border-[var(--border)] opacity-100 shadow-xs' 
                  : 'bg-[var(--surface-2)] border-dashed border-[var(--border-light)] opacity-60'
              }`}
            >
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-sm flex-shrink-0"
                style={{ 
                  backgroundColor: badge.unlocked ? `${badge.color}15` : 'var(--border)', 
                  color: badge.unlocked ? badge.color : 'var(--text-muted)'
                }}
              >
                <i className={`fa-solid ${badge.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-[var(--text)] leading-none truncate">{badge.name}</p>
                  {badge.unlocked ? (
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-100/10 px-1.5 py-0.5 rounded uppercase leading-none">Unlocked</span>
                  ) : (
                    <span className="text-[9px] font-bold text-[var(--text-muted)] leading-none">Locked</span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 truncate">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: Top Members Leaderboard */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm h-fit">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--orange)] flex items-center gap-2">
            <i className="fa-solid fa-crown" />
            Top Members
          </h3>
          <Link to="/challenges/leaderboard" className="text-[10px] font-black text-[var(--orange)] hover:underline uppercase tracking-wider">All Standings</Link>
        </div>

        <div className="space-y-3">
          {topMembers.map((member, index) => {
            const isSelf = member.id === user?.id;
            return (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-xl border border-[var(--border)] transition-all ${
                  isSelf ? 'bg-[var(--orange)]/5 border-[var(--orange)]' : 'bg-[var(--surface)] hover:border-[var(--orange)]/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-black w-5 text-[var(--text-muted)] text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <img
                    src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'U')}&background=ff5500&color=fff`}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-[var(--border)] shadow-xs"
                  />
                  <span className={`text-xs truncate font-black ${isSelf ? 'text-[var(--orange)]' : 'text-[var(--text)]'}`}>{member.name}</span>
                </div>
                <span className="text-xs font-black text-[var(--text)]">{member.challengeXp || 0} XP</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
