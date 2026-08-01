import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  assignTagToResource,
  clearTagError,
  createTag,
  deleteTag,
  fetchTags,
  renameTag,
} from '../tagsSlice';

export function useTags() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.tags);

  const getTags = useCallback(() => dispatch(fetchTags()), [dispatch]);
  const addTag = useCallback((payload) => dispatch(createTag(payload)), [dispatch]);
  const updateTag = useCallback((id, payload) => dispatch(renameTag({ id, payload })), [dispatch]);
  const removeTag = useCallback((id) => dispatch(deleteTag(id)), [dispatch]);
  const assignTag = useCallback(
    (id, resourceType, resourceId) => dispatch(assignTagToResource({ id, resourceType, resourceId })),
    [dispatch]
  );
  const clearError = useCallback(() => dispatch(clearTagError()), [dispatch]);

  return {
    tags: items,
    loading,
    error,
    getTags,
    addTag,
    updateTag,
    removeTag,
    assignTag,
    clearError,
  };
}

export default useTags;
