import api, { extractApiData } from '../../../lib/api';

export const notesService = {
  getNotes: async (params = {}) => {
    const response = await api.get('/notes', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  },

  createNote: async (payload) => {
    const response = await api.post('/notes', payload);
    return extractApiData(response);
  },

  updateNote: async (id, payload) => {
    const response = await api.patch(`/notes/${id}`, payload);
    return extractApiData(response);
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    return id;
  },

  restoreNote: async (id) => {
    const response = await api.patch(`/notes/${id}/restore`);
    return extractApiData(response);
  },

  archiveNote: async (id) => {
    const response = await api.patch(`/notes/${id}/archive`);
    return extractApiData(response);
  },

  unarchiveNote: async (id) => {
    const response = await api.patch(`/notes/${id}/unarchive`);
    return extractApiData(response);
  },

  pinNote: async (id) => {
    const response = await api.patch(`/notes/${id}/pin`);
    return extractApiData(response);
  },

  unpinNote: async (id) => {
    const response = await api.patch(`/notes/${id}/unpin`);
    return extractApiData(response);
  },
};

export default notesService;
