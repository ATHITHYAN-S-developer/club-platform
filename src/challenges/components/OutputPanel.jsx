import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestCaseBadge from './TestCaseBadge';

export default function OutputPanel({ results, runtime, memory, compilationError, loading }) {
  const [tab, setTab] = useState(results ? 'tests' : 'output');

  const tabs = [
    { id: 'tests', label: 'Test Results', icon: 'fa-vial' },
    { id: 'output', label: 'Output', icon: 'fa-terminal' },
    { id: 'error', label: 'Error', icon: 'fa-bug' },
    { id: 'compile', label: 'Compilation', icon: 'fa-gear' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-1 border-2 border-[var(--orange)]/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
          </div>
          <span className="text-sm font-semibold">Running...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface)]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${tab === t.id
                ? 'bg-[var(--orange)]/10 text-[var(--orange)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'}`}
          >
            <i className={`fa-solid ${t.icon}`} />
            {t.label}
            {t.id === 'tests' && results && (
              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                results.every(r => r.status === 'passed') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {results.length}
              </span>
            )}
          </button>
        ))}
        {(runtime || memory) && (
          <div className="ml-auto flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            {runtime && <span className="flex items-center gap-1"><i className="fa-solid fa-gauge-high" />{runtime}ms</span>}
            {memory && <span className="flex items-center gap-1"><i className="fa-solid fa-microchip" />{(memory / 1024).toFixed(1)} MB</span>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed bg-[var(--bg)]">
        <AnimatePresence mode="wait">
          {tab === 'tests' && results && (
            <motion.div key="tests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    r.status === 'passed' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' :
                    r.status === 'failed' ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <TestCaseBadge index={i} status={r.status} isHidden={r.isHidden} />
                  {r.status === 'failed' && (
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="text-[var(--text-muted)]">
                        Expected: <code className="text-[var(--text)] font-bold">{truncate(r.expected, 60)}</code>
                      </span>
                      <span className="text-[var(--text-muted)]">
                        Got: <code className="text-red-500 font-bold">{truncate(r.actual, 60)}</code>
                      </span>
                    </div>
                  )}
                  {r.runtime && <span className="text-[11px] text-[var(--text-muted)] ml-auto">({r.runtime}ms)</span>}
                </motion.div>
              ))}
              <div className={`pt-2 text-sm font-bold flex items-center gap-2 ${
                results.every(r => r.status === 'passed') ? 'text-emerald-500' : 'text-red-500'
              }`}>
                <i className={`fa-solid ${results.every(r => r.status === 'passed') ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
                {results.filter(r => r.status === 'passed').length} / {results.length} test cases passed
              </div>
            </motion.div>
          )}

          {tab === 'output' && (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <pre className="whitespace-pre-wrap text-[var(--text)]">{results?.find(r => r.status !== 'error')?.actual || (
                <span className="text-[var(--text-muted)] italic">No output</span>
              )}</pre>
            </motion.div>
          )}

          {tab === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <pre className="whitespace-pre-wrap text-red-500">{results?.find(r => r.status === 'error')?.actual || (
                <span className="text-[var(--text-muted)] italic">No errors</span>
              )}</pre>
            </motion.div>
          )}

          {tab === 'compile' && (
            <motion.div key="compile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <pre className={`whitespace-pre-wrap ${compilationError ? 'text-red-500' : 'text-emerald-500'}`}>
                {compilationError || 'Compilation successful'}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {!results && !compilationError && tab !== 'compile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-3">
              <i className="fa-solid fa-play text-sm" />
            </div>
            <p className="text-sm font-medium">Run your code to see output here</p>
            <p className="text-xs mt-1">Use <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[10px] font-mono">Ctrl+Enter</kbd> to run</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
