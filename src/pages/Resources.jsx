import { useState, useRef, useEffect } from 'react';
import reposData from '../data/repoLinksData.json';

const MARQUEE_ITEMS = [
  'Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'Keras',
  'NLP', 'Statistics', 'Power BI', 'Tableau', 'MySQL', 'MongoDB',
  'Streamlit', 'Excel', 'VBA',
  'Classification', 'Regression', 'Clustering', 'SVM',
  'Random Forest', 'XGBoost', 'KNN', 'PCA', 'SVD',
  'Reinforcement Learning', 'Apriori', 'Flask',
];

const REPO_CATEGORIES = [
  'All', 'Python', 'Deep Learning', 'Power BI',
  'Tableau', 'SQL', 'Statistics', 'NLP', 'Excel',
  'Dashboard', 'Streamlit',
  'Classification', 'Regression', 'Clustering',
  'Association Rules', 'Recommendation', 'Model Validation',
  'Web App', 'Reinforcement Learning'
];

export default function Resources() {
  const [repoSearch, setRepoSearch] = useState('');
  const [activeRepoCat, setActiveRepoCat] = useState('All');
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHeroVisible(true); obs.disconnect(); }
    }, { threshold: 0.05 });
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  // Filter repos
  const filteredRepos = reposData.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.shortDescription.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.technologies.some(t => t.toLowerCase().includes(repoSearch.toLowerCase()));
    const matchCategory = activeRepoCat === 'All' ||
      r.category.toLowerCase() === activeRepoCat.toLowerCase() ||
      r.technologies.some(t => t.toLowerCase() === activeRepoCat.toLowerCase());
    return matchSearch && matchCategory;
  });

  const reveal = (vis) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'none' : 'translateY(40px)',
    transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)`,
  });

  return (
    <div style={{ background: '#ffffff', color: '#0f1117', minHeight: '100vh', overflowX: 'hidden', position: 'relative', margin: '-2.5rem -3.5rem', padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .sphere {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffaa66 0%, var(--orange) 60%, var(--orange-dark) 100%);
          box-shadow: inset -12px -12px 30px rgba(0, 0, 0, 0.35),
                      inset 8px 8px 20px rgba(255, 255, 255, 0.25),
                      0 25px 50px rgba(204, 68, 0, 0.2);
          z-index: 0;
          pointer-events: none;
        }
        .sphere-tr {
          top: -40px; right: -40px;
          width: clamp(120px, 18vw, 260px);
          height: clamp(120px, 18vw, 260px);
          animation: float-tr 12s ease-in-out infinite;
        }
        .sphere-br {
          bottom: 60px; right: 3%;
          width: clamp(80px, 10vw, 150px);
          height: clamp(80px, 10vw, 150px);
          animation: float-br 10s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .sphere-bl {
          bottom: -50px; left: -40px;
          width: clamp(100px, 14vw, 200px);
          height: clamp(100px, 14vw, 200px);
          animation: float-bl 11s ease-in-out infinite;
          animation-delay: 3s;
        }
        @keyframes float-tr {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-10px, 15px) rotate(3deg); }
        }
        @keyframes float-br {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, -10px) rotate(-3deg); }
        }
        @keyframes float-bl {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -15px) rotate(2deg); }
        }
        .rs-hero-section {
          position: relative;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 7rem 3.5rem 4rem 3.5rem;
          overflow: hidden;
          background: #ffffff;
        }
        .shard-tl {
          position: absolute; top: 0; left: 0;
          width: 320px; height: 320px;
          background: linear-gradient(135deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(0 0, 100% 0, 0 100%);
          z-index: 0;
        }
        .shard-br {
          position: absolute; bottom: 0; right: 0;
          width: 450px; height: 450px;
          background: linear-gradient(315deg, var(--orange) 0%, var(--orange-light) 100%);
          clip-path: polygon(100% 100%, 100% 0, 0 100%);
          z-index: 0;
        }
        .rs-search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.6rem;
          border-radius: 10px;
          background: #f8f9fa;
          border: 1px solid #e5e7eb;
          color: #0f1117;
          outline: none;
          transition: all 0.3s ease;
          font-size: 0.88rem;
        }
        .rs-search-input:focus {
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(255, 85, 0, 0.1);
        }
        .rs-pill {
          padding: 0.4rem 0.85rem;
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .rs-pill:hover {
          background: rgba(255, 85, 0, 0.08);
          border-color: rgba(255, 85, 0, 0.2);
          color: var(--orange);
        }
        .rs-pill.active {
          background: var(--orange);
          border-color: var(--orange);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(255, 85, 0, 0.3);
        }
        .rs-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.25rem;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .rs-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, var(--orange), var(--orange-light));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }
        .rs-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(255, 85, 0, 0.1);
          border-color: rgba(255, 85, 0, 0.15);
        }
        .rs-card:hover::before {
          transform: scaleX(1);
        }
        .rs-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: 50px;
          font-size: 0.65rem;
          font-weight: 600;
          background: rgba(255, 85, 0, 0.06);
          border: 1px solid rgba(255, 85, 0, 0.12);
          color: var(--orange);
        }
        .rs-tech-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.12rem 0.45rem;
          border-radius: 50px;
          font-size: 0.65rem;
          font-weight: 500;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #6b7280;
        }
        .rs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-top: 1.25rem;
        }
        .rs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.5rem 1.1rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
        }
        .rs-btn-primary {
          background: var(--orange);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(255, 85, 0, 0.3);
        }
        .rs-btn-primary:hover {
          background: var(--orange-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 85, 0, 0.4);
        }
        .rs-btn-outline {
          background: transparent;
          color: #0f1117;
          border: 1px solid #e5e7eb;
        }
        .rs-btn-outline:hover {
          background: #f9fafb;
          border-color: var(--orange);
          color: var(--orange);
        }
        .rs-section-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        @media (max-width: 900px) {
          .rs-hero-section { padding: 6rem 1.5rem 3rem 1.5rem !important; }
          .rs-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }
        @media (max-width: 600px) {
          .rs-hero-section { padding: 5rem 1.2rem 2.5rem 1.2rem !important; min-height: auto !important; }
          .shard-tl { width: 180px !important; height: 180px !important; }
          .shard-br { width: 220px !important; height: 220px !important; }
          .rs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="rs-hero-section">
        <div className="shard-tl" />
        <div className="shard-br" />
        <div className="sphere sphere-tr" />
        <div className="sphere sphere-br" />
        <div className="sphere sphere-bl" />

        <div ref={heroRef} style={{
          maxWidth: '1000px', width: '100%', textAlign: 'center',
          position: 'relative', zIndex: 1, ...reveal(heroVisible)
        }}>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: '2.4rem', color: 'var(--orange)',
            margin: '0 0 0.2rem 0', lineHeight: 1.1,
            textShadow: '0 0 15px rgba(255, 85, 0, 0.15)',
          }}>
            <span style={{ fontSize: '8.6rem' }}>E</span>
            <span style={{ fontSize: '2.4rem' }}>xplore Our</span>
          </p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontStyle: 'italic', textTransform: 'uppercase',
            letterSpacing: '0.02em', margin: '0 0 0.8rem 0',
            lineHeight: 1.05, color: '#0f1117',
          }}>
            Resources & Repositories
          </h1>
          <p style={{
            fontSize: '1.02rem', color: 'var(--text-secondary)',
            lineHeight: 1.8, marginBottom: '1.75rem',
            maxWidth: '640px', margin: '0 auto 1.75rem',
          }}>
            Access our complete collection of QuantMind repositories and curated learning materials including slide decks, code repos, and video recordings.
          </p>
        </div>
      </section>

      {/* ── REPOSITORIES SECTION ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem', position: 'relative', zIndex: 2 }}>
        <div className="rs-section-header">
          <span className="rs-badge" style={{ fontSize: '0.75rem', padding: '0.3rem 0.85rem', marginBottom: '0.75rem' }}>
            <i className="fa-brands fa-github" style={{ marginRight: '0.35rem' }}></i> Open Source
          </span>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--orange)', marginBottom: '0.5rem', fontWeight: 700 }}>
            QuantMind
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>
            {reposData.length} hands-on GitHub repositories covering machine learning, deep learning, statistics, visualization, databases, and more.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }}></i>
            <input type="text" value={repoSearch} onChange={e => setRepoSearch(e.target.value)}
              placeholder="Search repositories..." className="rs-search-input" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none', marginBottom: '0.5rem' }}>
          {REPO_CATEGORIES.map(cat => (
            <button key={cat} className={`rs-pill ${activeRepoCat === cat ? 'active' : ''}`}
              onClick={() => setActiveRepoCat(cat)}>{cat}</button>
          ))}
        </div>

        {/* Repo Cards */}
        {filteredRepos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#6b7280' }}>
            <i className="fa-solid fa-ban" style={{ fontSize: '2.5rem', color: '#d1d5db', marginBottom: '0.75rem' }}></i>
            <h3 style={{ color: '#0f1117', marginBottom: '0.25rem', fontSize: '1.1rem' }}>No Repositories Found</h3>
            <p style={{ fontSize: '0.88rem' }}>Try a different search term or category filter.</p>
          </div>
        ) : (
          <div className="rs-grid">
            {filteredRepos.map(r => (
              <div key={r.id} className="rs-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span className="rs-badge"><i className="fa-solid fa-tag" style={{ marginRight: '0.25rem', fontSize: '0.55rem' }}></i>{r.category}</span>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}><i className="fa-regular fa-circle-play"></i> Beginner</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f1117', lineHeight: 1.3 }}>{r.title}</h3>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '1rem', flex: 1, color: '#6b7280' }}>{r.shortDescription}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {r.technologies.map(tech => (
                    <span key={tech} className="rs-tech-badge">{tech}</span>
                  ))}
                </div>
                <a href={r.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="rs-btn rs-btn-primary" style={{ width: '100%' }}>
                  <i className="fa-brands fa-github"></i> View on GitHub <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem' }}></i>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div style={{
        overflow: 'hidden', padding: '1.25rem 0',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
        background: 'rgba(255, 85, 0, 0.02)',
      }}>
        <div style={{ display: 'flex', gap: '3.5rem', animation: 'marquee-ltr 30s linear infinite', width: 'max-content' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: '0.45rem'
            }}>
              <span style={{ color: 'var(--orange)' }}>▸</span> {item}
              <span style={{ color: 'var(--orange)', opacity: 0.6 }}>•</span>
            </span>
          ))}
        </div>
      </div>


    </div>
  );
}
