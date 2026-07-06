import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminDashboard from './AdminDashboard';
import QuizManagement from './QuizManagement';
import LeaderboardAdmin from './LeaderboardAdmin';
import SecuritySettings from './SecuritySettings';
import StudentManagement from './StudentManagement';
import AnalyticsTab from './AnalyticsTab';

const SIDEBAR_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
      { id: 'leaderboard', label: 'Leaderboard', icon: 'fa-ranking-star' },
      { id: 'settings', label: 'Settings', icon: 'fa-gear' },
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'quizzes', label: 'Quizzes', icon: 'fa-question-circle' },
      { id: 'students', label: 'Students', icon: 'fa-users' },
      { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
    ]
  }
];

export default function AdminLayout({ user }) {
  const [tab, setTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderTab = () => {
    switch (tab) {
      case 'dashboard': return <AdminDashboard />;
      case 'analytics': return <AnalyticsTab />;
      case 'leaderboard': return <LeaderboardAdmin />;
      case 'quizzes': return <QuizManagement />;
      case 'students': return <StudentManagement />;
      case 'security': return <SecuritySettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>{collapsed ? 'MA' : 'Mindcraft Admin'}</h3>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>
        {SIDEBAR_SECTIONS.map(section => (
          <div key={section.label} className="admin-sidebar-section">
            {!collapsed && <span className="admin-sidebar-label">{section.label}</span>}
            {section.items.map(item => (
              <button
                key={item.id}
                className={`admin-sidebar-item ${tab === item.id ? 'active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <i className={`fas ${item.icon}`}></i>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <main className="admin-content">
        <motion.div key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {renderTab()}
        </motion.div>
      </main>
    </div>
  );
}
