import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFICULTY } from '../config/challengeConfig';

export default function ChallengeModal({
  challenge, isOpen, onClose, onSolve,
  isBookmarked = false, onToggleBookmark, userSubmission = null
}) {
  const [activeTab, setActiveTab] = useState('problem');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !challenge) return null;

  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/challenges/${challenge.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[85vh] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border-light)] bg-[var(--surface-2)]">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0"
                  style={{ backgroundColor: `${diff.color}15`, color: diff.color }}
                >
                  {diff.label}
                </span>
                <h2 className="text-base font-black text-[var(--text)] tracking-tight truncate">{challenge.title}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all cursor-pointer border-none bg-transparent flex-shrink-0"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-0">
              {/* Left panel */}
              <div className="lg:col-span-2 space-y-5 flex flex-col min-h-0">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-[var(--border-light)] pb-2 flex-shrink-0">
                  {[
                    { id: 'problem', label: 'Problem Description', icon: 'fa-book-open' },
                    ...(challenge.hints?.length > 0 ? [{ id: 'hints', label: `Hints (${challenge.hints.length})`, icon: 'fa-lightbulb' }] : [])
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-4 py-1.5 text-xs font-bold transition-all bg-transparent border-none cursor-pointer"
                      style={{ color: activeTab === tab.id ? 'var(--orange)' : 'var(--text-muted)' }}
                    >
                      <i className={`fa-solid ${tab.icon} mr-1.5`} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="modalTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: 'var(--orange)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-5 pr-1.5">
                  {activeTab === 'problem' ? (
                    <>
                      {challenge.description && (
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                          {challenge.description}
                        </div>
                      )}

                      {challenge.constraints && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-ruler-combined text-[var(--orange)]" />
                            Constraints
                          </h4>
                          <pre className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl font-mono text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                            {challenge.constraints}
                          </pre>
                        </div>
                      )}

                      {challenge.sampleTestCases?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-vial text-[var(--orange)]" />
                            Sample Test Cases
                          </h4>
                          {challenge.sampleTestCases.map((tc, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="border border-[var(--border)] rounded-xl overflow-hidden"
                            >
                              <div className="px-3.5 py-1.5 bg-[var(--surface-2)] text-[10px] font-black uppercase text-[var(--text-muted)] border-b border-[var(--border)] flex items-center gap-2">
                                <i className="fa-solid fa-flask text-[var(--orange)]" />
                                Sample #{idx + 1}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] bg-[var(--surface)]">
                                <div className="p-3">
                                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                                    <i className="fa-solid fa-arrow-right-to-bracket" />
                                    Input
                                  </span>
                                  <pre className="text-xs font-mono text-[var(--text)] mt-1 whitespace-pre-wrap">{tc.input}</pre>
                                </div>
                                <div className="p-3">
                                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                                    <i className="fa-solid fa-arrow-right-from-bracket" />
                                    Output
                                  </span>
                                  <pre className="text-xs font-mono text-[var(--text)] mt-1 whitespace-pre-wrap">{tc.output}</pre>
                                </div>
                              </div>
                              {tc.explanation && (
                                <div className="px-3.5 py-2.5 bg-[var(--card)] border-t border-[var(--border)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
                                  <strong>Explanation:</strong> {tc.explanation}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3.5">
                      {challenge.hints.map((hint, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex gap-3 items-start group hover:border-[var(--orange)]/20 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-[var(--orange)]/10 text-[var(--orange)] flex items-center justify-center flex-shrink-0 text-xs font-bold group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5">{hint}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-[var(--border-light)] pt-6 lg:pt-0 lg:pl-6">
                {/* Stats */}
                <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl space-y-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-info text-[var(--orange)]" />
                    Stats & Limits
                  </h3>
                  {[
                    { label: 'Reward Value', value: `${challenge.xpReward} XP`, icon: 'fa-star', color: '#f59e0b' },
                    { label: 'Time Limit', value: `${challenge.timeLimit || 10} Mins`, icon: 'fa-clock' },
                    { label: 'Memory Limit', value: `${challenge.memoryLimit || 256} MB`, icon: 'fa-microchip' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                        <i className={`fa-solid ${item.icon}`} style={{ color: item.color || 'var(--text-muted)' }} />
                        {item.label}
                      </span>
                      <span className="font-extrabold text-[var(--text)]">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-[var(--border-light)]">
                    <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                      <i className="fa-solid fa-flag-checkered" />
                      Status
                    </span>
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

                {/* Stats grid */}
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

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onSolve(); onClose(); }}
                    className="w-full py-3 bg-[var(--orange)] hover:brightness-110 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-[var(--orange)]/25 transition-all border-none"
                  >
                    <i className="fa-solid fa-play" />
                    Solve Challenge
                  </motion.button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleBookmark(challenge.id)}
                      className="py-2 px-3 border border-[var(--border)] hover:border-[var(--orange)]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[var(--surface)] text-[var(--text)]"
                    >
                      <i className={`${isBookmarked ? 'fa-solid text-[var(--orange)]' : 'fa-regular'} fa-bookmark`} />
                      {isBookmarked ? 'Saved' : 'Bookmark'}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="py-2 px-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--orange)]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-[var(--text)]"
                    >
                      <i className="fa-solid fa-share-nodes" />
                      {copied ? 'Copied!' : 'Share'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
