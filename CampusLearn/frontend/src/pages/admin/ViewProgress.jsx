import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import progressApi from '../../api/progressApi';
import { useSelector } from 'react-redux';

const PRIMARY_COLOR = '#4B6CB7';
const WHITE = '#fff';
const SOFT_BG = '#F8F8F8';
const SUCCESS = '#10B981';
const WARNING = '#F59E0B';

export default function AdminCourseProgress() {
  const { courseId } = useParams();
  const token = useSelector(s => s.auth.token);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, incomplete

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await progressApi.getMyCourses(token); // fetch all courses
      const courseProgress = data.find(c => String(c.course._id) === courseId);
      setProgressList(courseProgress ? [courseProgress] : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, [courseId]);

  const filtered = progressList.filter(p => {
    if(filter === 'completed') return p.isCompleted;
    if(filter === 'incomplete') return !p.isCompleted;
    return true;
  });

  if(loading) return <p>Loading...</p>;
  if(error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20, background: SOFT_BG, minHeight: '100vh' }}>
      <h2 style={{ color: PRIMARY_COLOR, marginBottom: 20 }}>Course Progress</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Filter: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 6, borderRadius: 4 }}>
          <option value="all">All Students</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {filtered.length === 0 && <p>No students found.</p>}

      {filtered.map(p => (
        <div key={p._id} style={{ background: WHITE, padding: 15, marginBottom: 15, borderRadius: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h4>{p.student?.name || 'Student'}</h4>
          <p>Status: <span style={{ color: p.isCompleted ? SUCCESS : WARNING }}>{p.isCompleted ? 'Completed ✅' : 'In Progress ⏳'}</span></p>

          <div style={{ marginTop: 10 }}>
            <h5>Main Levels:</h5>
            <ul>
              {p.levels.map(l => (
                <li key={l.levelId}>
                  Level {l.levelId}: {l.modules.filter(m => m.completed).length}/{l.modules.length} modules completed
                </li>
              ))}
            </ul>
          </div>

          {p.subCourses.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <h5>Sub-Courses:</h5>
              <ul>
                {p.subCourses.map(sc => (
                  <li key={sc.subCourseId}>
                    Sub-course {sc.subCourseId}: {sc.levels.reduce((sum, l) => sum + l.modules.filter(m => m.completed).length, 0)}/{sc.levels.reduce((sum, l) => sum + l.modules.length, 0)} modules completed
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
