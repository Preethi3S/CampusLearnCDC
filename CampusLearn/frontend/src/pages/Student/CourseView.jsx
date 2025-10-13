import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import progressApi from '../../api/progressApi';
import ModuleCard from '../../components/ModuleCard';
import CodingLinks from '../../components/CodingLinks';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BACKGROUND = '#F8F8F8'; 
const WHITE = '#FFFFFF';
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981'; // Teal/Green for completion

export default function CourseView() {
  const { id } = useParams();
  const token = useSelector(s => s.auth.token);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await progressApi.getCourseProgress(id, token);
      setProgress(data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.response?.data?.message || 'Failed to fetch course progress. Are you enrolled?');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  const completeModule = async (levelId, moduleId) => {
    try {
      await progressApi.completeModule(id, levelId, moduleId, token);
      fetchProgress();
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing module.');
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!progress) return <p>No progress data found.</p>; 
  
  const courseLevels = progress.course.levels || [];
  
  let allPreviousLevelsCompleted = true; // State to track completion status

  return (
    <div style={{ padding: '20px', backgroundColor: SOFT_BACKGROUND, minHeight: '100vh' }}>
      <h1 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10 }}>
          {progress.course.title}
      </h1>
      <p style={{ color: MUTE_GRAY, marginBottom: 30 }}>{progress.course.description}</p>
      
      {progress.levels.map((levelProgress, levelIndex) => {
        const courseLevel = courseLevels.find(l => String(l._id) === String(levelProgress.levelId));
        
        if (!courseLevel) return <p key={levelProgress.levelId} style={{ color: 'orange' }}>Level data missing for ID: {String(levelProgress.levelId)}</p>;
        
        const levelIsLocked = !allPreviousLevelsCompleted;
        const allModulesCompletedInCurrentLevel = levelProgress.modules.every(mod => mod.completed);

        if (!allModulesCompletedInCurrentLevel) {
            allPreviousLevelsCompleted = false;
        }

        // --- LOCKED LEVEL RENDER ---
        if (levelIsLocked) {
            return (
                <div 
                    key={levelProgress.levelId} 
                    style={{ 
                        marginBottom: 24, 
                        padding: 20, 
                        border: `1px solid ${SOFT_BORDER_COLOR}`, 
                        borderRadius: 8, 
                        background: WHITE, 
                        opacity: 0.7, // Muted look
                        color: MUTE_GRAY,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                >
                    <h3>{courseLevel.title} - Locked 🔒</h3>
                    <p style={{ margin: 0, fontSize: '0.9em' }}>Complete the previous level to unlock this content.</p>
                </div>
            );
        }

        // --- UNLOCKED LEVEL RENDER ---
        return (
          <div 
                key={levelProgress.levelId} 
                style={{ 
                    marginBottom: 24, 
                    padding: 20, 
                    border: `1px solid ${SOFT_BORDER_COLOR}`, 
                    borderRadius: 8, 
                    background: WHITE, 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)' 
                }}
            >
            <h3 
                style={{ 
                    borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, 
                    paddingBottom: 10, 
                    marginBottom: 20,
                    color: PRIMARY_COLOR // Level title in MongoDB color
                }}>
                {courseLevel.title} 
                {allModulesCompletedInCurrentLevel ? <span style={{ color: SUCCESS_COLOR, marginLeft: 8 }}>✅</span> : ''}
            </h3>

            {levelProgress.modules.map((modProgress, index) => {
              const moduleData = courseLevel.modules.find(m => String(m._id) === String(modProgress.moduleId));

              if (!moduleData) return <p key={modProgress.moduleId} style={{ color: 'orange' }}>Module data missing for ID: {String(modProgress.moduleId)}</p>;

              const completed = modProgress.completed;
              const locked = index > 0 && !levelProgress.modules[index - 1].completed;
              
              const moduleProps = {
                module: moduleData,
                completed: completed,
                locked: locked,
                onComplete: () => completeModule(levelProgress.levelId, modProgress.moduleId),
                courseId: id,
                levelId: levelProgress.levelId,
                moduleId: modProgress.moduleId,
              };

              return (
                <div key={modProgress.moduleId} style={{ marginBottom: 16 }}>
                    {/* ModuleCard handles its own internal lock display */}
                  {moduleData.type !== 'coding' && (
                    <ModuleCard {...moduleProps} />
                  )}

                  {moduleData.type === 'coding' && !locked && (
                    <CodingLinks {...moduleProps} content={moduleData.content} />
                  )}
                    
                    {/* FIX: Move the locked coding module display to ModuleCard.js for consistency */}
                    {moduleData.type === 'coding' && locked && (
                        <ModuleCard {...moduleProps} />
                    )}

                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}