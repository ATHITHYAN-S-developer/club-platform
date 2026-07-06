import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { careerTree } from '../data/careersData';
import MindMap from '../components/careers/MindMap';
import '../styles/careers/careers.css';
import '../styles/careers/mindmap.css';

const ALL_DOMAINS = careerTree.children;

function getChildCount(node) {
  return node.children ? node.children.length : 0;
}

export default function Careers() {
  const [stack, setStack] = useState([]);
  const [direction, setDirection] = useState(1);

  const current = useMemo(() => {
    if (stack.length === 0) return { level: 0, node: null };
    if (stack.length === 1) return { level: 1, node: stack[0] };
    return { level: 2, node: stack[stack.length - 1] };
  }, [stack]);

  const push = useCallback(node => {
    setDirection(1);
    setStack(prev => [...prev, node]);
  }, []);

  const pop = useCallback(() => {
    setDirection(-1);
    setStack(prev => prev.slice(0, -1));
  }, []);

  const popTo = useCallback(idx => {
    setDirection(-1);
    setStack(prev => prev.slice(0, idx + 1));
  }, []);

  const breadcrumb = useMemo(() => {
    const items = [{ label: 'Home', idx: -1 }];
    stack.forEach((n, i) => items.push({ label: n.label, idx: i }));
    return items;
  }, [stack]);

  return (
    <div className="cr-page">
      {/* ── Breadcrumb ── */}
      <nav className="cr-breadcrumb">
        {stack.length > 0 && (
          <button className="cr-breadcrumb-back" onClick={pop} aria-label="Go back">
            <i className="fas fa-arrow-left" /> Back
          </button>
        )}
        {breadcrumb.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {i > 0 && <span className="cr-breadcrumb-sep"><i className="fas fa-chevron-right" /></span>}
            <button
              className={`cr-breadcrumb-link${item.idx === stack.length - 1 ? ' active' : ''}`}
              onClick={() => item.idx >= 0 && item.idx < stack.length - 1 ? popTo(item.idx) : null}
              disabled={item.idx === stack.length - 1}
              style={item.idx === -1 ? { cursor: 'default', color: 'inherit', fontWeight: 600 } : {}}
            >
              {item.label}
            </button>
          </span>
        ))}
      </nav>

      {/* ── Layer Content ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stack.length}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {current.level === 0 && <DomainLayer onSelect={push} />}
          {current.level === 1 && <SubCareerLayer domain={current.node} onSelect={push} />}
          {current.level >= 2 && <DetailLayer node={current.node} onSelect={push} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Layer 0: Domains ── */
function DomainLayer({ onSelect }) {
  return (
    <div className="cr-layer">
      <div className="cr-heading">
        <h1>Explore Your Future</h1>
        <p>Choose a domain to explore careers, skills, roadmaps, and resources.</p>
      </div>
      <div className="cr-domain-grid">
        {ALL_DOMAINS.map(d => (
          <button
            key={d.id}
            className="cr-domain-card"
            style={{ '--card-color': d.color }}
            onClick={() => onSelect(d)}
          >
            <div className="cr-domain-card-icon" style={{ background: d.color + '15', color: d.color }}>
              <i className={`fas ${d.icon}`} />
            </div>
            <h3 className="cr-domain-card-title">{d.label}</h3>
            <p className="cr-domain-card-desc">{d.details?.overview}</p>
            <span className="cr-domain-card-count">
              <i className="fas fa-diagram-project" style={{ marginRight: '0.25rem', fontSize: '0.6rem' }} />
              {getChildCount(d)} paths
            </span>
            <span className="cr-domain-card-arrow"><i className="fas fa-arrow-right" /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Layer 1: Sub-careers ── */
function SubCareerLayer({ domain, onSelect }) {
  const children = domain.children || [];
  return (
    <div className="cr-layer">
      <div className="cr-sub-header">
        <h2><i className={`fas ${domain.icon}`} style={{ color: domain.color, marginRight: '0.45rem' }} /> {domain.label}</h2>
        <p>{domain.details?.overview}</p>
      </div>
      <div className="cr-sub-grid">
        {children.map(c => {
          const d = c.details;
          const isCareer = d?.type === 'career';
          const hasChildren = c.children && c.children.length > 0;
          return (
            <button key={c.id} className="cr-sub-card" onClick={() => onSelect(c)}>
              <div className="cr-sub-card-top">
                <div className="cr-sub-card-icon" style={{ background: c.color + '15', color: c.color }}>
                  <i className={`fas ${c.icon}`} />
                </div>
                <span className="cr-sub-card-name">{c.label}</span>
                {isCareer && d?.difficulty && (
                  <span className={`cr-sub-card-diff ${d.difficulty === 'Advanced' ? 'cr-diff-adv' : d.difficulty === 'Intermediate' ? 'cr-diff-int' : 'cr-diff-beg'}`}>
                    {d.difficulty === 'Advanced' ? 'Adv' : d.difficulty === 'Intermediate' ? 'Int' : 'Beg'}
                  </span>
                )}
              </div>
              <p className="cr-sub-card-desc">{d?.overview || d?.what}</p>
              <div className="cr-sub-card-bottom">
                {isCareer ? 'View Mind Map' : 'Learn More'}
                {hasChildren && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.65rem' }}>({c.children.length} sub-topics)</span>}
                <i className="fas fa-arrow-right" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Layer 2+: Mind Map ── */
function DetailLayer({ node, onSelect }) {
  const children = node.children || [];
  const d = node.details;
  const isCareer = d?.type === 'career';

  return (
    <div className="cr-layer">
      {/* if career, show domain tag */}
      <MindMap node={node} onSelect={onSelect} />

      {/* ── Drill deeper if children exist ── */}
      {children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0 1rem 2.5rem' }}>
          <span className="cm-children-label">
            {isCareer ? 'Specialize further' : 'Explore'} — {children.length} sub-topic{children.length > 1 ? 's' : ''}
          </span>
          <div className="cm-children">
            {children.map(c => (
              <button key={c.id} className="cm-child-btn" onClick={() => onSelect(c)}>
                <i className={`fas ${c.icon}`} style={{ color: c.color }} />
                {c.label}
                <i className="fas fa-chevron-right" style={{ fontSize: '0.6rem', opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
