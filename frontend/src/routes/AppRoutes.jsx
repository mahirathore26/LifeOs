import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import NotesPage from '../pages/NotesPage';
import ProjectsPage from '../pages/ProjectsPage';
import LearningPage from '../pages/LearningPage';
import DocumentsPage from '../pages/DocumentsPage';
import SearchPage from '../pages/SearchPage';
import ProfilePage from '../pages/ProfilePage';
import TagsPage from '../pages/TagsPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import { fetchCurrentUser } from '../features/auth/authSlice';

export default function AppRoutes() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      {!isAuthenticated && <Route path="/" element={<AuthPage />} />}
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected Routes inside Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
