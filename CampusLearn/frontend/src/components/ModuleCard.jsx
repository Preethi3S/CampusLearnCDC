import React from 'react';
import { Link } from 'react-router-dom';
import CodingLinks from '../components/CodingLinks'; 

// --- THEME CONSTANTS (Consistent across components) ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981'; // Teal/Green for completion

export default function ModuleCard({ module, completed, locked, onComplete, courseId, levelId }) {
  
  // --- 1. LOCKED MODULE (Unified Look) ---
  if (locked) {
    return (
      <div style={{ 
            padding: 15, 
            border: `1px solid ${SOFT_BORDER_COLOR}`, 
            borderRadius: 8, 
            background: '#F5F5F5', // Lightest gray background
            color: MUTE_GRAY, 
            marginBottom: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
        <strong>{module.title}</strong> ({module.type}) - Locked 🔒
      </div>
    );
  }

  let youtubeEmbedUrl = '';
  // ... YouTube URL parsing logic remains the same ...
  if (module.type === 'resource' && module.content && module.content.url) {
    try {
      const url = new URL(module.content.url);
      const videoId = url.searchParams.get('v');
      if (videoId) {
          youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else {
          youtubeEmbedUrl = module.content.url; 
      }
    } catch (e) {
      youtubeEmbedUrl = module.content.url; 
    }
  }

  const commonCardStyle = {
        padding: 15, 
        border: `1px solid ${SOFT_BORDER_COLOR}`, 
        borderRadius: 8, 
        marginBottom: 12,
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: completed ? `4px solid ${SUCCESS_COLOR}` : `4px solid ${PRIMARY_COLOR}20` // Subtle left accent
    };

  switch (module.type) {
    case 'resource': 
      return (
        <div style={commonCardStyle}>
          <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
          <div style={{ marginTop: 12, marginBottom: 8, overflow: 'hidden' }}>
            {youtubeEmbedUrl ? (
                <iframe
                src={youtubeEmbedUrl}
                width="100%" 
                height="315"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ maxWidth: 560 }}
                ></iframe>
            ) : <p style={{ color: 'red' }}>Resource URL not found or invalid.</p>}
          </div>
          {!completed ? (
            <button 
                onClick={onComplete} 
                style={{ 
                    marginTop: 8, 
                    background: PRIMARY_COLOR, 
                    color: '#fff', 
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: 'none',
                    fontWeight: 'bold'
                }}
            >
              Mark as Completed
            </button>
          ) : <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold' }}>Completed ✅</p>}
        </div>
      );

    case 'quiz': 
      return (
        <div style={commonCardStyle}>
          <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
          {!completed && !locked ? (
            <Link
              to={`/student/course/${courseId}/level/${levelId}/module/${module._id}/quiz`}
              style={{ 
                    display: 'inline-block', 
                    marginTop: 10, 
                    background: PRIMARY_COLOR, 
                    color: '#fff', 
                    padding: '8px 16px', 
                    textDecoration: 'none',
                    borderRadius: 4,
                    border: 'none',
                    fontWeight: 'bold'
                }}
            >
              Start Quiz
            </Link>
          ) : null}
          {completed && <p style={{ color: SUCCESS_COLOR, fontWeight: 'bold' }}>Completed ✅</p>}
          {locked && <p style={{ color: MUTE_GRAY }}>This module is locked until previous module is completed.</p>}
        </div>
      );

    case 'coding': 
      // FIX: Since this card is only rendered if it's NOT locked, 
      // we remove the lock check and rely on the parent (CourseView.js) to filter.
      // If the parent calls this for an unlocked coding module, we pass the rendering to CodingLinks.
      
      // If you are rendering the *locked* coding module here (as per your original code),
      // we must rely on the 'locked' prop and render the content only if unlocked.
      
      // If this block is executed, it means the parent component (CourseView) 
      // determined it should be UNLOCKED, so we delegate to CodingLinks.
      
      // Note: If the parent sends 'locked: true', the function returns the locked div at the top.
      return (
        <div style={commonCardStyle}>
          <strong style={{ color: PRIMARY_COLOR }}>{module.title}</strong> ({module.type})
            <hr style={{ margin: '8px 0', borderTop: `1px solid ${SOFT_BORDER_COLOR}` }}/>
          <CodingLinks 
                courseId={courseId}
                levelId={levelId}
                moduleId={module._id}
                content={module.content}
                completed={completed} // Pass completion status
                onComplete={onComplete} // Pass completion handler
            />
        </div>
      );

    default:
      return null;
  }
}