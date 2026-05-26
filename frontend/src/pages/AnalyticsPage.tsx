import { useState } from 'react';

export default function AnalyticsPage() {
  const [subject, setSubject] = useState('Mathematics');
  const [className, setClassName] = useState('Grade 8');
  const [section, setSection] = useState('Section B');
  const [showData, setShowData] = useState(false);

  return (
    <div className="page-grid page-grid--single">
      <section className="hero-card page-section hero-card--analytics">
        <div className="teacher-filter-panel">
          <div className="teacher-filter-grid teacher-filter-grid--inline">
            <label className="teacher-filter-field">
              <span>Subject</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
              </select>
            </label>

            <label className="teacher-filter-field">
              <span>Class</span>
              <select value={className} onChange={(e) => setClassName(e.target.value)}>
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Grade 8</option>
                <option>Grade 9</option>
              </select>
            </label>

            <label className="teacher-filter-field">
              <span>Section</span>
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                <option>Section A</option>
                <option>Section B</option>
                <option>Section C</option>
              </select>
            </label>

            <button className="primary-button teacher-filter-action" onClick={() => setShowData(true)}>
              Show data
            </button>
          </div>

          {showData ? (
            <div className="teacher-data-panel">
              <div className="teacher-data-panel__header">
                <div>
                  <p className="eyebrow">Selected view</p>
                  <h3>{subject} · {className} · {section}</h3>
                </div>
                <span className="pill pill--subtle">Live selection</span>
              </div>

              <div className="teacher-data-grid">
                <article className="teacher-data-card">
                  <span>Average score</span>
                  <strong>78%</strong>
                </article>
                <article className="teacher-data-card">
                  <span>Completion rate</span>
                  <strong>92%</strong>
                </article>
                <article className="teacher-data-card">
                  <span>Students reviewed</span>
                  <strong>847</strong>
                </article>
              </div>

              <div className="teacher-data-table">
                <div className="teacher-data-table__head">
                  <span>Topic</span>
                  <span>Status</span>
                  <span>Accuracy</span>
                </div>
                <div className="teacher-data-table__row">
                  <strong>Fractions</strong>
                  <span>Needs review</span>
                  <span>61%</span>
                </div>
                <div className="teacher-data-table__row">
                  <strong>Geometry</strong>
                  <span>Stable</span>
                  <span>84%</span>
                </div>
                <div className="teacher-data-table__row">
                  <strong>Word problems</strong>
                  <span>Improving</span>
                  <span>73%</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
