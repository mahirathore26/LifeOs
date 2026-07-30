import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { extractApiData } from '../../lib/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/notes', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load notes');
  }
});

export const createNote = createAsyncThunk('notes/createNote', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/notes', payload);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create note');
  }
});

export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}`, payload);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update note');
  }
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notes/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
  }
});

export const restoreNote = createAsyncThunk('notes/restoreNote', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}/restore`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to restore note');
  }
});

export const archiveNote = createAsyncThunk('notes/archiveNote', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}/archive`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to archive note');
  }
});

export const unarchiveNote = createAsyncThunk('notes/unarchiveNote', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}/unarchive`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unarchive note');
  }
});

export const pinNote = createAsyncThunk('notes/pinNote', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}/pin`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to pin note');
  }
});

export const unpinNote = createAsyncThunk('notes/unpinNote', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/notes/${id}/unpin`);
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to unpin note');
  }
});

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter((note) => note._id !== action.payload);
      })
      .addCase(restoreNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      })
      .addCase(archiveNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      })
      .addCase(unarchiveNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      })
      .addCase(pinNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      })
      .addCase(unpinNote.fulfilled, (state, action) => {
        state.items = state.items.map((note) => (note._id === action.payload._id ? action.payload : note));
      });
  },
});

export default notesSlice.reducer;
