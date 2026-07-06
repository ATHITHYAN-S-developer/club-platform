import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import db from '../db';

export default function RobotCompanion() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m Mindy, your AI club assistant. Ask me about events, projects, or how to join!' }
  ]);
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('neutral');
  const [speech, setSpeech] = useState('Greetings, creator!');
  const [showSpeech, setShowSpeech] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const robotRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const blinkIntervalRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    let message = 'Welcome to Mindcraft AI!';
    if (path === '/') message = 'Explore our creative engineering hub!';
    else if (path === '/auth') message = 'Entering secure portal...';
    else if (path.startsWith('/admin')) message = 'Core systems operational, admin!';
    else if (path === '/resources') message = 'Behold our algorithmic crafts!';
    else if (path === '/quiz') message = 'Unleash your computational brain!';
    else if (path === '/join') message = 'Join the core team list!';
    else if (path === '/events') message = 'Syncing upcoming challenges...';
    triggerSpeech(message, 'happy', 4000);
  }, [location]);

  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      setExpression('blink');
      setTimeout(() => setExpression('neutral'), 180);
    }, 4500);
    return () => { if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current); };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(6, Math.hypot(e.clientX - cx, e.clientY - cy) / 50);
      setPupilOffset({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const triggerSpeech = (text, exp = 'happy', duration = 3000) => {
    setSpeech(text);
    setExpression(exp);
    setShowSpeech(true);
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    speechTimeoutRef.current = setTimeout(() => {
      setShowSpeech(false);
      setExpression('neutral');
    }, duration);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    const lower = userMsg.toLowerCase();
    let reply = '';
    try {
      if (lower.includes('event') || lower.includes('upcoming') || lower.includes('when')) {
        const events = await db.find('Events');
        const upcoming = events.filter(e => e.date >= new Date().toISOString().split('T')[0]);
        reply = upcoming.length > 0
          ? `We have ${upcoming.length} upcoming event(s)! Next: "${upcoming[0].title}" on ${upcoming[0].date}.`
          : 'No upcoming events scheduled yet. Check back soon!';
      } else if (lower.includes('join') || lower.includes('member') || lower.includes('register')) {
        reply = 'Great that you\'re interested! Head to the Join page to apply. We\'re open for 2026-27 recruitment!';
      } else if (lower.includes('project') || lower.includes('build')) {
        const projects = await db.find('Projects');
        reply = `We have ${projects.length} project(s) in our showcase. Check out the Projects page for details!`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        reply = 'Hey there! 👋 How can I help you today?';
      } else {
        reply = 'I\'m not sure about that. Try asking about events, projects, or how to join the club!';
      }
    } catch {
      reply = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
    }
    setTimeout(() => setMessages(prev => [...prev, { role: 'bot', text: reply }]), 500);
  };

  const handleClick = () => {
    if (isOpen) return;
    const clicks = [
      { msg: 'BEEP BOOP! System active!', exp: 'surprised' },
      { msg: 'Fascinating mouse coordinates!', exp: 'curious' },
      { msg: 'Designing future layouts...', exp: 'happy' },
      { msg: 'Have you verified Firestore rules today?', exp: 'curious' },
    ];
    const pick = clicks[Math.floor(Math.random() * clicks.length)];
    triggerSpeech(pick.msg, pick.exp, 3500);
  };

  return (
    <div className="robot-companion" ref={robotRef}>
      {showSpeech && (
        <div style={{
          position: 'absolute', bottom: '64px', right: '0',
          background: 'var(--card)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)', padding: '0.5rem 0.8rem',
          fontSize: '0.82rem', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap',
          maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: '0.5rem',
        }}>
          {speech}
        </div>
      )}

      {isOpen && (
        <div className="robot-chat">
          <div className="robot-chat-header">
            <span>🤖 Mindy</span>
            <button onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="robot-chat-body" style={{ maxHeight: 280, overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', marginBottom: '0.6rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '0.55rem 0.85rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'var(--orange)' : 'var(--surface)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  fontSize: '0.85rem', lineHeight: 1.5,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="robot-chat-footer">
            <input className="robot-chat-input" placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <button className="robot-chat-send" onClick={handleSend}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}

      <button className="robot-toggle" onClick={() => { setIsOpen(prev => !prev); handleClick(); }}>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'}`}></i>
      </button>
    </div>
  );
}
