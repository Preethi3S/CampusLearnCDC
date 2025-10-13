import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import courseApi from '../../api/courseApi';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const ACCENT_COLOR = '#4B6CB7'; // Secondary Blue/Accent
const WHITE = '#FFFFFF';
const SOFT_BG = '#F8F8F8';
const DANGER_COLOR = '#E53935'; 

const inputStyle = {
    padding: '10px 12px',
    border: `1px solid ${SOFT_BORDER_COLOR}`,
    borderRadius: 4,
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 8,
    backgroundColor: WHITE
};

const buttonPrimaryStyle = {
    background: PRIMARY_COLOR,
    color: WHITE,
    padding: '10px 18px',
    borderRadius: 4,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
};

const buttonDangerStyle = {
    background: DANGER_COLOR,
    color: WHITE,
    padding: '4px 8px',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    marginLeft: 8,
};

const newQuizQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  answer: ''
});

const initialModuleForm = (levelId = '') => ({
  levelId: levelId,
  title: '',
  type: 'resource',
  content: {
    videoUrl: '',
    quiz: [newQuizQuestion()],
    codingLinks: [''] 
  }
});

export default function ManageCourse() {
  const { id } = useParams();
  const token = useSelector(s => s.auth.token);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  const [levelTitle, setLevelTitle] = useState('');
  const [levelDescription, setLevelDescription] = useState('');
  const [moduleForm, setModuleForm] = useState(initialModuleForm());

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getCourse(id, token);
      setCourse(data);
      if (data.levels.length > 0) {
        setModuleForm(initialModuleForm(data.levels[0]._id));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch course details.');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const addLevel = async () => {
    if (!levelTitle.trim()) return;
    try {
      const updated = await courseApi.addLevel(id, { title: levelTitle, description: levelDescription }, token);
      setCourse(updated);
      setLevelTitle('');
      setLevelDescription('');
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to add level.');
    }
  };

  const addModule = async () => {
    const { levelId, title, type, content } = moduleForm;
    if (!title || !levelId) return alert('Module title and Level must be selected.');

    let moduleContent;
    if (type === 'resource') {
      moduleContent = { url: content.videoUrl }; 
    } else if (type === 'quiz') {
      moduleContent = content.quiz
        .filter(q => q.question.trim() && q.answer.trim())
        .map(q => ({ 
          question: q.question, 
          options: q.options.filter(o => o.trim() !== ''),
          answer: q.answer 
        }));
    } else if (type === 'coding') {
      moduleContent = content.codingLinks.filter(link => link.trim() !== '');
    }
    
    let payload = { title, type, content: moduleContent };

    try {
      const updated = await courseApi.addModule(id, levelId, payload, token);
      setCourse(updated);
      setModuleForm(initialModuleForm(levelId));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to add module: ${err.response?.data?.message || 'Server error'}`);
    }
  };
  
  const handleQuestionChange = (qIdx, field, value) => {
    const quiz = [...moduleForm.content.quiz];
    quiz[qIdx][field] = value;
    setModuleForm({ ...moduleForm, content: { ...moduleForm.content, quiz } });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    const quiz = [...moduleForm.content.quiz];
    if (!quiz[qIdx].options) quiz[qIdx].options = [];
    quiz[qIdx].options[oIdx] = value;
    setModuleForm({ ...moduleForm, content: { ...moduleForm.content, quiz } });
  };
  
  const handleRemoveQuestion = (qIdx) => {
      if (!window.confirm('Remove this question?')) return;
      const quiz = moduleForm.content.quiz.filter((_, index) => index !== qIdx);
      setModuleForm({ ...moduleForm, content: { ...moduleForm.content, quiz } });
  };
  
  const handleAddOption = (qIdx) => {
      const quiz = [...moduleForm.content.quiz];
      if (!quiz[qIdx].options) quiz[qIdx].options = [];
      quiz[qIdx].options.push('');
      setModuleForm({ ...moduleForm, content: { ...moduleForm.content, quiz } });
  };
    
  const handleLinkChange = (lIdx, value) => {
      const codingLinks = [...moduleForm.content.codingLinks];
      codingLinks[lIdx] = value;
      setModuleForm({ ...moduleForm, content: { ...moduleForm.content, codingLinks } });
  };

  const handleRemoveLink = (lIdx) => {
      const codingLinks = moduleForm.content.codingLinks.filter((_, index) => index !== lIdx);
      setModuleForm({ ...moduleForm, content: { ...moduleForm.content, codingLinks } });
  };

  const handleAddLink = () => {
      setModuleForm({ 
          ...moduleForm, 
          content: { 
              ...moduleForm.content, 
              codingLinks: [...moduleForm.content.codingLinks, ''] 
          } 
      });
  };

  if (loading || !course) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, background: SOFT_BG, minHeight: '100vh' }}>
      <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10 }}>
          Manage Course: {course.title}
      </h2>
      {error && <p style={{ color: DANGER_COLOR }}>{error}</p>}
      <hr style={{ borderColor: SOFT_BORDER_COLOR }} />

      {/* Add Level Section */}
      <div style={{ marginBottom: 30, padding: 20, background: WHITE, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: PRIMARY_COLOR }}>Add New Level</h3>
        <input
          placeholder="Level title"
          value={levelTitle}
          onChange={e => setLevelTitle(e.target.value)}
          style={{ ...inputStyle, width: 'calc(50% - 4px)', display: 'inline-block', marginRight: 8 }}
        />
        <textarea
          placeholder="Level description"
          value={levelDescription}
          onChange={e => setLevelDescription(e.target.value)}
          rows={2}
          style={{ ...inputStyle, width: '100%', marginBottom: 15 }}
        />
        <button onClick={addLevel} style={buttonPrimaryStyle}>+ Add Level</button>
      </div>
      
      <hr style={{ borderColor: SOFT_BORDER_COLOR }} />
      
      {/* Levels & Modules List */}
      {course.levels.map(level => (
        <div key={level._id} style={{ border: `1px solid ${SOFT_BORDER_COLOR}`, padding: 20, marginBottom: 20, borderRadius: 8, background: WHITE, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h4 style={{ color: ACCENT_COLOR, borderBottom: `1px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 5, marginBottom: 15 }}>{level.title}</h4>
          {level.description && <p style={{ color: '#555' }}>{level.description}</p>}

          {/* Add Module Form */}
          <div style={{ marginBottom: 15, padding: 15, border: `1px dashed ${ACCENT_COLOR}50`, borderRadius: 6, background: SOFT_BG }}>
            <h5 style={{ color: PRIMARY_COLOR, marginBottom: 10 }}>Add Module to **{level.title}**</h5>
            <input
              placeholder="Module title"
              value={moduleForm.levelId === level._id ? moduleForm.title : ''}
              onChange={e => {
                if (moduleForm.levelId !== level._id) {
                    setModuleForm(initialModuleForm(level._id));
                }
                setModuleForm(prev => ({ ...prev, levelId: level._id, title: e.target.value }));
              }}
              onFocus={() => {
                 if(moduleForm.levelId !== level._id) setModuleForm(initialModuleForm(level._id));
              }}
              style={{ ...inputStyle, width: '40%', display: 'inline-block', marginRight: 8, marginBottom: 0 }}
            />
            <select
              value={moduleForm.levelId === level._id ? moduleForm.type : 'resource'}
              onChange={e => setModuleForm({ ...initialModuleForm(level._id), type: e.target.value })}
              style={{ ...inputStyle, width: '30%', display: 'inline-block', marginRight: 8, marginBottom: 0 }}
            >
              <option value="resource">Resource (YouTube)</option>
              <option value="quiz">Quiz</option>
              <option value="coding">Coding</option>
            </select>
            <button onClick={addModule} style={{ ...buttonPrimaryStyle, padding: '8px 15px' }}>+ Add Module</button>

            {/* Resource Content */}
            {moduleForm.levelId === level._id && moduleForm.type === 'resource' && (
              <input
                placeholder="YouTube Video URL"
                value={moduleForm.content.videoUrl}
                onChange={e =>
                  setModuleForm({ ...moduleForm, content: { ...moduleForm.content, videoUrl: e.target.value } })
                }
                style={{ ...inputStyle, marginTop: 15 }}
              />
            )}
            
            {/* Quiz Content */}
            {moduleForm.levelId === level._id && moduleForm.type === 'quiz' && (
              <div style={{ marginTop: 15, padding: 10, border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, background: WHITE }}>
                <p>Quiz Questions (<span style={{ color: PRIMARY_COLOR }}>{moduleForm.content.quiz.length}</span>)</p>
                {moduleForm.content.quiz.map((q, idx) => (
                  <div key={idx} style={{ marginBottom: 15, padding: 10, border: `1px dashed ${SOFT_BORDER_COLOR}`, borderRadius: 4, background: SOFT_BG }}>
                    <input
                      placeholder={`Question ${idx + 1}`}
                      value={q.question}
                      onChange={e => handleQuestionChange(idx, 'question', e.target.value)}
                      style={inputStyle}
                    />
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9em', color: ACCENT_COLOR, marginTop: 5 }}>Options:</label>
                    {(q.options || []).map((opt, oidx) => (
                      <input
                        key={oidx}
                        placeholder={`Option ${oidx + 1}`}
                        value={opt}
                        onChange={e => handleOptionChange(idx, oidx, e.target.value)}
                        style={{ ...inputStyle, width: '90%', marginLeft: 10, marginBottom: 5 }}
                      />
                    ))}
                    <button type="button" onClick={() => handleAddOption(idx)} style={{ ...buttonPrimaryStyle, background: ACCENT_COLOR, padding: '5px 10px', fontSize: '0.9em' }}>
                      + Add Option
                    </button>
                    
                    <input
                      placeholder="Correct Answer (must match one option's text)"
                      value={q.answer}
                      onChange={e => handleQuestionChange(idx, 'answer', e.target.value)}
                      style={{ ...inputStyle, marginTop: 10 }}
                    />
                    <button type="button" onClick={() => handleRemoveQuestion(idx)} style={buttonDangerStyle}>
                      Remove Question
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setModuleForm({ ...moduleForm, content: { ...moduleForm.content, quiz: [...moduleForm.content.quiz, newQuizQuestion()] } })}
                  style={{ ...buttonPrimaryStyle, background: ACCENT_COLOR, padding: '8px 15px', marginTop: 10 }}
                >
                  + Add New Question
                </button>
              </div>
            )}

            {/* Coding Links Content (Updated) */}
            {moduleForm.levelId === level._id && moduleForm.type === 'coding' && (
              <div style={{ marginTop: 15, padding: 10, border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, background: WHITE }}>
                  <h5>External Coding Problem Links</h5>
                  {(moduleForm.content.codingLinks || []).map((link, lidx) => (
                      <div key={lidx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <input
                              placeholder={`Coding Link ${lidx + 1}`}
                              value={link}
                              onChange={e => handleLinkChange(lidx, e.target.value)}
                              style={{ ...inputStyle, width: '100%', marginBottom: 0, marginRight: 8 }}
                          />
                          <button type="button" onClick={() => handleRemoveLink(lidx)} style={buttonDangerStyle}>
                              Remove
                          </button>
                      </div>
                  ))}
                  <button type="button" onClick={handleAddLink} style={{ ...buttonPrimaryStyle, background: ACCENT_COLOR, padding: '8px 15px', marginTop: 10 }}>
                      + Add Link
                  </button>
              </div>
            )}
            
          </div>

          {/* Existing Modules List */}
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
            {level.modules.map(mod => (
              <li key={mod._id} style={{ padding: 10, borderLeft: `4px solid ${ACCENT_COLOR}`, margin: '8px 0', background: SOFT_BG, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{mod.title}</strong> (<span style={{ color: PRIMARY_COLOR, fontWeight: 500 }}>{mod.type}</span>)
                  <small style={{ color: '#666', marginLeft: 10 }}>
                    {mod.type === 'quiz' && ` • Questions: ${Array.isArray(mod.content) ? mod.content.length : 0}`} 
                    {mod.type === 'coding' && ` • Links: ${Array.isArray(mod.content) ? mod.content.length : 0}`}
                  </small>
                </div>
                <span style={{ color: mod.locked ? DANGER_COLOR : ACCENT_COLOR, fontWeight: 'bold' }}>
                  {mod.locked ? 'Locked 🔒' : 'Unlocked 🔓'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}