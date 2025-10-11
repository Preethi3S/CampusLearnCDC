import React from 'react';
import { useSelector } from 'react-redux';
import progressApi from '../api/progressApi';

export default function CodingLinks({ courseId, levelId, moduleId }) {
  const token = useSelector(s => s.auth.token);
  const [completed, setCompleted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const links = [
    'https://leetcode.com/problems/two-sum/',
    'https://www.hackerrank.com/challenges/simple-array-sum/problem'
  ];

  const handleComplete = async () => {
    setLoading(true);
    try {
      // call the existing endpoint
      await progressApi.completeModule(courseId, levelId, moduleId, token);
      setCompleted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing module');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, marginBottom: 16 }}>
      <h4>Coding Tasks</h4>
      {links.map((link, idx) => (
        <div key={idx} style={{ marginBottom: 8 }}>
          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </div>
      ))}

      {!completed ? (
        <button 
          onClick={handleComplete} 
          disabled={loading} 
          style={{ background: '#4B6CB7', color: '#fff', padding: '6px 12px', borderRadius: 4 }}
        >
          {loading ? 'Marking...' : 'Mark as Completed'}
        </button>
      ) : <p style={{ color: '#10B981' }}>Completed ✅</p>}
    </div>
  );
}
