import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchQuiz, submitQuiz, resetQuiz } from '../../features/quizzes/quizSlice';

// --- THEME CONSTANTS ---
const PRIMARY_COLOR = '#473E7A'; // MongoDB Purple (Dark)
const ACCENT_COLOR = '#4B6CB7'; // Secondary Blue/Accent (Buttons)
const SOFT_BORDER_COLOR = '#EBEBEB'; 
const SOFT_BG = '#F8F8F8';
const WHITE = '#FFFFFF';
const SUCCESS_COLOR = '#10B981'; // Teal/Green for passed status
const FAILURE_COLOR = '#f44336'; // Red for failed status

// Shared button style
const buttonPrimaryStyle = {
    background: ACCENT_COLOR,
    color: WHITE,
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 16,
    transition: 'background-color 0.2s',
};

export default function QuizPage() {
 const { courseId, levelId, moduleId } = useParams();
 const dispatch = useDispatch();
 const { current, loading, result, error } = useSelector(s => s.quiz);
 const token = useSelector(s => s.auth.token);

 const [answers, setAnswers] = useState([]);
 const [isStarted, setIsStarted] = useState(false); 

 const fetchAndSetupQuiz = useCallback(() => {
  dispatch(fetchQuiz({ courseId, levelId, moduleId, token }));
 }, [dispatch, courseId, levelId, moduleId, token]);

 useEffect(() => {
  fetchAndSetupQuiz();
  return () => dispatch(resetQuiz());
 }, [fetchAndSetupQuiz, dispatch]);

 // Update local answers state when the quiz loads
 useEffect(() => {
   if (current && current.questions && !isStarted) {
     setAnswers(new Array(current.questions.length).fill('')); 
   }
 }, [current, isStarted]);

 const handleSubmit = () => {
  if (answers.some(a => a === '')) {
    return alert('Please answer all questions before submitting.');
  }
  dispatch(submitQuiz({ courseId, levelId, moduleId, answers, token }));
  setIsStarted(false); // End the quiz session
 };
 
 const handleStartQuiz = () => {
   if (current?.questions?.length) {
     setAnswers(new Array(current.questions.length).fill(''));
     setIsStarted(true);
   } else {
     alert('Cannot start: No questions available.');
   }
 };

 if (loading) return <p>Loading quiz...</p>;
 if (error) return <p style={{ color: DANGER_COLOR }}>Error: {error}</p>;
 if (!current || !current.questions) return <p>No quiz found for this module.</p>;

 const quizTitle = current.moduleTitle || `Module Quiz (${moduleId.substring(0, 4)}...)`;
 const canStartQuiz = !result || (result && !result.passed); 

 return (
  <div style={{ padding: 30, background: SOFT_BG, minHeight: '100vh' }}>
   <h2 style={{ color: PRIMARY_COLOR, borderBottom: `2px solid ${SOFT_BORDER_COLOR}`, paddingBottom: 10, marginBottom: 20 }}>
      Quiz: {quizTitle}
    </h2> 
   
   {/* 1. Results are shown first if available */}
   {result && (
    <div style={{ 
        marginTop: 16, 
        padding: 20, 
        border: `2px solid ${result.passed ? SUCCESS_COLOR : FAILURE_COLOR}`, 
        borderRadius: 8,
        background: WHITE,
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
     }}>
     <h3 style={{ color: PRIMARY_COLOR, marginTop: 0 }}>Results</h3>
     <p style={{ fontWeight: 'bold' }}>Score: <span style={{ color: result.passed ? SUCCESS_COLOR : FAILURE_COLOR }}>{result.score.toFixed(1)}%</span></p>
     <p style={{ color: result.passed ? SUCCESS_COLOR : FAILURE_COLOR }}>
          {result.passed ? 'Passed ✅' : 'Failed ❌ (Retake allowed after 24 hours)'}
      </p>
    </div>
   )}

   {/* 2. The main "Start/Submit" Logic */}
   {canStartQuiz ? ( 
     <>
       {!isStarted ? (
         // Display the start button
         <div style={{ 
              marginTop: 20, 
              padding: 20, 
              border: `1px solid ${SOFT_BORDER_COLOR}`, 
              borderRadius: 8,
              background: WHITE
            }}>
           <p style={{ fontSize: 16, marginBottom: 15 }}>This quiz has <span style={{ fontWeight: 'bold', color: PRIMARY_COLOR }}>{current.questions.length}</span> questions.</p>
           <button 
             onClick={handleStartQuiz} 
             style={{ 
                  ...buttonPrimaryStyle, 
                  background: SUCCESS_COLOR // Use success color for starting/retrying
               }}
           >
             {result && !result.passed ? 'Try Again' : 'Start Quiz'}
           </button>
         </div>
       ) : (
         // Display questions and submit button once started
         <>
           {current.questions.map((q, idx) => (
             <div key={q._id || idx} style={{ 
                  marginBottom: 15, 
                  padding: 15, 
                  border: `1px solid ${SOFT_BORDER_COLOR}`, 
                  borderRadius: 8,
                  background: WHITE
                }}>
              <p style={{ fontWeight: 'bold', marginBottom: 10, color: PRIMARY_COLOR }}>Question {idx + 1}: {q.text}</p> 
               
               {Array.isArray(q.options) && q.options.map((opt, oidx) => (
                 <label key={oidx} style={{ display: 'block', marginLeft: 10, padding: '4px 0', cursor: 'pointer' }}>
                   <input
                     type="radio"
                     name={`q${idx}`}
                     value={opt}
                     checked={answers[idx] === opt}
                     onChange={() => setAnswers(a => { const newA = [...a]; newA[idx] = opt; return newA; })}
                     style={{ marginRight: 8 }}
                   />
                   {opt}
                 </label>
               ))}
             </div>
           ))}
           <button 
             onClick={handleSubmit} 
             style={buttonPrimaryStyle}
           >
             Submit Quiz
           </button>
         </>
       )}
     </>
   ) : null}
  </div>
 );
}