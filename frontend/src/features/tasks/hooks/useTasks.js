import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearTaskError,
  createTask,
  deleteTask,
  fetchTasks,
  restoreTask,
  updateTask,
} from '../tasksSlice';

export function useTasks() {
  const dispatch = useDispatch();
  const { items, loading, error, pagination } = useSelector((state) => state.tasks);

  const getTasks = useCallback((params = {}) => dispatch(fetchTasks(params)), [dispatch]);
  const addTask = useCallback((payload) => dispatch(createTask(payload)), [dispatch]);
  const editTask = useCallback((id, payload) => dispatch(updateTask({ id, payload })), [dispatch]);
  const removeTask = useCallback((id) => dispatch(deleteTask(id)), [dispatch]);
  const recoverTask = useCallback((id) => dispatch(restoreTask(id)), [dispatch]);
  const clearError = useCallback(() => dispatch(clearTaskError()), [dispatch]);

  return {
    tasks: items,
    loading,
    error,
    pagination,
    getTasks,
    addTask,
    editTask,
    removeTask,
    recoverTask,
    clearError,
  };
}

export default useTasks;
