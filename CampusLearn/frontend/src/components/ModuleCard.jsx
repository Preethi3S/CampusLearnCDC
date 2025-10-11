import React from 'react';

export default function ModuleCard({ module, completed, locked, onComplete }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      padding: 12,
      borderRadius: 6,
      marginBottom: 8,
      background: completed ? '#10B98120' : '#fff',
      opacity: locked ? 0.5 : 1
    }}>
      <h4>{module.title} {completed && '✅'}</h4>
      <p>Type: {module.type}</p>
      {locked ? (
        <small>Complete previous module to unlock</small>
      ) : !completed ? (
        <button onClick={onComplete} style={{ background: '#4B6CB7', color: '#fff', padding: '4px 8px', borderRadius: 4 }}>
          Mark Complete
        </button>
      ) : null}
    </div>
  );
}
