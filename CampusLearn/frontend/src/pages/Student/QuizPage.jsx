import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchQuiz, submitQuiz, resetQuiz } from '../../features/quizzes/quizSlice';
import fullScreenEnforcer from '../../utils/fullScreenEnforcer';
import antiCopy from '../../utils/antiCopy';

export default function QuizPage() {
  const { courseId, levelId, moduleId } = useParams();
  const dispatch = useDispatch();
  const { current, loading, result, error } = useSelector(s => s.quiz);
  const token = useSelector(s => s.auth.token);

  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fullScreenEnforcer();
    antiCopy();
    dispatch(fetchQuiz({ courseId, levelId, moduleId, token }));
    return () => dispatch(resetQuiz());
  }, [dispatch, courseId, levelId, moduleId, token]);

  const handleSubmit = () => dispatch(submitQuiz({ courseId, levelId, moduleId, answers, token }));

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!current) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Quiz: {current.module}</h2>
      {current.questions.map((q, idx) => (
        <div key={idx} style={{ marginBottom: 12 }}>
          <p>{q.question}</p>
          {q.options.map((opt, oidx) => (
            <label key={oidx}>
              <input
                type="radio"
                name={`q${idx}`}
                value={opt}
                checked={answers[idx] === opt}
                onChange={() => setAnswers(a => { const newA = [...a]; newA[idx] = opt; return newA; })}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} style={{ marginTop: 12, background: '#4B6CB7', color: '#fff', padding: '6px 12px' }}>Submit Quiz</button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <p>Score: {result.score}%</p>
          <p>{result.passed ? 'Passed ✅' : 'Failed ❌ (Retake allowed after 24h)'}</p>
        </div>
      )}
    </div>
  );
}
