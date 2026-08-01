import api, { extractApiData } from '../../../lib/api';

export const documentsService = {
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  },

  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return extractApiData(response);
  },

  createDocument: async (formData) => {
    const response = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  updateDocument: async (id, formData) => {
    const response = await api.patch(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractApiData(response);
  },

  deleteDocument: async (id) => {
    await api.delete(`/documents/${id}`);
    return id;
  },
};

export default documentsService;
