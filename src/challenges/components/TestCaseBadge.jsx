export default function TestCaseBadge({ index, status, isHidden }) {
  const config = {
    passed: { icon: 'fa-check', color: '#10b981', bg: '#d1fae5', label: 'Passed' },
    failed: { icon: 'fa-xmark', color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
    pending: { icon: 'fa-clock', color: '#f59e0b', bg: '#fef3c7', label: 'Running...' },
    waiting: { icon: 'fa-circle', color: '#9ca3af', bg: '#f3f4f6', label: 'Waiting' },
  };

  const c = config[status] || config.waiting;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
      style={{ background: c.bg, color: c.color }}
      title={`${isHidden ? 'Hidden Test' : 'Sample Test'} #${index + 1}: ${c.label}`}
    >
      <i className={`fa-solid ${c.icon} text-[10px]`} />
      <span>{isHidden ? 'H' : 'S'}{index + 1}</span>
    </div>
  );
}
