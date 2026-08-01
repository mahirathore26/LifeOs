import api, { extractApiData } from '../../../lib/api';

export const projectsService = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return extractApiData(response);
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return extractApiData(response);
  },

  createProject: async (payload) => {
    const response = await api.post('/projects', payload);
    return extractApiData(response);
  },

  updateProject: async (id, payload) => {
    const response = await api.patch(`/projects/${id}`, payload);
    return extractApiData(response);
  },

  archiveProject: async (id) => {
    const response = await api.patch(`/projects/${id}/archive`);
    return extractApiData(response);
  },

  unarchiveProject: async (id) => {
    const response = await api.patch(`/projects/${id}/unarchive`);
    return extractApiData(response);
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    return id;
  },
};

export default projectsService;
