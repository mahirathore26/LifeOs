import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { extractApiData } from '../../lib/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: null,
  uploading: false,
};

export const fetchDocuments = createAsyncThunk('documents/fetchDocuments', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/documents', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load documents');
  }
});

export const createDocument = createAsyncThunk('documents/createDocument', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
  }
});

export const updateDocument = createAsyncThunk('documents/updateDocument', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update document');
  }
});

export const deleteDocument = createAsyncThunk('documents/deleteDocument', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/documents/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
  }
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.items = state.items.map((doc) => (doc._id === action.payload._id ? action.payload : doc));
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter((doc) => doc._id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearDocumentError } = documentsSlice.actions;
export default documentsSlice.reducer;
