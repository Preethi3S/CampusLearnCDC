import React from 'react';
import { useSelector } from 'react-redux';
import progressApi from '../api/progressApi';

// --- THEME CONSTANTS (Consistent across components) ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BACKGROUND = '#F8F8F8'; 
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981'; // Teal/Green for completion

export default function CodingLinks({ courseId, levelId, moduleId, content, completed, onComplete }) {
  const token = useSelector(s => s.auth.token);
  const [loading, setLoading] = React.useState(false); 

  const links = Array.isArray(content) ? content : [];

  const handleComplete = async () => {
    setLoading(true);
    try {
        await onComplete(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing module');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ 
            padding: 15, 
            border: `1px solid ${SOFT_BORDER_COLOR}`, 
            borderRadius: 8, 
            marginBottom: 8,
            background: SOFT_BACKGROUND,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' // Subtle inset shadow for depth
        }}>
      <h4>Coding Tasks (<span style={{ color: PRIMARY_COLOR }}>{links.length}</span> problems)</h4> 
      
      {links.length > 0 ? (
        links.map((link, idx) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: PRIMARY_COLOR, textDecoration: 'none', fontWeight: '500' }}
            >
                {link}
            </a>
          </div>
        ))
      ) : (
        <p style={{ color: MUTE_GRAY }}>No coding problems have been added by the instructor.</p>
      )}

      {/* Button / Completed Status */}
      {!completed ? (
        <button 
          onClick={handleComplete} 
          disabled={loading} 
          style={{ 
                marginTop: 10,
                background: PRIMARY_COLOR, 
                color: '#fff', 
                padding: '8px 16px', 
                borderRadius: 4,
                border: 'none',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1
            }}
        >
          {loading ? 'Marking...' : 'Mark as Completed'}
        </button>
      ) : <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold', marginTop: 10 }}>Completed ✅</p>}
    </div>
  );
}