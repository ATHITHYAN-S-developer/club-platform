import { useState, useEffect } from 'react';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED = 0;
const RIGHT_WIDTH = 400;
const RIGHT_COLLAPSED = 0;
const TOP_BAR_HEIGHT = 56;
const BOTTOM_BAR_HEIGHT = 36;
const BREAKPOINT_TABLET = 1200;
const BREAKPOINT_MOBILE = 768;

export default function TaskLayout({
  topBar,
  leftSidebar,
  children,
  rightPanel,
  statusBar,
}) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = windowWidth < BREAKPOINT_TABLET && windowWidth >= BREAKPOINT_MOBILE;
  const isMobile = windowWidth < BREAKPOINT_MOBILE;

  const effectiveLeftOpen = isMobile ? false : leftOpen;
  const effectiveRightOpen = isTablet ? false : isMobile ? false : rightOpen;

  const sidebarWidth = effectiveLeftOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;
  const rightWidth = effectiveRightOpen ? RIGHT_WIDTH : RIGHT_COLLAPSED;

  const leftSidebarContent = typeof leftSidebar === 'function'
    ? leftSidebar({ isOpen: effectiveLeftOpen, onToggle: () => setLeftOpen(p => !p) })
    : leftSidebar;

  const rightPanelContent = typeof rightPanel === 'function'
    ? rightPanel({ isOpen: effectiveRightOpen, onToggle: () => setRightOpen(p => !p) })
    : rightPanel;

  const topBarContent = typeof topBar === 'function'
    ? topBar({ leftOpen: effectiveLeftOpen, rightOpen: effectiveRightOpen, onToggleLeft: () => setLeftOpen(p => !p), onToggleRight: () => setRightOpen(p => !p) })
    : topBar;

  const statusBarContent = typeof statusBar === 'function'
    ? statusBar({})
    : statusBar;

  return (
    <div className="tl-wrapper">
      <div className="tl-topbar-area">
        {topBarContent}
      </div>

      <div className="tl-middle">
        <div
          className="tl-sidebar-area"
          style={{
            width: isMobile ? 0 : `${sidebarWidth}px`,
            minWidth: isMobile ? 0 : `${sidebarWidth}px`,
            overflow: 'hidden',
            transition: 'width 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {!isMobile && leftSidebarContent}
        </div>

        <div className="tl-center-area">
          <div className="tl-center-scroll">
            {children}
          </div>
        </div>

        <div
          className="tl-right-area"
          style={{
            width: isMobile ? 0 : `${rightWidth}px`,
            minWidth: isMobile ? 0 : `${rightWidth}px`,
            overflow: 'hidden',
            transition: 'width 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {!isMobile && rightPanelContent}
        </div>
      </div>

      <div className="tl-bottombar-area">
        {statusBarContent}
      </div>

      {isMobile && leftOpen && (
        <div className="tl-mobile-overlay" onClick={() => setLeftOpen(false)}>
          <div className="tl-mobile-drawer tl-drawer-left" onClick={e => e.stopPropagation()}>
            {typeof leftSidebar === 'function' ? leftSidebar({ isOpen: true, onToggle: () => setLeftOpen(false) }) : leftSidebar}
          </div>
        </div>
      )}

      {isMobile && rightOpen && (
        <div className="tl-mobile-overlay" onClick={() => setRightOpen(false)}>
          <div className="tl-mobile-drawer tl-drawer-right" onClick={e => e.stopPropagation()}>
            {typeof rightPanel === 'function' ? rightPanel({ isOpen: true, onToggle: () => setRightOpen(false) }) : rightPanel}
          </div>
        </div>
      )}

      <style>{`
        .tl-wrapper {
          display: flex; flex-direction: column;
          height: 100vh; width: 100%;
          background: var(--bg); overflow: hidden;
        }
        .tl-topbar-area { flex-shrink: 0; }
        .tl-middle {
          flex: 1; display: flex; overflow: hidden;
          min-height: 0;
        }
        .tl-sidebar-area {
          flex-shrink: 0; overflow: hidden;
          background: var(--bg-2);
        }
        .tl-center-area {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; min-width: 0;
        }
        .tl-center-scroll {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 1.5rem;
        }
        .tl-right-area {
          flex-shrink: 0; overflow: hidden;
          border-left: 1px solid var(--border);
          background: var(--bg);
        }
        .tl-bottombar-area { flex-shrink: 0; }
        .tl-mobile-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          z-index: 150; backdrop-filter: blur(4px);
        }
        .tl-mobile-drawer {
          position: absolute; top: 0; bottom: 0;
          width: 300px; max-width: 85vw;
          background: var(--bg); overflow-y: auto;
        }
        .tl-drawer-left { left: 0; }
        .tl-drawer-right { right: 0; }
        @media (max-width: 1199px) {
          .tl-center-scroll { padding: 1.25rem; }
        }
        @media (max-width: 768px) {
          .tl-center-scroll { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
