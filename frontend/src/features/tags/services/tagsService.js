import api, { extractApiData } from '../../../lib/api';

export const tagsService = {
  getTags: async () => {
    const response = await api.get('/tags');
    return extractApiData(response);
  },

  createTag: async (payload) => {
    const response = await api.post('/tags', payload);
    return extractApiData(response);
  },

  renameTag: async (id, payload) => {
    const response = await api.patch(`/tags/${id}`, payload);
    return extractApiData(response);
  },

  deleteTag: async (id) => {
    await api.delete(`/tags/${id}`);
    return id;
  },

  assignTagToResource: async (id, resourceType, resourceId) => {
    const response = await api.post(`/tags/${id}/assign`, { resourceType, resourceId });
    return extractApiData(response);
  },
};

export default tagsService;
