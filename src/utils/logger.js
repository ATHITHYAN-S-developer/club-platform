/**
 * Central Logger Utility for Mindcraft AI Platform
 * Provides structured logging, timestamping, local log history buffering, and file export.
 */

const LOG_STORAGE_KEY = 'mindcraft_system_logs';
const MAX_LOG_ENTRIES = 500;

class Logger {
  constructor() {
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      const data = localStorage.getItem(LOG_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLogs() {
    try {
      if (this.logs.length > MAX_LOG_ENTRIES) {
        this.logs = this.logs.slice(-MAX_LOG_ENTRIES);
      }
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch { /* ignore storage quota errors */ }
  }

  formatLog(level, message, details = null) {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    };
  }

  log(level, message, details) {
    const entry = this.formatLog(level, message, details);
    this.logs.push(entry);
    this.saveLogs();

    const styles = {
      INFO: 'color: #3b82f6; font-weight: bold;',
      WARN: 'color: #f59e0b; font-weight: bold;',
      ERROR: 'color: #ef4444; font-weight: bold;',
      DEBUG: 'color: #8b5cf6; font-weight: bold;'
    };

    const prefix = `%c[${entry.timestamp}] [${entry.level}]`;
    const style = styles[entry.level] || 'color: #6b7280;';

    if (entry.level === 'ERROR') {
      console.error(prefix, style, message, details || '');
    } else if (entry.level === 'WARN') {
      console.warn(prefix, style, message, details || '');
    } else {
      console.log(prefix, style, message, details || '');
    }

    return entry;
  }

  info(message, details) {
    return this.log('INFO', message, details);
  }

  warn(message, details) {
    return this.log('WARN', message, details);
  }

  error(message, details) {
    return this.log('ERROR', message, details);
  }

  debug(message, details) {
    return this.log('DEBUG', message, details);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
    } catch { /* ignore */ }
    return true;
  }

  exportLogs() {
    const jsonString = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindcraft_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger();
export default logger;
