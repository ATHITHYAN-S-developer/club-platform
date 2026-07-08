export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--orange)]/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" style={{ backgroundSize: '200% 100%' }} />
      <div className="space-y-4 relative z-10">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-lg bg-[var(--surface-2)]" />
          <div className="h-5 w-14 rounded-lg bg-[var(--surface-2)]" />
        </div>
        <div className="h-5 w-3/4 rounded-lg bg-[var(--surface-2)]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[var(--surface-2)]" />
          <div className="h-3 w-5/6 rounded bg-[var(--surface-2)]" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-14 rounded-md bg-[var(--surface-2)]" />
          <div className="h-5 w-16 rounded-md bg-[var(--surface-2)]" />
        </div>
        <div className="h-px bg-[var(--border-light)]" />
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-[var(--surface-2)]" />
          <div className="h-4 w-16 rounded bg-[var(--surface-2)]" />
        </div>
      </div>
    </div>
  );
}
