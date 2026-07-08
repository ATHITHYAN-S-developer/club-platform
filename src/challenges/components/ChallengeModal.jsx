import React, { useState } from 'react';
import { DIFFICULTY } from '../config/challengeConfig';

export default function ChallengeModal({
  challenge,
  isOpen,
  onClose,
  onSolve,
  isBookmarked = false,
  onToggleBookmark,
  userSubmission = null
}) {
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'hints'
  const [copied, setCopied] = useState(false);

  if (!isOpen || !challenge) return null;

  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;

  const handleShare = () => {
    const url = `${window.location.origin}/challenges/${challenge.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-light)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${diff.color}15`, color: diff.color }}
            >
              {diff.label}
            </span>
            <h2 className="text-base font-black text-[var(--text)] tracking-tight">{challenge.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer border-none bg-transparent"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-0">
          
          {/* Left panel (70%): Tabs content */}
          <div className="lg:col-span-2 space-y-5 flex flex-col min-h-0">
            
            {/* Tab controls */}
            <div className="flex gap-2 border-b border-[var(--border-light)] pb-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('problem')}
                className="px-4 py-1.5 text-xs font-bold transition-all border-b-2 bg-transparent border-none cursor-pointer"
                style={{
                  borderColor: activeTab === 'problem' ? 'var(--orange)' : 'transparent',
                  color: activeTab === 'problem' ? 'var(--orange)' : 'var(--text-muted)'
                }}
              >
                <i className="fa-solid fa-book-open mr-1.5" />
                Problem Description
              </button>
              {challenge.hints?.length > 0 && (
                <button
                  onClick={() => setActiveTab('hints')}
                  className="px-4 py-1.5 text-xs font-bold transition-all border-b-2 bg-transparent border-none cursor-pointer"
                  style={{
                    borderColor: activeTab === 'hints' ? 'var(--orange)' : 'transparent',
                    color: activeTab === 'hints' ? 'var(--orange)' : 'var(--text-muted)'
                  }}
                >
                  <i className="fa-solid fa-lightbulb mr-1.5" />
                  Hints ({challenge.hints.length})
                </button>
              )}
            </div>

            {/* Scrollable Tabs Viewport */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1.5">
              {activeTab === 'problem' ? (
                <>
                  {/* Problem Description */}
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {challenge.description}
                  </div>

                  {/* Constraints */}
                  {challenge.constraints && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider">Constraints</h4>
                      <pre className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl font-mono text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {challenge.constraints}
                      </pre>
                    </div>
                  )}

                  {/* Sample Test Case */}
                  {challenge.sampleTestCases?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider">Sample Test Case</h4>
                      {challenge.sampleTestCases.map((tc, idx) => (
                        <div key={idx} className="border border-[var(--border)] rounded-xl overflow-hidden">
                          <div className="px-3.5 py-1.5 bg-[var(--surface-2)] text-[10px] font-black uppercase text-[var(--text-muted)] border-b border-[var(--border)]">
                            Sample #{idx + 1}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] bg-[var(--surface)]">
                            <div className="p-3">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Input</span>
                              <pre className="text-xs font-mono text-[var(--text)] mt-1 whitespace-pre-wrap">{tc.input}</pre>
                            </div>
                            <div className="p-3">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Output</span>
                              <pre className="text-xs font-mono text-[var(--text)] mt-1 whitespace-pre-wrap">{tc.output}</pre>
                            </div>
                          </div>
                          {tc.explanation && (
                            <div className="px-3.5 py-2.5 bg-[var(--card)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
                              <strong>Explanation:</strong> {tc.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Hints view */
                <div className="space-y-3.5">
                  {challenge.hints.map((hint, index) => (
                    <div key={index} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{hint}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right panel (30%): Stats & actions */}
          <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-[var(--border-light)] pt-6 lg:pt-0 lg:pl-6">
            
            {/* Quick stats items */}
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">Stats & Limits</h3>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)] font-semibold">Reward Value</span>
                <span className="font-extrabold text-[var(--text)] flex items-center gap-1">
                  <i className="fa-solid fa-star text-yellow-500" />
                  {challenge.xpReward} XP
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)] font-semibold">Time Limit</span>
                <span className="font-extrabold text-[var(--text)]">{challenge.timeLimit || 10} Mins</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)] font-semibold">Memory Limit</span>
                <span className="font-extrabold text-[var(--text)]">{challenge.memoryLimit || 256} MB</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-muted)] font-semibold">Status</span>
                <span className="font-extrabold">
                  {userSubmission?.status === 'passed' ? (
                    <span className="text-emerald-500 flex items-center gap-1"><i className="fa-solid fa-circle-check" /> Solved</span>
                  ) : userSubmission?.status === 'failed' ? (
                    <span className="text-red-500 flex items-center gap-1"><i className="fa-solid fa-circle-xmark" /> Failed</span>
                  ) : (
                    <span className="text-[var(--text-muted)]">Unsolved</span>
                  )}
                </span>
              </div>
            </div>

            {/* Submissions Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Acceptance</p>
                <p className="text-base font-black text-[var(--text)] mt-0.5">84%</p>
              </div>
              <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider">Solved By</p>
                <p className="text-base font-black text-[var(--text)] mt-0.5">342</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  onSolve();
                  onClose();
                }}
                className="w-full py-3 bg-[var(--orange)] hover:brightness-110 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-[var(--orange)]/25 transition-all border-none"
                style={{ backgroundColor: 'var(--orange)', color: '#ffffff' }}
              >
                <i className="fa-solid fa-play" />
                Solve Challenge
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onToggleBookmark(challenge.id)}
                  className={`py-2 px-3 border border-[var(--border)] hover:border-[var(--orange)]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--surface)] text-[var(--text)]`}
                >
                  <i className={`${isBookmarked ? 'fa-solid text-[var(--orange)]' : 'fa-regular'} fa-bookmark`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--orange)]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[var(--text)]"
                >
                  <i className="fa-solid fa-share-nodes" />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
