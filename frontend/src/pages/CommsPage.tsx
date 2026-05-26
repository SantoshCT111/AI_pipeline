import { Bell, Send, ShieldAlert, Sparkles } from 'lucide-react';
import type { AnnouncementPriority } from '../types';
import { useState } from 'react';

type Announcement = {
  priority: AnnouncementPriority;
  title: string;
  body: string;
  time: string;
  readBy: number;
};

const PRIORITIES: AnnouncementPriority[] = ['Normal', 'Important', 'Urgent'];

const PRIORITY_STYLES: Record<AnnouncementPriority, { pill: string; border: string }> = {
  Normal: { pill: 'status-pill status-pill--neutral', border: 'accent-neutral' },
  Important: { pill: 'status-pill status-pill--info', border: 'accent-info' },
  Urgent: { pill: 'status-pill status-pill--danger', border: 'accent-danger' },
};

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    priority: 'Normal',
    title: 'Field Trip Permission Slips',
    body: 'Please ensure all permission slips for the science museum trip on Friday are signed and returned by Wednesday.',
    time: '2 hours ago',
    readBy: 42,
  },
  {
    priority: 'Important',
    title: 'Parent-Teacher Conference Schedule',
    body: 'The spring parent-teacher conferences will be held next week. Please book your preferred time slot through the school portal.',
    time: 'Yesterday',
    readBy: 67,
  },
  {
    priority: 'Urgent',
    title: 'School Closure - Weather Alert',
    body: 'Due to the severe weather forecast, school will be closed tomorrow. All classes will move to online learning.',
    time: '3 days ago',
    readBy: 89,
  },
];

export default function CommsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');

  return (
    <div className="page-grid page-grid--single">
      <section className="hero-card page-section hero-card--comms">
        <div>
          <div className="section-kicker">
            <Bell size={14} /> Communication Bridge
          </div>
          <h2 className="hero-title">Draft announcements parents can scan fast and trust immediately.</h2>
          <p className="hero-copy">Write calm, clear updates with deliberate hierarchy, priority tags, and a layout that keeps the message itself in focus.</p>
        </div>
        <div className="hero-stat-strip hero-stat-strip--three">
          <div><span>Audience</span><strong>Parents</strong></div>
          <div><span>Tone</span><strong>Clear</strong></div>
          <div><span>Priority</span><strong>{priority}</strong></div>
        </div>
      </section>

      <section className="page-grid page-grid--two">
        <article className="page-section section-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Compose</p>
              <h3>Announcement draft</h3>
            </div>
            <span className="pill pill--subtle"><Sparkles size={12} /> Teacher-ready</span>
          </div>

          <label className="field-label" htmlFor="announcement-title">Title</label>
          <input id="announcement-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title..." />

          <label className="field-label" htmlFor="announcement-body">Message</label>
          <textarea id="announcement-body" className="input input--textarea input--large" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement here..." />

          <div className="compose-footer">
            <div className="priority-toggle">
              {PRIORITIES.map((item) => (
                <button key={item} className={`priority-toggle__button ${priority === item ? 'priority-toggle__button--active' : ''}`} onClick={() => setPriority(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
            <button className="primary-button" type="button" disabled={!title || !body}>
              <Send size={16} /> Send
            </button>
          </div>
        </article>

        <article className="page-section section-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recent announcements</p>
              <h3>What parents are seeing</h3>
            </div>
            <ShieldAlert size={16} className="muted-icon" />
          </div>

          <div className="announcement-list">
            {MOCK_ANNOUNCEMENTS.map((announcement) => (
              <article key={announcement.title} className={`announcement-card ${PRIORITY_STYLES[announcement.priority].border}`}>
                <div className="announcement-card__top">
                  <h4>{announcement.title}</h4>
                  <div>
                    <span className={PRIORITY_STYLES[announcement.priority].pill}>{announcement.priority}</span>
                    <small>{announcement.time}</small>
                  </div>
                </div>
                <p>{announcement.body}</p>
                <footer>
                  <span>Read by {announcement.readBy} parents</span>
                  <span className="dots"><i /><i /><i /></span>
                </footer>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
