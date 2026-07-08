import { useState } from 'react';
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--orange)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Running...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface)]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${tab === t.id ? 'bg-[var(--orange)]/10 text-[var(--orange)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'}`}
          >
            <i className={`fa-solid ${t.icon}`} />
            {t.label}
          </button>
        ))}
        {(runtime || memory) && (
          <div className="ml-auto flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            {runtime && <span><i className="fa-solid fa-gauge-high mr-1" />{runtime}ms</span>}
            {memory && <span><i className="fa-solid fa-microchip mr-1" />{(memory / 1024).toFixed(1)} MB</span>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm leading-relaxed bg-[var(--bg)]">
        {tab === 'tests' && results && (
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <TestCaseBadge index={i} status={r.status} isHidden={r.isHidden} />
                {r.status === 'failed' && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Expected: <code className="text-[var(--text)]">{truncate(r.expected, 40)}</code>
                    , Got: <code className="text-[var(--text)]">{truncate(r.actual, 40)}</code>
                  </span>
                )}
                {r.runtime && <span className="text-[11px] text-[var(--text-muted)]">({r.runtime}ms)</span>}
              </div>
            ))}
            <div className="pt-2 text-sm font-semibold" style={{ color: results.every(r => r.status === 'passed') ? '#10b981' : '#ef4444' }}>
              {results.filter(r => r.status === 'passed').length} / {results.length} test cases passed
            </div>
          </div>
        )}

        {tab === 'output' && (
          <pre className="whitespace-pre-wrap text-[var(--text)]">{results?.find(r => r.status !== 'error')?.actual || 'No output'}</pre>
        )}

        {tab === 'error' && (
          <pre className="whitespace-pre-wrap text-red-500">{results?.find(r => r.status === 'error')?.actual || 'No errors'}</pre>
        )}

        {tab === 'compile' && (
          <pre className={`whitespace-pre-wrap ${compilationError ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
            {compilationError || 'Compilation successful'}
          </pre>
        )}

        {!results && !compilationError && tab !== 'compile' && (
          <div className="text-[var(--text-muted)] text-center py-8">
            <i className="fa-solid fa-play text-2xl mb-2" />
            <p>Run your code to see output here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
