import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import tagsService from './services/tagsService';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchTags = createAsyncThunk('tags/fetchTags', async (_, { rejectWithValue }) => {
  try {
    return await tagsService.getTags();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tags');
  }
});

export const createTag = createAsyncThunk('tags/createTag', async (payload, { rejectWithValue }) => {
  try {
    return await tagsService.createTag(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create tag');
  }
});

export const renameTag = createAsyncThunk('tags/renameTag', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await tagsService.renameTag(id, payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to rename tag');
  }
});

export const deleteTag = createAsyncThunk('tags/deleteTag', async (id, { rejectWithValue }) => {
  try {
    return await tagsService.deleteTag(id);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete tag');
  }
});

export const assignTagToResource = createAsyncThunk(
  'tags/assignTagToResource',
  async ({ id, resourceType, resourceId }, { rejectWithValue }) => {
    try {
      return await tagsService.assignTagToResource(id, resourceType, resourceId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign tag');
    }
  }
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTagError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload ?? [];
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(renameTag.fulfilled, (state, action) => {
        state.items = state.items.map((tag) => (tag._id === action.payload._id ? action.payload : tag));
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.items = state.items.filter((tag) => tag._id !== action.payload);
      })
      .addCase(assignTagToResource.fulfilled, (state, action) => {
        state.items = state.items.map((tag) => (tag._id === action.payload._id ? action.payload : tag));
      });
  },
});

export const { clearTagError } = tagsSlice.actions;
export default tagsSlice.reducer;
