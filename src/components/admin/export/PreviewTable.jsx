import { memo } from 'react';
import { extractFieldValue } from '../../../utils/exportUtils';

const thStyle = {
  textAlign: 'left',
  padding: '0.65rem 0.85rem',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  background: 'var(--surface)',
  zIndex: 1,
};

function PreviewTable({ registrations, columns, onToggleRow, selectedRows }) {
  if (columns.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: 10 }}>
        <i className="fas fa-columns" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }} />
        Select at least one column to preview.
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', border: '1px solid var(--border)', borderRadius: 10 }}>
        <i className="fas fa-inbox" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }} />
        No records match the current filters.
      </div>
    );
  }

  const previewRows = registrations.slice(0, 10);

  return (
    <div>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: columns.length > 5 ? 600 : '100%' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 40, textAlign: 'center' }}>
                <i className="fas fa-check-double" style={{ fontSize: '0.65rem' }} />
              </th>
              {columns.map(col => (
                <th key={col.key} style={thStyle}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map(reg => (
              <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                  <button
                    onClick={() => onToggleRow(reg.id)}
                    aria-label={`Select ${extractFieldValue(reg, 'fullName')}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: selectedRows.has(reg.id) ? 'var(--orange)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      padding: 2,
                    }}
                  >
                    <i className={`fas ${selectedRows.has(reg.id) ? 'fa-check-square' : 'fa-square'}`} />
                  </button>
                </td>
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '0.55rem 0.85rem', fontSize: '0.78rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                    {extractFieldValue(reg, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Showing {Math.min(registrations.length, 10)} of {registrations.length} records
        {registrations.length > 10 && ' (first 10 shown in preview)'}
      </div>
    </div>
  );
}

export default memo(PreviewTable);
