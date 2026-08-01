import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearDocumentError,
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
} from '../documentsSlice';

export function useDocuments() {
  const dispatch = useDispatch();
  const { items, loading, uploading, error, pagination } = useSelector((state) => state.documents);

  const getDocuments = useCallback((params = {}) => dispatch(fetchDocuments(params)), [dispatch]);
  const addDocument = useCallback((formData) => dispatch(createDocument(formData)), [dispatch]);
  const editDocument = useCallback((id, formData) => dispatch(updateDocument({ id, formData })), [dispatch]);
  const removeDocument = useCallback((id) => dispatch(deleteDocument(id)), [dispatch]);
  const clearError = useCallback(() => dispatch(clearDocumentError()), [dispatch]);

  return {
    documents: items,
    loading,
    uploading,
    error,
    pagination,
    getDocuments,
    addDocument,
    editDocument,
    removeDocument,
    clearError,
  };
}

export default useDocuments;
