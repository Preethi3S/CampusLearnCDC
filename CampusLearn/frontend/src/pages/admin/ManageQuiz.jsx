import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import quizApi from '../../api/quizApi';
import { useSelector } from 'react-redux';

export default function ManageQuiz() {
  const { courseId, levelId, moduleId } = useParams();
  const token = useSelector(s => s.auth.token);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: quizApi.getQuiz is expected to return quiz object, 
      // which might contain an empty 'questions' array if not configured.
      const q = await quizApi.getQuiz(courseId, levelId, moduleId, token);
      setQuestions(q.questions || []);
    } catch (e) {
      console.error(e);
      // If quiz is not found (404), start with an empty array to allow creation
      if (e.response && e.response.status === 404) {
          setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
      } else {
          setError('Failed to fetch quiz.');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, levelId, moduleId, token]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleAdd = () => {
    // Initialize with 4 options for a typical multiple-choice quiz
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };
  
  const handleRemove = (i) => {
    if (!window.confirm('Delete this question?')) return;
    setQuestions(questions.filter((_, index) => index !== i));
  };

  const handleSave = async () => {
    // Simple validation
    if (questions.some(q => !q.question || !q.answer || q.options.filter(o => o.trim()).length < 2)) {
        return alert('All questions must have a title, correct answer, and at least two options.');
    }

    try {
        await quizApi.updateQuiz(courseId, levelId, moduleId, questions, token);
        alert('Quiz saved successfully!');
        setError(null);
    } catch (e) {
        console.error(e);
        setError('Failed to save quiz. Check console for details.');
    }
  };
  
  if (loading) return <p>Loading quiz management...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Quiz</h2>
      <p>Course ID: {courseId} | Level ID: {levelId} | Module ID: {moduleId}</p>
      
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc' }}>
          <p style={{ fontWeight: 'bold' }}>Question {i + 1}</p>
          <input
            placeholder="Question text"
            value={q.question}
            onChange={e => {
              const newQs = [...questions];
              newQs[i].question = e.target.value;
              setQuestions(newQs);
            }}
            style={{ display: 'block', width: '90%', marginBottom: 8 }}
          />
          
          <label style={{ display: 'block', fontWeight: 'bold' }}>Options:</label>
          {q.options.map((opt, oi) => (
            <input
              key={oi}
              placeholder={`Option ${oi + 1}`}
              value={opt}
              onChange={e => {
                const newQs = [...questions];
                newQs[i].options[oi] = e.target.value;
                setQuestions(newQs);
              }}
              style={{ display: 'block', width: '80%', marginLeft: 10, marginBottom: 2 }}
            />
          ))}
          
          <input
            placeholder="Correct Answer (must match one option's text)"
            value={q.answer}
            onChange={e => {
              const newQs = [...questions];
              newQs[i].answer = e.target.value;
              setQuestions(newQs);
            }}
            style={{ display: 'block', width: '90%', marginTop: 8 }}
          />
          <button onClick={() => handleRemove(i)} style={{ marginTop: 8, background: '#f44336', color: 'white' }}>
            Remove Question
          </button>
        </div>
      ))}
      <button onClick={handleAdd}>+ Add Question</button>
      <button onClick={handleSave} style={{ marginLeft: 10, background: '#4B6CB7', color: '#fff' }}>
        Save Quiz
      </button>
      
      {/* Show the number of questions */}
      <p style={{ marginTop: 10 }}>Total Questions: {questions.length}</p>
    </div>
  );
}