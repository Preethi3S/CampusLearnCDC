import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import courseApi from '../../api/courseApi';

export default function ManageCourse() {
  const { id } = useParams(); // courseId
  const token = useSelector(s => s.auth.token);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [levelTitle, setLevelTitle] = useState('');
  const [moduleForm, setModuleForm] = useState({
    levelId: '',
    title: '',
    type: 'resource',
    content: { videoUrl: '', text: '', externalLinks: [] }
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getCourse(id, token);
        setCourse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, token]);

  // Add level
  const addLevel = async () => {
    if (!levelTitle.trim()) return;
    try {
      const updated = await courseApi.addLevel(id, { title: levelTitle }, token);
      setCourse(updated);
      setLevelTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  // Add module
  const addModule = async () => {
    const { levelId, title, type, content } = moduleForm;
    if (!title || !levelId) return;
    try {
      const updated = await courseApi.addModule(id, levelId, { title, type, content }, token);
      setCourse(updated);
      setModuleForm({ levelId: '', title: '', type: 'resource', content: { videoUrl: '', text: '', externalLinks: [] } });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !course) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Course: {course.title}</h2>

      {/* Add Level */}
      <div style={{ marginBottom: 20 }}>
        <h3>Add Level</h3>
        <input value={levelTitle} onChange={e => setLevelTitle(e.target.value)} placeholder="Level title" />
        <button onClick={addLevel} style={{ marginLeft: 8 }}>Add Level</button>
      </div>

      {/* List Levels & Modules */}
      <div>
        {course.levels.map(level => (
          <div key={level._id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 6 }}>
            <h4>{level.title}</h4>

            {/* Add Module to this level */}
            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Module title"
                value={moduleForm.levelId === level._id ? moduleForm.title : ''}
                onChange={e => setModuleForm({ ...moduleForm, levelId: level._id, title: e.target.value })}
              />
              <select
                value={moduleForm.type}
                onChange={e => setModuleForm({ ...moduleForm, type: e.target.value, levelId: level._id })}
              >
                <option value="resource">Resource</option>
                <option value="quiz">Quiz</option>
                <option value="coding">Coding</option>
              </select>
              <button onClick={addModule}>Add Module</button>
            </div>

            {/* Existing modules */}
            <ul>
              {level.modules.map(mod => (
                <li key={mod._id}>
                  <strong>{mod.title}</strong> ({mod.type}) {mod.locked ? '🔒' : '🔓'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
