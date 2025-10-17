import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Student/StudentDashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CreateCourse from './pages/Admin/CreateCourse';
import ManageCourse from './pages/admin/ManageCourse';
import EnrolledCourses from './pages/Student/EnrolledCourses';
import CourseView from './pages/Student/CourseView';
import QuizPage from './pages/Student/QuizPage';
import ManageQuiz from './pages/admin/ManageQuiz';
import AdminMessageBoard from './pages/admin/AdminMessageBoard';
import StudentMessageBoard from './pages/Student/StudentMessageBoard';
import AdminCourseProgress from './pages/admin/ViewProgress';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student-only routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<EnrolledCourses />} />
        <Route path="/student/course/:id" element={<CourseView />} />
        <Route
          path="/student/course/:courseId/level/:levelId/module/:moduleId/quiz"
          element={<QuizPage />}
        />
        <Route path="/student/messages" element={<StudentMessageBoard />} />
      </Route>

      {/* Admin-only routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-course" element={<CreateCourse />} />
        <Route path="/admin/manage-course/:id" element={<ManageCourse />} />
        <Route
          path="/admin/course/:courseId/level/:levelId/module/:moduleId/quiz"
          element={<ManageQuiz />}
        />
        <Route path="/admin/messages" element={<AdminMessageBoard />} />
      
      <Route path="/admin/course-progress/:courseId" element={<AdminCourseProgress />} />
</Route>
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
