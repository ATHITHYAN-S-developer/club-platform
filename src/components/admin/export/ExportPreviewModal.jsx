import { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../../ui/Modal';
import { deduplicateById, getExportColumns, sortRegistrations, buildExportData, triggerCSVDownload, triggerXLSXDownload, PRESETS } from '../../../utils/exportUtils';
import ExportSummary from './ExportSummary';
import FilterSummary from './FilterSummary';
import ExportPresetSelector from './ExportPresetSelector';
import FormatToggle from './FormatToggle';
import ColumnSelector from './ColumnSelector';
import PreviewTable from './PreviewTable';
import DuplicateViewerModal from './DuplicateViewerModal';
import ExportFooter from './ExportFooter';

const sortBtnBase = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '0.25rem 0.55rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: 'var(--text-secondary)',
  transition: 'all 0.15s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.2rem',
};

export default function ExportPreviewModal({ isOpen, onClose, registrations, filteredRegistrations, announcement, activeFilters, user }) {
  const [format, setFormat] = useState('csv');
  const [selectedColumns, setSelectedColumns] = useState(() => new Set());
  const [selectedRows, setSelectedRows] = useState(() => new Set());
  const [sortField, setSortField] = useState('registeredAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activePreset, setActivePreset] = useState('complete');
  const [exporting, setExporting] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');

  const allColumns = useMemo(() => getExportColumns(announcement?.formFields), [announcement?.formFields]);

  const { unique: deduplicated, duplicates } = useMemo(
    () => deduplicateById(filteredRegistrations || []),
    [filteredRegistrations]
  );

  const sortedRegistrations = useMemo(
    () => sortRegistrations(deduplicated, { field: sortField, direction: sortDirection }),
    [deduplicated, sortField, sortDirection]
  );

  const displayRows = useMemo(() => {
    if (selectedRows.size === 0) return sortedRegistrations;
    return sortedRegistrations.filter(r => selectedRows.has(r.id));
  }, [sortedRegistrations, selectedRows]);

  useEffect(() => {
    if (isOpen && allColumns.length > 0) {
      setSelectedColumns(new Set(allColumns.map(c => c.key)));
      setSelectedRows(new Set());
      setSortField('registeredAt');
      setSortDirection('desc');
      setActivePreset('complete');
      setFormat('csv');
      setColumnSearch('');
    }
  }, [isOpen, allColumns.length]);

  const handlePresetChange = useCallback((presetKey) => {
    setActivePreset(presetKey);
    const cols = PRESETS[presetKey].getColumns(announcement?.formFields);
    if (cols) setSelectedColumns(cols);
  }, [announcement?.formFields]);

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const handleToggleColumn = useCallback((key) => {
    setSelectedColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
    setActivePreset('custom');
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    setSelectedColumns(new Set(allColumns.map(c => c.key)));
    setActivePreset('complete');
  }, [allColumns]);

  const handleDeselectAllColumns = useCallback(() => {
    setSelectedColumns(new Set());
    setActivePreset('custom');
  }, []);

  const handleToggleRow = useCallback((id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAllRows = useCallback(() => {
    setSelectedRows(new Set(deduplicated.map(r => r.id)));
  }, [deduplicated]);

  const handleClearRowSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const handleDownload = useCallback(async () => {
    if (selectedColumns.size === 0) return;
    setExporting(true);
    try {
      const { headerRows, colHeaders, dataRows, footerRows } = buildExportData(
        displayRows, announcement?.formFields, selectedColumns,
        { field: sortField, direction: sortDirection },
        announcement, user, activeFilters
      );
      const filename = `${(announcement?.title || 'export').toLowerCase().replace(/\s+/g, '_')}_registrations`;
      if (format === 'csv') {
        triggerCSVDownload(headerRows, colHeaders, dataRows, footerRows, filename + '.csv');
      } else {
        await triggerXLSXDownload(headerRows, colHeaders, dataRows, footerRows, filename + '.xlsx');
      }
      window.showToast('Downloaded', 'Export completed successfully.', 'success');
    } catch (err) {
      window.showToast('Export Failed', err.message || 'Something went wrong.', 'error');
    } finally {
      setExporting(false);
    }
  }, [displayRows, announcement, selectedColumns, sortField, sortDirection, format, user, activeFilters]);

  const selectedColDefs = useMemo(
    () => allColumns.filter(c => selectedColumns.has(c.key)),
    [allColumns, selectedColumns]
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Export Preview"
        size="xl"
        footer={
          <ExportFooter
            count={displayRows.length}
            totalCount={deduplicated.length}
            onCancel={onClose}
            onDownload={handleDownload}
            disabled={selectedColumns.size === 0}
            exporting={exporting}
          />
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Event Info */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
            <span><i className="fa-regular fa-calendar" /> {new Date(announcement?.date).toLocaleDateString()}</span>
            {announcement?.venue && <span><i className="fas fa-location-dot" /> {announcement.venue}</span>}
            <span><i className="fa-regular fa-clock" /> Generated {new Date().toLocaleTimeString()}</span>
          </div>

          {/* Summary Cards */}
          <ExportSummary
            totalRegistrations={registrations?.length || 0}
            filteredRecords={filteredRegistrations?.length || 0}
            duplicatesRemoved={duplicates.length}
            selectedRows={selectedRows.size || deduplicated.length}
            finalExportCount={displayRows.length}
            generatedBy={user?.name || 'Admin'}
          />

          {/* Filter Summary */}
          <FilterSummary filters={activeFilters} />

          {/* Preset Selector */}
          <ExportPresetSelector active={activePreset} onChange={handlePresetChange} />

          {/* Format Toggle + Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <FormatToggle value={format} onChange={setFormat} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
              {[
                { key: 'registeredAt', label: 'Date' },
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSort(s.key)}
                  aria-label={`Sort by ${s.label}`}
                  style={{
                    ...sortBtnBase,
                    background: sortField === s.key ? 'rgba(255,85,0,0.1)' : 'var(--surface)',
                    color: sortField === s.key ? 'var(--orange)' : 'var(--text-secondary)',
                    borderColor: sortField === s.key ? 'var(--orange)' : 'var(--border)',
                  }}
                >
                  {s.label}
                  {sortField === s.key && (
                    <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`} style={{ fontSize: '0.6rem' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Column Selector */}
          <ColumnSelector
            columns={allColumns}
            selected={selectedColumns}
            search={columnSearch}
            onSearchChange={setColumnSearch}
            onToggle={handleToggleColumn}
            onSelectAll={handleSelectAllColumns}
            onDeselectAll={handleDeselectAllColumns}
          />

          {/* Duplicate badge */}
          {duplicates.length > 0 && (
            <button
              onClick={() => setShowDuplicates(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8,
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 650,
                color: '#ef4444',
                cursor: 'pointer',
                fontFamily: 'inherit',
                alignSelf: 'flex-start',
              }}
              aria-label={`View ${duplicates.length} duplicate records`}
            >
              <i className="fas fa-copy" />
              {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} found — View Details
            </button>
          )}

          {/* Row selection controls */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              {selectedRows.size > 0
                ? `${selectedRows.size} of ${deduplicated.length} selected`
                : `${deduplicated.length} records`}
            </span>
            <button
              onClick={handleSelectAllRows}
              aria-label="Select all rows"
              style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Select All
            </button>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button
              onClick={handleClearRowSelection}
              aria-label="Clear row selection"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 650, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Clear
            </button>
          </div>

          {/* Preview Table */}
          <PreviewTable
            registrations={displayRows}
            columns={selectedColDefs}
            onToggleRow={handleToggleRow}
            selectedRows={selectedRows}
          />
        </div>
      </Modal>

      <DuplicateViewerModal
        isOpen={showDuplicates}
        onClose={() => setShowDuplicates(false)}
        duplicates={duplicates}
      />
    </>
  );
}
