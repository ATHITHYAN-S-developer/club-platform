import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 animate-pulse relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-300 dark:bg-slate-700" />
      <div className="flex items-center justify-between pl-1">
        <div className="flex gap-2">
          <div className="w-14 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="w-16 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="w-12 h-5 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg pl-1" />
      <div className="space-y-2 pl-1">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="flex gap-1.5 pl-1">
        <div className="w-10 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="pt-4 border-t border-[var(--border-light)] flex justify-between items-center pl-1">
        <div className="flex gap-3">
          <div className="w-14 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="w-14 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
