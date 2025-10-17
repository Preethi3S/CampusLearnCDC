import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import courseApi from '../../api/courseApi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const ACCENT_COLOR = '#4B6CB7'; // Secondary Blue/Accent
const WHITE = '#FFFFFF';
const SOFT_BG = '#F8F8F8';
const DANGER_COLOR = '#E53935'; 

// --- SHARED STYLES ---
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

// --- UTILITY FUNCTIONS ---

// Reorders an array
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

// Moves an item from one list to another (for cross-droppable drag)
const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const newQuizQuestion = () => ({
    question: '',
    options: ['', '', '', ''],
    answer: ''
});

const initialModuleForm = (levelId = '', type = 'resource') => ({
    levelId: levelId,
    title: '',
    type: type,
    content: {
        videoUrl: '',
        quiz: [newQuizQuestion()],
        codingLinks: [''] 
    }
});

// Styles for react-beautiful-dnd (Levels)
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    background: isDragging ? ACCENT_COLOR + '10' : WHITE,
    border: isDragging ? `1px dashed ${ACCENT_COLOR}` : `1px solid ${SOFT_BORDER_COLOR}`,
    boxShadow: isDragging ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.1s ease',
    ...draggableStyle,
});

// Styles for react-beautiful-dnd (Sub-Course Droppable)
const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? ACCENT_COLOR + '10' : 'transparent', 
    minHeight: '20px', 
    transition: 'background-color 0.2s ease',
});

// ------------------------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------------------------
export default function ManageCourse() {
    const { id } = useParams();
    const token = useSelector(s => s.auth.token);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

    // State for creating new content
    const [subCourseTitle, setSubCourseTitle] = useState('');
    const [levelTitle, setLevelTitle] = useState('');
    const [levelDescription, setLevelDescription] = useState('');
    const [targetSubCourseId, setTargetSubCourseId] = useState(''); 
    const [moduleForm, setModuleForm] = useState(initialModuleForm());
    
    // --- Data Fetching ---
    const fetchCourse = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseApi.getCourse(id, token);
            setCourse(data);
            if (data.subCourses?.length > 0) {
                setTargetSubCourseId(data.subCourses[0]._id);
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

    // --- Sub-Course Handlers ---
    const addSubCourse = async () => {
        if (!subCourseTitle.trim()) return;
        setLoading(true);
        try {
            const updated = await courseApi.addSubCourse(id, { title: subCourseTitle }, token);
            setCourse(updated);
            setSubCourseTitle('');
            setError(null);
            if (updated.subCourses?.length > 0) {
                setTargetSubCourseId(updated.subCourses[updated.subCourses.length - 1]._id);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to add sub-course.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveSubCourse = async (subCourseId) => {
        if (!window.confirm('Remove this Sub-Course? All levels inside must be removed or moved first.')) return;
        setLoading(true);
        try {
            const updated = await courseApi.deleteSubCourse(id, subCourseId, token);
            setCourse(updated);
            setError(null);
            if (subCourseId === targetSubCourseId) {
                setTargetSubCourseId(updated.subCourses[0]?._id || '');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to remove sub-course. Ensure it contains no levels.');
        } finally {
            setLoading(false);
        }
    };

    // --- Level Handlers ---
    const addLevel = async () => {
        if (!levelTitle.trim() || !targetSubCourseId) {
            return alert('Level title and target Sub-Course must be selected.');
        }
        setLoading(true);
        try {
            const updated = await courseApi.addLevel(
                id, 
                { subCourseId: targetSubCourseId, title: levelTitle, description: levelDescription }, 
                token
            );
            setCourse(updated);
            setLevelTitle('');
            setLevelDescription('');
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to add level.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveLevel = async (subCourseId, levelId) => {
        if (!window.confirm('Remove this level? This action cannot be undone.')) return;
        setLoading(true);
        try {
            const updated = await courseApi.removeLevel(id, subCourseId, levelId, token);
            setCourse(updated);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to remove level.');
        } finally {
            setLoading(false);
        }
    };

    // --- Module Handlers ---
    const addModule = async () => {
        const { levelId, title, type, content } = moduleForm;
        if (!title || !levelId || !targetSubCourseId) return alert('Module title, Level, and Sub-Course must be selected.');

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
        setLoading(true);

        try {
            const updated = await courseApi.addModule(id, targetSubCourseId, levelId, payload, token);
            setCourse(updated);
            setModuleForm(initialModuleForm(levelId));
            setError(null);
        } catch (err) {
            console.error(err);
            setError(`Failed to add module: ${err.response?.data?.message || 'Server error'}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveModule = async (subCourseId, levelId, moduleId) => {
        if (!window.confirm('Remove this module? This action cannot be undone.')) return;
        try {
            setLoading(true);
            const updated = await courseApi.removeModule(id, subCourseId, levelId, moduleId, token);
            setCourse(updated);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to remove module.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- Quiz/Coding Form Handlers ---
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

    // --- Drag and Drop Handler (Levels between Sub-Courses) ---
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const sourceSubCourseId = source.droppableId;
        const destinationSubCourseId = destination.droppableId;
        const sourceSubCourse = course.subCourses.find(sc => sc._id === sourceSubCourseId);
        const destinationSubCourse = course.subCourses.find(sc => sc._id === destinationSubCourseId);
        
        if (!sourceSubCourse || !destinationSubCourse) return;

        let apiCallPromise;
        
        // 1. Drag within the SAME Sub-Course (Reorder)
        if (sourceSubCourseId === destinationSubCourseId) {
            const reorderedLevels = reorder(
                sourceSubCourse.levels,
                source.index,
                destination.index
            );

            // Optimistic UI Update
            const newCourseState = {
                ...course,
                subCourses: course.subCourses.map(sc => 
                    sc._id === sourceSubCourseId ? { ...sc, levels: reorderedLevels } : sc
                )
            };
            setCourse(newCourseState);

            // API Call
            const levelIds = reorderedLevels.map(l => l._id);
            apiCallPromise = courseApi.reorderLevels(id, sourceSubCourseId, levelIds, token);
            
        } 
        // 2. Drag between DIFFERENT Sub-Courses (Move)
        else {
            const movedLevels = move(
                sourceSubCourse.levels,
                destinationSubCourse.levels,
                source,
                destination
            );

            // Optimistic UI Update
            const newCourseState = {
                ...course,
                subCourses: course.subCourses.map(sc => {
                    if (sc._id === sourceSubCourseId) return { ...sc, levels: movedLevels[sourceSubCourseId] };
                    if (sc._id === destinationSubCourseId) return { ...sc, levels: movedLevels[destinationSubCourseId] };
                    return sc;
                })
            };
            setCourse(newCourseState);

            // API Call
            apiCallPromise = courseApi.moveLevel(
                id, 
                draggableId, // Level ID
                destinationSubCourseId, 
                destination.index, // New index
                token
            );
        }

        // 3. Handle API result
        try {
            const updatedCourse = await apiCallPromise;
            setCourse(updatedCourse); 
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to save course structure. State reverted.');
            fetchCourse(); 
        }
    };


    if (loading || !course || !course.subCourses) return <p>Loading...</p>;

    const currentTargetSubCourse = course.subCourses.find(sc => sc._id === targetSubCourseId);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ padding: 20, background: SOFT_BG, minHeight: '100vh' }}>
                <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10 }}>
                    Manage Course: {course.title}
                </h2>
                {error && <p style={{ color: DANGER_COLOR }}>{error}</p>}
                <hr style={{ borderColor: SOFT_BORDER_COLOR }} />

                {/* --- Add Sub-Course Section --- */}
                <div style={{ marginBottom: 30, padding: 20, background: WHITE, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ color: PRIMARY_COLOR }}>Add New Sub-Course/Section</h3>
                    <input
                        placeholder="Sub-Course Title (e.g., Fundamentals, Advanced Topics)"
                        value={subCourseTitle}
                        onChange={e => setSubCourseTitle(e.target.value)}
                        style={{ ...inputStyle, width: 'calc(70% - 4px)', display: 'inline-block', marginRight: 8, marginBottom: 0 }}
                    />
                    <button onClick={addSubCourse} style={{ ...buttonPrimaryStyle, padding: '10px 18px' }}>+ Add Sub-Course</button>
                </div>
                
                {/* --- Add Level Section (With Sub-Course Selector) --- */}
                <div style={{ marginBottom: 30, padding: 20, background: WHITE, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ color: PRIMARY_COLOR }}>Add New Level (Content Unit)</h3>
                    
                    <label style={{ fontWeight: 'bold', display: 'block', marginTop: 10 }}>Add to Sub-Course:</label>
                    <select
                        value={targetSubCourseId}
                        onChange={e => setTargetSubCourseId(e.target.value)}
                        style={{ ...inputStyle, width: '100%', marginBottom: 15 }}
                        disabled={course.subCourses.length === 0}
                    >
                        {course.subCourses.map(sc => (
                            <option key={sc._id} value={sc._id}>{sc.title}</option>
                        ))}
                    </select>
                    
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
                    
                    <button 
                        onClick={addLevel} 
                        disabled={!targetSubCourseId || loading}
                        style={buttonPrimaryStyle}
                    >
                        + Add Level to {currentTargetSubCourse ? currentTargetSubCourse.title : '...'}
                    </button>
                </div>
                
                <hr style={{ borderColor: SOFT_BORDER_COLOR }} />
                
                {/* --- MAIN LIST: Sub-Courses as Containers --- */}
                {course.subCourses.map(subCourse => (
                    <div key={subCourse._id} style={{ border: `1px solid ${ACCENT_COLOR}`, padding: 20, marginBottom: 20, borderRadius: 8, background: WHITE, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        
                        {/* Sub-Course Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${ACCENT_COLOR}`, paddingBottom: 10, marginBottom: 15 }}>
                            <h3 style={{ color: PRIMARY_COLOR, margin: 0 }}>
                                Sub-Course: {subCourse.title} 
                                <span style={{ color: '#666', fontSize: '0.8em', marginLeft: 10 }}>({subCourse.levels.length} Levels)</span>
                            </h3>
                            <button onClick={() => handleRemoveSubCourse(subCourse._id)} style={{ ...buttonDangerStyle, padding: '6px 12px', marginLeft: 0 }}>
                                Remove Sub-Course
                            </button>
                        </div>

                        {/* Levels List (Droppable) */}
                        <Droppable droppableId={subCourse._id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {subCourse.levels.map((level, levelIndex) => (
                                        // Level Item (Draggable)
                                        <Draggable key={level._id} draggableId={level._id} index={levelIndex}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ 
                                                        padding: 15, 
                                                        borderLeft: `4px solid ${PRIMARY_COLOR}`, 
                                                        margin: '10px 0', 
                                                        background: WHITE, 
                                                        borderRadius: 4, 
                                                        ...getItemStyle(snapshot.isDragging, provided.draggableProps.style) 
                                                    }}
                                                >
                                                    <LevelContent 
                                                        level={level} 
                                                        levelIndex={levelIndex} 
                                                        subCourseId={subCourse._id}
                                                        
                                                        // --- PASS MODULE FORM STATE/SETTER ---
                                                        moduleForm={moduleForm}
                                                        setModuleForm={setModuleForm}
                                                        
                                                        // --- PASS HANDLERS EXPLICITLY ---
                                                        handleQuestionChange={handleQuestionChange}
                                                        handleOptionChange={handleOptionChange}
                                                        handleRemoveQuestion={handleRemoveQuestion}
                                                        handleAddOption={handleAddOption}
                                                        handleLinkChange={handleLinkChange}
                                                        handleRemoveLink={handleRemoveLink}
                                                        handleAddLink={handleAddLink}
                                                        addModule={addModule}
                                                        handleRemoveLevel={handleRemoveLevel}
                                                        handleRemoveModule={handleRemoveModule}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    {subCourse.levels.length === 0 && !snapshot.isDraggingOver && (
                                        <p style={{ color: '#999', padding: 20, textAlign: 'center' }}>
                                            Drag levels here or add a new level above.
                                        </p>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}

// ------------------------------------------------------------------------------------
// LevelContent Component (Handles Module Forms and Lists)
// ------------------------------------------------------------------------------------
const LevelContent = ({ 
    level, 
    levelIndex, 
    subCourseId, 
    moduleForm, 
    setModuleForm, 
    
    // Explicitly received handler functions 
    handleRemoveLevel, 
    handleRemoveModule, 
    addModule,

    // Quiz/Coding handlers
    handleQuestionChange,
    handleOptionChange,
    handleRemoveQuestion,
    handleAddOption,
    handleLinkChange,
    handleRemoveLink,
    handleAddLink,
}) => {
    
    // Find the current level's module form data if it matches the current global form's target
    const isModuleFormActive = moduleForm.levelId === level._id;
    const currentModuleForm = isModuleFormActive ? moduleForm : initialModuleForm(level._id);

    // Wrapper to fix the original error: passes subCourseId and levelId correctly
    const handleRemoveLevelWrapper = () => handleRemoveLevel(subCourseId, level._id); 

    // Helper to call module remove with all necessary IDs
    const handleRemoveModuleWrapper = (moduleId) => {
        handleRemoveModule(subCourseId, level._id, moduleId);
    };

    return (
        <div>
            {/* Level Header/Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h4 style={{ color: ACCENT_COLOR, margin: 0, fontWeight: 'bold' }}>
                    <span style={{ marginRight: 8, color: PRIMARY_COLOR, cursor: 'grab', fontWeight: 'bold' }}>&#x2261;</span> 
                    {levelIndex + 1}. {level.title} 
                </h4>
                <button onClick={handleRemoveLevelWrapper} style={buttonDangerStyle}>
                    Remove Level
                </button>
            </div>
            {level.description && <p style={{ color: '#555', fontSize: '0.9em', marginTop: 5, marginBottom: 15 }}>{level.description}</p>}

            {/* --- Add Module Form --- */}
            <div style={{ padding: 15, border: `1px dashed ${ACCENT_COLOR}50`, borderRadius: 6, background: SOFT_BG }}>
                <h5 style={{ color: PRIMARY_COLOR, marginBottom: 10 }}>Add Module to **{level.title}**</h5>
                
                {/* Module Title and Type */}
                <input
                    placeholder="Module title"
                    value={isModuleFormActive ? moduleForm.title : ''}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, levelId: level._id, title: e.target.value }))}
                    onFocus={() => { if(!isModuleFormActive) setModuleForm(initialModuleForm(level._id)); }}
                    style={{ ...inputStyle, width: '40%', display: 'inline-block', marginRight: 8, marginBottom: 0 }}
                />
                <select
                    value={isModuleFormActive ? moduleForm.type : 'resource'}
                    onChange={(e) => setModuleForm(initialModuleForm(level._id, e.target.value))}
                    style={{ ...inputStyle, width: '30%', display: 'inline-block', marginRight: 8, marginBottom: 0 }}
                >
                    <option value="resource">Resource (YouTube)</option>
                    <option value="quiz">Quiz</option>
                    <option value="coding">Coding</option>
                </select>
                <button 
                    onClick={addModule} 
                    style={{ ...buttonPrimaryStyle, padding: '8px 15px' }}
                >
                    + Add Module
                </button>
                
                {/* --- Conditional Content Forms --- */}
                {isModuleFormActive && currentModuleForm.type === 'resource' && (
                    <input
                        placeholder="YouTube Video URL"
                        value={currentModuleForm.content.videoUrl}
                        onChange={e => setModuleForm({ ...currentModuleForm, content: { ...currentModuleForm.content, videoUrl: e.target.value } })}
                        style={{ ...inputStyle, marginTop: 15 }}
                    />
                )}
                
                {/* Quiz Content */}
                {isModuleFormActive && currentModuleForm.type === 'quiz' && (
                    <div style={{ marginTop: 15, padding: 10, border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, background: WHITE }}>
                        <p>Quiz Questions (<span style={{ color: PRIMARY_COLOR }}>{currentModuleForm.content.quiz.length}</span>)</p>
                        {currentModuleForm.content.quiz.map((q, idx) => (
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
                            onClick={() => setModuleForm({ ...currentModuleForm, content: { ...currentModuleForm.content, quiz: [...currentModuleForm.content.quiz, newQuizQuestion()] } })}
                            style={{ ...buttonPrimaryStyle, background: ACCENT_COLOR, padding: '8px 15px', marginTop: 10 }}
                        >
                            + Add New Question
                        </button>
                    </div>
                )}

                {/* Coding Links Content */}
                {isModuleFormActive && currentModuleForm.type === 'coding' && (
                    <div style={{ marginTop: 15, padding: 10, border: `1px solid ${SOFT_BORDER_COLOR}`, borderRadius: 6, background: WHITE }}>
                        <h5>External Coding Problem Links</h5>
                        {(currentModuleForm.content.codingLinks || []).map((link, lidx) => (
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
                    <li key={mod._id} style={{ 
                        padding: 10, borderLeft: `4px solid ${SOFT_BORDER_COLOR}`, 
                        margin: '8px 0', background: SOFT_BG, borderRadius: 4, 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                        <div>
                            <strong>{mod.title}</strong> (<span style={{ color: PRIMARY_COLOR, fontWeight: 500 }}>{mod.type}</span>)
                        </div>
                        <button onClick={() => handleRemoveModuleWrapper(mod._id)} style={buttonDangerStyle}>Remove Module</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};