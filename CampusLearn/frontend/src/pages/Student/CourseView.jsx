import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import progressApi from '../../api/progressApi';
import ModuleCard from '../../components/ModuleCard';
import CodingLinks from '../../components/CodingLinks';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A';
const SOFT_BORDER_COLOR = '#EBEBEB';
const SOFT_BACKGROUND = '#F8F8F8';
const WHITE = '#FFFFFF';
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981';

export default function CourseView() {
  const { id } = useParams();
  const token = useSelector(s => s.auth.token);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [completing, setCompleting] = useState(false);

  // --- Fetch Progress ---
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

  // --- Complete Module ---
  const completeModule = async (levelId, moduleId, evidence = undefined) => {
    try {
      setCompleting(true);
      await progressApi.completeModule(id, levelId, moduleId, token, evidence);
      fetchProgress();
    } catch (err) {
      console.error('complete module error', err);
      alert(err.response?.data?.message || 'Error completing module.');
    } finally {
      setCompleting(false);
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // --- Expand unlocked levels by default ---
  useEffect(() => {
    if (!progress) return;
    const s = new Set();
    let allPrevComplete = true;
    for (const lp of progress.levels) {
      if (allPrevComplete) {
        s.add(String(lp.levelId));
      }
      const completedInLevel = lp.modules.every(m => m.completed);
      if (!completedInLevel) allPrevComplete = false;
    }
    setExpandedLevels(s);
  }, [progress]);

  // --- Toggle level expand/collapse ---
  const toggleLevel = (levelId) => {
    setExpandedLevels(prev => {
      const next = new Set(prev);
      const key = String(levelId);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // --- Progress Computation ---
  const { totalModules, completedModules, percentComplete, nextModuleHint } = useMemo(() => {
    if (!progress) return { totalModules: 0, completedModules: 0, percentComplete: 0, nextModuleHint: null };
    const courseLevels = progress.course.levels || [];
    let total = 0;
    let completed = 0;
    let next = null;
    for (const lp of progress.levels) {
      total += lp.modules.length;
      for (const mp of lp.modules) {
        if (mp.completed) completed += 1;
        else if (!next) {
          const levelData = courseLevels.find(l => String(l._id) === String(lp.levelId));
          const moduleData = levelData?.modules?.find(m => String(m._id) === String(mp.moduleId));
          next = moduleData ? { levelTitle: levelData.title, moduleTitle: moduleData.title, levelId: lp.levelId, moduleId: mp.moduleId } : null;
        }
      }
    }
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { totalModules: total, completedModules: completed, percentComplete: pct, nextModuleHint: next };
  }, [progress]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!progress) return <p>No progress data found.</p>;

  const courseLevels = progress.course.levels || [];

  return (
    <div style={{ padding: '20px', backgroundColor: SOFT_BACKGROUND, minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 8 }}>
            {progress.course.title}
          </h1>
          <p style={{ color: MUTE_GRAY, marginBottom: 6 }}>{progress.course.description}</p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <div style={{ width: 220, height: 10, background: '#eee', borderRadius: 999 }}>
              <div style={{ width: `${percentComplete}%`, height: '100%', background: SUCCESS_COLOR, borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 13, color: MUTE_GRAY }}>
              {percentComplete}% complete ({completedModules}/{totalModules})
            </div>
          </div>
        </div>

        <div style={{ minWidth: 220, textAlign: 'right' }}>
          {nextModuleHint ? (
            <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, color: MUTE_GRAY }}>Next up</div>
              <div style={{ fontWeight: 700, color: PRIMARY_COLOR }}>{nextModuleHint.moduleTitle}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>{nextModuleHint.levelTitle}</div>
            </div>
          ) : (
            <div style={{ padding: 12, background: WHITE, borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 12, color: MUTE_GRAY }}>All done 🎉</div>
              <div style={{ fontWeight: 700, color: PRIMARY_COLOR }}>You completed this course</div>
            </div>
          )}
        </div>
      </div>

      {/* Levels Section */}
      <div style={{ marginTop: 20 }}>
        {(() => {
          let allPreviousLevelsCompleted = true;

          return progress.levels.map((levelProgress) => {
            const courseLevel = courseLevels.find(l => String(l._id) === String(levelProgress.levelId));
            if (!courseLevel)
              return <p key={levelProgress.levelId} style={{ color: 'orange' }}>Level data missing for ID: {String(levelProgress.levelId)}</p>;

            const allModulesCompletedInCurrentLevel = levelProgress.modules.every(mod => mod.completed);
            const levelIsLocked = !allPreviousLevelsCompleted;
            if (!allModulesCompletedInCurrentLevel) allPreviousLevelsCompleted = false;

            const levelKey = String(levelProgress.levelId);
            const isExpanded = expandedLevels.has(levelKey) && !levelIsLocked;

            if (levelIsLocked) {
              return (
                <div key={levelKey} style={{
                  marginBottom: 24, padding: 20, border: `1px solid ${SOFT_BORDER_COLOR}`,
                  borderRadius: 8, background: WHITE, opacity: 0.7, color: MUTE_GRAY,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ marginTop: 0 }}>{courseLevel.title} - Locked 🔒</h3>
                  <p style={{ margin: 0, fontSize: '0.9em' }}>Complete the previous level to unlock this content.</p>
                </div>
              );
            }

            // Unlocked Level
            return (
              <div key={levelKey} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: PRIMARY_COLOR }}>{courseLevel.title}</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {allModulesCompletedInCurrentLevel && <div style={{ color: SUCCESS_COLOR }}>Completed ✅</div>}
                    <button
                      onClick={() => toggleLevel(levelKey)}
                      style={{
                        padding: '6px 10px', borderRadius: 6, border: '1px solid #e6e6e6',
                        background: '#fff', cursor: 'pointer'
                      }}
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    marginTop: 12, padding: 20, border: `1px solid ${SOFT_BORDER_COLOR}`,
                    borderRadius: 8, background: WHITE, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    {levelProgress.modules.map((modProgress, index) => {
                      const moduleData = courseLevel.modules.find(m => String(m._id) === String(modProgress.moduleId));
                      if (!moduleData)
                        return <p key={modProgress.moduleId} style={{ color: 'orange' }}>Module data missing for ID: {String(modProgress.moduleId)}</p>;

                      const completed = modProgress.completed;
                      const lockedModule = index > 0 && !levelProgress.modules[index - 1].completed;

                      // ✅ Detect YouTube resource
                      const isVideoResource = moduleData.type === 'resource' && moduleData.content?.url?.includes('youtube.com');

                      const moduleProps = {
                        module: moduleData,
                        completed,
                        locked: lockedModule,
                        onComplete: (evidence) => completeModule(levelProgress.levelId, modProgress.moduleId, evidence),
                        onVideoEnd: () => !completed && completeModule(levelProgress.levelId, modProgress.moduleId),
                        courseId: id,
                        levelId: levelProgress.levelId,
                        moduleId: modProgress.moduleId,
                        isRestrictedVideo: isVideoResource,
                      };

                      return (
                        <div key={modProgress.moduleId} style={{ marginBottom: 16 }}>
                          {moduleData.type !== 'coding' && <ModuleCard {...moduleProps} />}
                          {moduleData.type === 'coding' && !lockedModule && <CodingLinks {...moduleProps} content={moduleData.content} />}
                          {moduleData.type === 'coding' && lockedModule && <ModuleCard {...moduleProps} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
