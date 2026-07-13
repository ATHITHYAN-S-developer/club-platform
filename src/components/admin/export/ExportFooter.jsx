import { memo } from 'react';
import Button from '../../ui/Button';

function ExportFooter({ count, totalCount, onCancel, onDownload, disabled, exporting }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', width: '100%' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
        {count} of {totalCount} record{totalCount !== 1 ? 's' : ''} will be exported
      </span>
      <Button variant="secondary" size="md" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="md"
        icon="fa-download"
        disabled={disabled || exporting}
        loading={exporting}
        onClick={onDownload}
      >
        Download{count > 0 ? ` (${count})` : ''}
      </Button>
    </div>
  );
}

export default memo(ExportFooter);
