import React from 'react';
import { motion } from 'framer-motion';

export default function FullScreenGate({ onFullscreen, isLoading }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fullscreen-gate"
    >
      <div className="fullscreen-gate-card">
        <div className="fullscreen-gate-icon">
          <i className="fas fa-expand"></i>
        </div>
        <h2>Fullscreen Mode Required</h2>
        <p>Fullscreen mode is required to take this assessment. This ensures academic integrity and prevents distractions.</p>
        <button 
          className="btn btn-primary" 
          onClick={onFullscreen}
          disabled={isLoading}
        >
          {isLoading ? (
            <><span className="loading-spinner" style={{ width: 18, height: 18, margin: 0 }}></span> Requesting...</>
          ) : (
            <><i className="fas fa-expand"></i> Enter Fullscreen</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
