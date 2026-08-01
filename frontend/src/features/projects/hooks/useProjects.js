import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  archiveProject,
  clearProjectError,
  createProject,
  deleteProject,
  fetchProjects,
  unarchiveProject,
  updateProject,
} from '../projectsSlice';

export function useProjects() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.projects);

  const getProjects = useCallback((params = {}) => dispatch(fetchProjects(params)), [dispatch]);
  const addProject = useCallback((payload) => dispatch(createProject(payload)), [dispatch]);
  const editProject = useCallback((id, payload) => dispatch(updateProject({ id, payload })), [dispatch]);
  const archive = useCallback((id) => dispatch(archiveProject(id)), [dispatch]);
  const unarchive = useCallback((id) => dispatch(unarchiveProject(id)), [dispatch]);
  const removeProject = useCallback((id) => dispatch(deleteProject(id)), [dispatch]);
  const clearError = useCallback(() => dispatch(clearProjectError()), [dispatch]);

  return {
    projects: items,
    loading,
    error,
    getProjects,
    addProject,
    editProject,
    archive,
    unarchive,
    removeProject,
    clearError,
  };
}

export default useProjects;
