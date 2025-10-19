import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import progressApi from '../../api/progressApi';
import ModuleCard from '../../components/ModuleCard';
import CodingLinks from '../../components/CodingLinks'; // Assuming this component exists

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A';
const SOFT_BORDER_COLOR = '#EBEBEB';
const SOFT_BACKGROUND = '#F8F8F8';
const WHITE = '#FFFFFF';
const MUTE_GRAY = '#6B7280';
const SUCCESS_COLOR = '#10B981';

// ----------------------------------------------------------------------
// UTILITY: Flatten Progress and Course Data for Easier Lookup and Iteration
// ----------------------------------------------------------------------
const flattenCourseData = (course) => {
    const flattened = [];
    if (!course || !course.subCourses) return flattened;

    course.subCourses.forEach((subCourse) => {
        subCourse.levels.forEach((level) => {
            flattened.push({
                subCourseId: subCourse._id,
                subCourseTitle: subCourse.title,
                ...level,
            });
        });
    });
    return flattened;
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function CourseView() {
    const { id } = useParams();
    const token = useSelector(s => s.auth.token);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedLevels, setExpandedLevels] = useState(new Set());
    const [completing, setCompleting] = useState(false);
    const userId = useSelector(s => s.auth.userId);

    // Flattened structure for easy access to all levels, regardless of nesting
    const allCourseLevels = useMemo(() => {
        if (!progress?.course) return [];
        return flattenCourseData(progress.course);
    }, [progress]);

    // --- Fetch Progress ---
    const fetchProgress = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE: The API MUST return the new nested structure (course.subCourses[].levels)
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
            // NOTE: The API call needs the subCourseId, but the progress logic doesn't easily provide it here.
            // We'll rely on the backend progress system to infer the subCourseId from the levelId.
            // A more robust solution involves finding the subCourseId client-side first.
            
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

    // --- Expand unlocked levels logic (Updated for sub-courses) ---
    useEffect(() => {
        if (!progress || allCourseLevels.length === 0) return;
        const s = new Set();
        let allPrevComplete = true;

        // Iterate through progress in the order of the flattened course structure
        for (const courseLevel of allCourseLevels) {
            const progressLevel = progress.levels.find(lp => String(lp.levelId) === String(courseLevel._id));
            
            if (progressLevel && allPrevComplete) {
                s.add(String(progressLevel.levelId));
            }

            // Determine if current level is complete
            const completedInLevel = progressLevel?.modules.every(m => m.completed) ?? false;
            
            // If any module in this level is incomplete, set flag to lock the next level
            if (!completedInLevel) {
                allPrevComplete = false;
            }
        }
        setExpandedLevels(s);
    }, [progress, allCourseLevels]);

    // --- Toggle level expand/collapse (No change) ---
    const toggleLevel = (levelId) => {
        setExpandedLevels(prev => {
            const next = new Set(prev);
            const key = String(levelId);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // --- Progress Computation (Updated for sub-courses/flattened data) ---
    const { totalModules, completedModules, percentComplete, nextModuleHint } = useMemo(() => {
        if (!progress || allCourseLevels.length === 0) return { totalModules: 0, completedModules: 0, percentComplete: 0, nextModuleHint: null };
        
        let total = 0;
        let completed = 0;
        let next = null;
        
        // Use the flattened structure to maintain logical order
        for (const courseLevel of allCourseLevels) {
            const levelProgress = progress.levels.find(lp => String(lp.levelId) === String(courseLevel._id));
            const modules = courseLevel.modules || [];
            
            total += modules.length;

            for (const moduleData of modules) {
                const modProgress = levelProgress?.modules.find(mp => String(mp.moduleId) === String(moduleData._id));
                
                if (modProgress?.completed) {
                    completed += 1;
                } else if (!next) {
                    // Found the next incomplete module
                    next = { 
                        levelTitle: courseLevel.title, 
                        moduleTitle: moduleData.title, 
                        levelId: courseLevel._id, 
                        moduleId: moduleData._id 
                    };
                }
            }
        }
        
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { totalModules: total, completedModules: completed, percentComplete: pct, nextModuleHint: next };
    }, [progress, allCourseLevels]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!progress) return <p>No progress data found.</p>;

    // Use a variable to track locking across all levels/sub-courses
    let allPreviousLevelsCompleted = true;
    let currentSubCourseId = null;

    // --- RENDER ---

    return (
        <div style={{ padding: '20px', backgroundColor: SOFT_BACKGROUND, minHeight: '100vh' }}>
            {/* Header Section (Unchanged) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                {/* ... (Header content: Title, Description, Progress Bar, Next Module Hint) ... */}
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


            {/* ----------------------------------------------------------- */}
            {/* --- CORE FIX: Iterate Nested Sub-Courses and Levels --- */}
            {/* ----------------------------------------------------------- */}
            <div style={{ marginTop: 30 }}>
                {progress.course.subCourses.map((subCourse) => {
                    // Check if the current sub-course ID has changed
                    const showSubCourseHeader = subCourse._id !== currentSubCourseId;
                    currentSubCourseId = subCourse._id; // Update tracker
                    
                    return (
                        <div key={subCourse._id} style={{ marginBottom: 40 }}>
                            {/* Sub-Course Header */}
                            {showSubCourseHeader && (
                                <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${PRIMARY_COLOR}50`, paddingBottom: 10, marginBottom: 20 }}>
                                    {subCourse.title}
                                </h2>
                            )}

                            {/* Levels within the current Sub-Course */}
                            {subCourse.levels.map((courseLevel) => {
                                // Find the corresponding progress data for this level
                                const levelProgress = progress.levels.find(lp => String(lp.levelId) === String(courseLevel._id));
                                
                                // Fallback: If progress data is missing (shouldn't happen), assume empty progress
                                if (!levelProgress) {
                                    console.warn(`Progress data missing for Level ID: ${courseLevel._id}`);
                                    return null; 
                                }

                                const allModulesCompletedInCurrentLevel = levelProgress.modules.every(mod => mod.completed);
                                const levelIsLocked = !allPreviousLevelsCompleted;

                                // Update locking flag for the NEXT level
                                if (!allModulesCompletedInCurrentLevel) allPreviousLevelsCompleted = false;

                                const levelKey = String(courseLevel._id);
                                const isExpanded = expandedLevels.has(levelKey) && !levelIsLocked;

                                // --- Locked Level Render ---
                                if (levelIsLocked) {
                                    return (
                                        <div key={levelKey} style={{
                                            marginBottom: 24, padding: 20, border: `1px solid ${SOFT_BORDER_COLOR}`,
                                            borderRadius: 8, background: WHITE, opacity: 0.7, color: MUTE_GRAY,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}>
                                            <h3 style={{ marginTop: 0 }}>{courseLevel.title} - Locked 🔒</h3>
                                            <p style={{ margin: 0, fontSize: '0.9em' }}>Complete the previous content to unlock this section.</p>
                                        </div>
                                    );
                                }

                                // --- Unlocked Level Render ---
                                return (
                                    <div key={levelKey} style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10 }}>
                                            <h3 style={{ margin: 0, color: PRIMARY_COLOR }}>{courseLevel.title}</h3>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                {allModulesCompletedInCurrentLevel && <div style={{ color: SUCCESS_COLOR }}>Completed ✅</div>}
                                                <button
                                                    onClick={() => toggleLevel(levelKey)}
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 6, border: '1px solid #e6e6e6',
                                                        background: WHITE, cursor: 'pointer'
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
                                                {courseLevel.modules.map((moduleData, index) => {
                                                    const modProgress = levelProgress.modules.find(mp => String(mp.moduleId) === String(moduleData._id));
                                                    
                                                    // Ensure progress status exists
                                                    const completed = modProgress?.completed ?? false;

                                                    // Locking logic: Module is locked if it's not the first AND the previous module is incomplete
                                                    const lockedModule = index > 0 && !levelProgress.modules.find((_, i) => i === index - 1)?.completed;
                                                    
                                                    // Determine if it's a YouTube resource for strict enforcement
                                                    const isVideoResource = moduleData.type === 'resource' && moduleData.content?.url?.includes('youtube.com');

                                                    const moduleProps = {
                                                        module: moduleData,
                                                        completed,
                                                        locked: lockedModule,
                                                        onComplete: (evidence) => completeModule(courseLevel._id, moduleData._id, evidence),
                                                        onVideoEnd: () => !completed && completeModule(courseLevel._id, moduleData._id),
                                                        courseId: id,
                                                        levelId: courseLevel._id,
                                                        moduleId: moduleData._id,
                                                        isRestrictedVideo: isVideoResource,
                                                        // Pass subCourseId if needed by ModuleCard or CodingLinks
                                                        subCourseId: subCourse._id,
                                                    };

                                                    return (
                                                        <div key={moduleData._id} style={{ marginBottom: 16 }}>
                                                            {moduleData.type === 'coding' && !lockedModule ? (
                                                                <CodingLinks {...moduleProps} content={moduleData.content} />
                                                            ) : (
                                                                <ModuleCard {...moduleProps} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}