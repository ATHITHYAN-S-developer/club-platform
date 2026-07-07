import { memo } from 'react';

const colorMap = {
  green: { bg: '#dcfce7', text: '#15803d' },
  orange: { bg: '#ffedd5', text: '#c2410c' },
  red: { bg: '#fee2e2', text: '#dc2626' },
  blue: { bg: '#dbeafe', text: '#1d4ed8' },
  grey: { bg: '#f3f4f6', text: '#6b7280' },
  yellow: { bg: '#fef9c3', text: '#92400e' },
};

function Badge({ color = 'grey', children, icon, style }) {
  const c = colorMap[color] || colorMap.grey;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: c.bg, color: c.text,
      padding: '2px 10px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 700,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <i className={`fas fa-${icon}`} style={{ fontSize: '0.65rem' }} />}
      {children}
    </span>
  );
}

export default memo(Badge);
