import { memo } from 'react';

const CareerMindMap = memo(function CareerMindMap({ node, onSelect }) {
  const d = node.details;
  const isTech = d?.type === 'tech';

  if (isTech) {
    return <TechMindMap node={node} d={d} />;
  }

  return (
    <div className="cm-mindmap">
      {/* ── Row 0: Skills (top) ── */}
      {d?.skills?.length > 0 && (
        <div className="cm-branch cm-branch-top">
          <div className="cm-branch-head">
            <i className="fas fa-list-check" /> Skills
          </div>
          <div className="cm-branch-tags">
            {d.skills.map(s => <span key={s} className="cm-tag">{s}</span>)}
          </div>
        </div>
      )}

      {/* ── Row 1: Languages ● Tools ── */}
      <div className="cm-row cm-row-flank">
        <div className="cm-branch cm-branch-left">
          {d?.languages?.length > 0 && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-code" /> Languages
              </div>
              <div className="cm-branch-tags">
                {d.languages.map(s => <span key={s} className="cm-tag cm-tag-lang">{s}</span>)}
              </div>
            </>
          )}
        </div>

        <div className="cm-hub">●</div>

        <div className="cm-branch cm-branch-right">
          {d?.tools?.length > 0 && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-screwdriver-wrench" /> Tools
              </div>
              <div className="cm-branch-tags">
                {d.tools.map(s => <span key={s} className="cm-tag cm-tag-tool">{s}</span>)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Central Career Card ── */}
      <div className="cm-center-wrap">
        <div className="cm-center-card" style={{ borderColor: node.color }}>
          <div className="cm-center-icon" style={{ background: node.color + '18', color: node.color }}>
            <i className={`fas ${node.icon}`} />
          </div>
          <h2 className="cm-center-label">{node.label}</h2>
          {d?.overview && <p className="cm-center-desc">{d.overview}</p>}
          {d?.whyChoose && <p className="cm-center-why">{d.whyChoose}</p>}
        </div>
      </div>

      {/* ── Row 3: Projects ● Roadmap ── */}
      <div className="cm-row cm-row-flank">
        <div className="cm-branch cm-branch-left">
          {d?.projects?.length > 0 && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-flask" /> Projects
              </div>
              <div className="cm-branch-tags">
                {d.projects.map(s => <span key={s} className="cm-tag cm-tag-project">{s}</span>)}
              </div>
            </>
          )}
        </div>

        <div className="cm-hub">●</div>

        <div className="cm-branch cm-branch-right">
          {d?.roadmap && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-road" /> Roadmap
              </div>
              <div className="cm-rm-container">
                {(() => {
                  const colors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
                  const labels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
                  let step = 0;
                  return ['beginner', 'intermediate', 'advanced'].map((level, li) => {
                    const items = d.roadmap[level];
                    if (!items || items.length === 0) return null;
                    const color = colors[level];
                    return (
                      <div key={level} className="cm-rm-level" style={{ '--rm-color': color }}>
                        <div className="cm-rm-level-header" style={{ color }}>
                          <span className="cm-rm-dot" style={{ background: color, borderColor: color }} />
                          <span className="cm-rm-level-name">{labels[level]}</span>
                        </div>
                        <div className="cm-rm-items">
                          {items.map((item, i) => {
                            step++;
                            return (
                              <div key={i} className="cm-rm-item" style={{ '--rm-delay': `${step * 0.035}s` }}>
                                <span className="cm-rm-num" style={{ background: color + '1a', color, borderColor: color }}>
                                  {String(step).padStart(2, '0')}
                                </span>
                                <span className="cm-rm-text">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 4: Career Info (center) ── */}
      <div className="cm-center-info">
        {d?.salary && (
          <div className="cm-info-card" style={{ borderLeftColor: '#22c55e' }}>
            <i className="fas fa-dollar-sign" style={{ color: '#22c55e' }} />
            <div>
              <span className="cm-info-label">Salary Range</span>
              <span className="cm-info-val">{d.salary}</span>
            </div>
          </div>
        )}
        {d?.difficulty && (
          <div className="cm-info-card" style={{ borderLeftColor: '#f59e0b' }}>
            <i className="fas fa-signal" style={{ color: '#f59e0b' }} />
            <div>
              <span className="cm-info-label">Difficulty</span>
              <span className="cm-info-val">{d.difficulty}</span>
            </div>
          </div>
        )}
        {d?.duration && (
          <div className="cm-info-card" style={{ borderLeftColor: '#06b6d4' }}>
            <i className="fas fa-clock" style={{ color: '#06b6d4' }} />
            <div>
              <span className="cm-info-label">Duration</span>
              <span className="cm-info-val">{d.duration}</span>
            </div>
          </div>
        )}
        {d?.jobRoles?.length > 0 && (
          <div className="cm-info-card" style={{ borderLeftColor: '#8b5cf6' }}>
            <i className="fas fa-user-tie" style={{ color: '#8b5cf6' }} />
            <div>
              <span className="cm-info-label">Job Roles</span>
              <span className="cm-info-val">{d.jobRoles.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Row 5: Resources ● Companies ── */}
      <div className="cm-row cm-row-flank">
        <div className="cm-branch cm-branch-left">
          {d?.resources?.length > 0 && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-graduation-cap" /> Resources
              </div>
              <div className="cm-resource-list">
                {d.resources.slice(0, 4).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="cm-res-link">
                    <i className={`fas ${r.type === 'course' ? 'fa-video' : r.type === 'docs' ? 'fa-file-lines' : 'fa-book'}`} />
                    {r.name}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="cm-hub">●</div>

        <div className="cm-branch cm-branch-right">
          {d?.companies?.length > 0 && (
            <>
              <div className="cm-branch-head">
                <i className="fas fa-building" /> Companies
              </div>
              <div className="cm-branch-tags">
                {d.companies.map(s => <span key={s} className="cm-tag cm-tag-company">{s}</span>)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 6: Certifications (bottom) ── */}
      {d?.certifications?.length > 0 && (
        <div className="cm-branch cm-branch-bottom">
          <div className="cm-branch-head">
            <i className="fas fa-certificate" /> Certifications
          </div>
          <div className="cm-branch-tags">
            {d.certifications.map(s => <span key={s} className="cm-tag cm-tag-cert">{s}</span>)}
          </div>
        </div>
      )}

      {/* ── Future Scope ── */}
      {d?.futureScope && (
        <div className="cm-future">
          <i className="fas fa-rocket" style={{ color: 'var(--orange)' }} />
          <span>{d.futureScope}</span>
        </div>
      )}
    </div>
  );
});

function TechMindMap({ node, d }) {
  return (
    <div className="cm-mindmap cm-mindmap-tech">
      {/* ── Row 0: Central Tech Card ── */}
      <div className="cm-center-wrap">
        <div className="cm-center-card" style={{ borderColor: node.color }}>
          <div className="cm-center-icon" style={{ background: node.color + '18', color: node.color }}>
            <i className={`fas ${node.icon}`} />
          </div>
          <h2 className="cm-center-label">{node.label}</h2>
          <p className="cm-center-desc">{d.what}</p>
        </div>
      </div>

      {/* ── Row 1: Prerequisites ● Why ── */}
      <div className="cm-row cm-row-flank">
        <div className="cm-branch cm-branch-left">
          {d?.prerequisites?.length > 0 && (
            <>
              <div className="cm-branch-head"><i className="fas fa-clipboard-list" /> Prerequisites</div>
              <div className="cm-branch-tags">
                {d.prerequisites.map(s => <span key={s} className="cm-tag">{s}</span>)}
              </div>
            </>
          )}
        </div>
        <div className="cm-hub">●</div>
        <div className="cm-branch cm-branch-right">
          {d?.why && (
            <>
              <div className="cm-branch-head"><i className="fas fa-question-circle" /> Why?</div>
              <p className="cm-why-text">{d.why}</p>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Concepts (full width) ── */}
      {d?.concepts?.length > 0 && (
        <div className="cm-branch cm-branch-full">
          <div className="cm-branch-head"><i className="fas fa-lightbulb" /> Key Concepts</div>
          <div className="cm-branch-tags">
            {d.concepts.map(s => <span key={s} className="cm-tag">{s}</span>)}
          </div>
        </div>
      )}

      {/* ── Row 3: Projects ● Resources ── */}
      <div className="cm-row cm-row-flank">
        <div className="cm-branch cm-branch-left">
          {d?.projects?.length > 0 && (
            <>
              <div className="cm-branch-head"><i className="fas fa-flask" /> Projects</div>
              <div className="cm-branch-tags">
                {d.projects.map(s => <span key={s} className="cm-tag cm-tag-project">{s}</span>)}
              </div>
            </>
          )}
        </div>
        <div className="cm-hub">●</div>
        <div className="cm-branch cm-branch-right">
          {d?.resources?.length > 0 && (
            <>
              <div className="cm-branch-head"><i className="fas fa-graduation-cap" /> Resources</div>
              <div className="cm-resource-list">
                {d.resources.slice(0, 3).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="cm-res-link">
                    <i className={`fas ${r.type === 'course' ? 'fa-video' : 'fa-file-lines'}`} />
                    {r.name}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 4: Learning Time + Docs ── */}
      {(d?.learningTime || d?.docs) && (
        <div className="cm-center-info">
          {d.learningTime && (
            <div className="cm-info-card" style={{ borderLeftColor: '#22c55e' }}>
              <i className="fas fa-clock" style={{ color: '#22c55e' }} />
              <div>
                <span className="cm-info-label">Est. Learning Time</span>
                <span className="cm-info-val">{d.learningTime}</span>
              </div>
            </div>
          )}
          {d.docs && (
            <div className="cm-info-card" style={{ borderLeftColor: '#f59e0b' }}>
              <i className="fas fa-file-lines" style={{ color: '#f59e0b' }} />
              <div>
                <span className="cm-info-label">Documentation</span>
                <a href={d.docs} target="_blank" rel="noopener noreferrer" className="cm-info-val cm-info-link">{d.docs}</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Row 5: Practice ── */}
      {d?.practice?.length > 0 && (
        <div className="cm-branch cm-branch-bottom">
          <div className="cm-branch-head"><i className="fas fa-laptop-code" /> Practice Platforms</div>
          <div className="cm-branch-tags">
            {d.practice.map(s => <span key={s} className="cm-tag cm-tag-practice">{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default CareerMindMap;
