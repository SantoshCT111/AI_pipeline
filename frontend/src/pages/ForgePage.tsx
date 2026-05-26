import { useMemo, useState } from 'react';
import { Sparkles, Wand2, ArrowRight, Send, RotateCcw, Trash2, ChevronDown, ChevronUp, Clock3 } from 'lucide-react';
import { generateQuizFromPdf, generateQuizFromText } from '../lib/api';
import type { QuizTask } from '../types';

type InputMode = 'file' | 'text';

const DEFAULT_TEXT = 'Paste a lesson, passage, or reading here. The assistant will turn it into a polished quiz with multiple-choice and true/false questions.';

function makeDefaultTask(index: number): QuizTask {
  return {
    question_type: index % 2 === 0 ? 'multiple_choice' : 'true_false',
    question_text: index % 2 === 0 ? 'What is the main idea of the passage?' : 'This statement is true.',
    options: index % 2 === 0 ? ['A', 'B', 'C', 'D'] : ['True', 'False'],
    correct_answer: index % 2 === 0 ? 'A' : 'True',
    explanation: 'Explain why the answer is correct in a clear, student-friendly way.',
    xp_reward: 20 + index * 5,
  };
}

function normalizeTasks(tasks: QuizTask[]) {
  return tasks.map((task, index) => ({
    ...task,
    options: task.options.length ? task.options : makeDefaultTask(index).options,
    xp_reward: Math.max(10, Math.min(100, task.xp_reward || 20)),
  }));
}

function QuestionCard({ task, index, onChange, onDelete }: {
  task: QuizTask;
  index: number;
  onChange: (updated: QuizTask) => void;
  onDelete: () => void;
}) {
  const [openExplanation, setOpenExplanation] = useState(index < 2);

  return (
    <article className="question-card">
      <div className="question-card__header">
        <div className="question-card__badges">
          <span className="badge badge--dark">Q{index + 1}</span>
          <span className={`badge ${task.question_type === 'multiple_choice' ? 'badge--indigo' : 'badge--emerald'}`}>
            {task.question_type === 'multiple_choice' ? 'Multiple Choice' : 'True / False'}
          </span>
          <span className="badge badge--amber"><Sparkles size={12} /> {task.xp_reward} XP</span>
        </div>
        <button type="button" className="ghost-button ghost-button--danger" onClick={onDelete}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <label className="field-label">Question</label>
      <textarea
        className="input input--textarea"
        value={task.question_text}
        onChange={(e) => onChange({ ...task, question_text: e.target.value })}
      />

      <div className="option-grid">
        {task.options.map((option, optionIndex) => {
          const isCorrect = task.correct_answer === option;
          return (
            <label key={`${index}-${optionIndex}`} className={`option-tile ${isCorrect ? 'option-tile--active' : ''}`}>
              <input
                type="radio"
                checked={isCorrect}
                onChange={() => onChange({ ...task, correct_answer: option })}
              />
              <input
                type="text"
                className="option-tile__input"
                value={option}
                onChange={(e) => {
                  const nextOptions = [...task.options];
                  nextOptions[optionIndex] = e.target.value;
                  const nextAnswer = task.correct_answer === option ? e.target.value : task.correct_answer;
                  onChange({ ...task, options: nextOptions, correct_answer: nextAnswer });
                }}
              />
            </label>
          );
        })}
      </div>

      <div className="question-card__footer">
        <button type="button" className="ghost-button" onClick={() => setOpenExplanation((prev) => !prev)}>
          {openExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {openExplanation ? 'Hide explanation' : 'Show explanation'}
        </button>
        <label className="xp-field">
          <span>XP</span>
          <input
            type="number"
            min={10}
            max={100}
            step={5}
            value={task.xp_reward}
            onChange={(e) => onChange({ ...task, xp_reward: Number(e.target.value) })}
          />
        </label>
      </div>

      {openExplanation && (
        <textarea
          className="input input--textarea input--muted"
          value={task.explanation}
          onChange={(e) => onChange({ ...task, explanation: e.target.value })}
          placeholder="Add an explanation students can learn from..."
        />
      )}
    </article>
  );
}

export default function ForgePage() {
  const [mode, setMode] = useState<InputMode>('file');
  const [status, setStatus] = useState<'idle' | 'loading' | 'editor'>('idle');
  const [draftText, setDraftText] = useState(DEFAULT_TEXT);
  const [tasks, setTasks] = useState<QuizTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetSubject, setTargetSubject] = useState('Mathematics');
  const [targetClass, setTargetClass] = useState('Grade 8');
  const [targetSection, setTargetSection] = useState('Section B');

  const canGenerateFromText = draftText.trim().length >= 40;
  const hasTasks = tasks.length > 0;

  const summary = useMemo(() => {
    const totalXp = tasks.reduce((sum, task) => sum + task.xp_reward, 0);
    const multipleChoice = tasks.filter((task) => task.question_type === 'multiple_choice').length;
    const trueFalse = tasks.filter((task) => task.question_type === 'true_false').length;
    return { totalXp, multipleChoice, trueFalse };
  }, [tasks]);

  async function handleGenerateText() {
    setStatus('loading');
    setError(null);
    try {
      const result = await generateQuizFromText(draftText.trim());
      setTasks(normalizeTasks(result.tasks.length ? result.tasks : [makeDefaultTask(0), makeDefaultTask(1), makeDefaultTask(2)]));
      setStatus('editor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz.';
      setError(message);
      setStatus('idle');
    }
  }

  async function handleGenerateFile() {
    if (!selectedFile) return;
    setStatus('loading');
    setError(null);
    try {
      const result = await generateQuizFromPdf(selectedFile);
      setTasks(normalizeTasks(result.tasks.length ? result.tasks : [makeDefaultTask(0), makeDefaultTask(1), makeDefaultTask(2)]));
      setStatus('editor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quiz.';
      setError(message);
      setStatus('idle');
    }
  }

  const startOver = () => {
    setTasks([]);
    setSelectedFile(null);
    setDraftText(DEFAULT_TEXT);
    setStatus('idle');
    setError(null);
  };

  const publishQuiz = () => {
    window.alert('Quiz is ready to publish. Backend saving is not wired yet.');
  };

  const sendQuizToClass = () => {
    window.alert(`Sending quiz to ${targetSubject} · ${targetClass} · ${targetSection}`);
  };

  return (
    <div className="page-grid page-grid--single">
      <section className="page-section page-section--stacked">
        <div className="section-header">
          <div>
            <p className="eyebrow">Quiz generator</p>
            <h3>Create a clean lesson-to-quiz draft</h3>
          </div>
          <div className="switcher">
            <button className={mode === 'file' ? 'switcher__button switcher__button--active' : 'switcher__button'} onClick={() => setMode('file')}>
              PDF upload
            </button>
            <button className={mode === 'text' ? 'switcher__button switcher__button--active' : 'switcher__button'} onClick={() => setMode('text')}>
              Paste text
            </button>
          </div>
        </div>

        {error && <div className="alert alert--danger">{error}</div>}

        {mode === 'file' ? (
          <div className="upload-card">
            <label className="upload-zone">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <div className="upload-zone__icon">
                <ArrowRight size={18} />
              </div>
              <strong>{selectedFile ? selectedFile.name : 'Drop a PDF here or click to browse'}</strong>
              <span>PDF only · max 10MB · best for worksheets and reading passages</span>
            </label>

            <div className="inline-actions">
              <button className="primary-button" onClick={handleGenerateFile} disabled={!selectedFile || status === 'loading'}>
                <Sparkles size={16} /> Generate quiz
              </button>
              <button className="ghost-button" onClick={startOver}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="text-editor-card">
            <textarea
              className="input input--textarea input--large"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
            />
            <div className="text-editor-card__footer">
              <span>{draftText.trim().length.toLocaleString()} characters</span>
              <div className="inline-actions">
                <button className="primary-button" onClick={handleGenerateText} disabled={!canGenerateFromText || status === 'loading'}>
                  <Sparkles size={16} /> Generate quiz
                </button>
                <button className="ghost-button" onClick={startOver}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {status === 'loading' && (
        <section className="loading-panel page-section">
          <div className="loading-spinner">
            <Wand2 size={28} />
          </div>
          <h3>Generating a teacher-ready draft</h3>
          <p>We’re shaping the quiz into balanced questions, explanations, and XP rewards.</p>
        </section>
      )}

      {hasTasks && status === 'editor' && (
        <section className="editor-grid">
          <aside className="summary-rail page-section page-section--sticky">
            <div className="summary-rail__header">
              <p className="eyebrow">Question workspace</p>
              <h3>Review the generated draft</h3>
            </div>

            <div className="metric-grid">
              <div className="metric-card"><span>Questions</span><strong>{tasks.length}</strong></div>
              <div className="metric-card"><span>Total XP</span><strong>{summary.totalXp}</strong></div>
              <div className="metric-card"><span>MC</span><strong>{summary.multipleChoice}</strong></div>
              <div className="metric-card"><span>T/F</span><strong>{summary.trueFalse}</strong></div>
            </div>

            <div className="teacher-note">
              <Clock3 size={14} />
              <p>Review the draft, adjust the wording, and publish when the set feels balanced.</p>
            </div>

            <div className="send-quiz-panel">
              <div className="send-quiz-panel__header">
                <div>
                  <p className="eyebrow">Send quiz</p>
                  <h4>Choose the class that should receive this quiz</h4>
                </div>
                <Send size={16} className="muted-icon" />
              </div>

              <div className="send-quiz-grid">
                <label className="teacher-filter-field">
                  <span>Subject</span>
                  <select value={targetSubject} onChange={(e) => setTargetSubject(e.target.value)}>
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>English</option>
                    <option>History</option>
                  </select>
                </label>

                <label className="teacher-filter-field">
                  <span>Class</span>
                  <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)}>
                    <option>Grade 6</option>
                    <option>Grade 7</option>
                    <option>Grade 8</option>
                    <option>Grade 9</option>
                  </select>
                </label>

                <label className="teacher-filter-field">
                  <span>Section</span>
                  <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)}>
                    <option>Section A</option>
                    <option>Section B</option>
                    <option>Section C</option>
                  </select>
                </label>
              </div>

              <button className="primary-button send-quiz-panel__button" onClick={sendQuizToClass}>
                <Send size={16} /> Send quiz now
              </button>
            </div>

            <div className="editor-actions">
              <button className="secondary-button" onClick={startOver}><RotateCcw size={16} /> Start over</button>
              <button className="primary-button" onClick={publishQuiz}><Send size={16} /> Publish</button>
            </div>
          </aside>

          <div className="question-list">
            {tasks.map((task, index) => (
              <QuestionCard
                key={`${task.question_text}-${index}`}
                task={task}
                index={index}
                onChange={(updated) => setTasks((current) => current.map((item, itemIndex) => (itemIndex === index ? updated : item)))}
                onDelete={() => setTasks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
