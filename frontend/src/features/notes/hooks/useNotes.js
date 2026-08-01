import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  archiveNote,
  clearNoteError,
  createNote,
  deleteNote,
  fetchNotes,
  pinNote,
  restoreNote,
  unarchiveNote,
  unpinNote,
  updateNote,
} from '../notesSlice';

export function useNotes() {
  const dispatch = useDispatch();
  const { items, loading, error, pagination } = useSelector((state) => state.notes);

  const getNotes = useCallback((params = {}) => dispatch(fetchNotes(params)), [dispatch]);
  const addNote = useCallback((payload) => dispatch(createNote(payload)), [dispatch]);
  const editNote = useCallback((id, payload) => dispatch(updateNote({ id, payload })), [dispatch]);
  const removeNote = useCallback((id) => dispatch(deleteNote(id)), [dispatch]);
  const recoverNote = useCallback((id) => dispatch(restoreNote(id)), [dispatch]);
  const toggleArchive = useCallback(
    (note) => dispatch(note.isArchived ? unarchiveNote(note._id) : archiveNote(note._id)),
    [dispatch]
  );
  const togglePin = useCallback(
    (note) => dispatch(note.isPinned ? unpinNote(note._id) : pinNote(note._id)),
    [dispatch]
  );
  const clearError = useCallback(() => dispatch(clearNoteError()), [dispatch]);

  return {
    notes: items,
    loading,
    error,
    pagination,
    getNotes,
    addNote,
    editNote,
    removeNote,
    recoverNote,
    toggleArchive,
    togglePin,
    clearError,
  };
}

export default useNotes;
