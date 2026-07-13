import { memo } from 'react';
import Modal from '../../ui/Modal';

function DuplicateViewerModal({ isOpen, onClose, duplicates }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Records" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {duplicates.length} duplicate registration{duplicates.length !== 1 ? 's' : ''} detected and removed from the export.
        </p>
        {duplicates.map(({ duplicate, original }, i) => (
          <div key={duplicate.id + '_' + original.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                {duplicate.submittedData?.fullName || 'Unknown Student'}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--card)', padding: '0.15rem 0.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                #{i + 1}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Registration ID:</span>{' '}
                <code style={{ fontSize: '0.72rem', background: 'var(--card)', padding: '0.1rem 0.35rem', borderRadius: 4, border: '1px solid var(--border)' }}>{duplicate.id}</code>
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>Original Record:</span>{' '}
                <code style={{ fontSize: '0.72rem', background: 'var(--card)', padding: '0.1rem 0.35rem', borderRadius: 4, border: '1px solid var(--border)' }}>{original.id}</code>
                {' '}({original.submittedData?.fullName || original.userEmail})
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>Reason:</span> Same Registration ID
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default memo(DuplicateViewerModal);
