import api, { extractApiData } from '../../../lib/api';

export const tasksService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return {
      data: extractApiData(response),
      pagination: response?.data?.pagination ?? null,
    };
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return extractApiData(response);
  },

  createTask: async (payload) => {
    const response = await api.post('/tasks', payload);
    return extractApiData(response);
  },

  updateTask: async (id, payload) => {
    const response = await api.patch(`/tasks/${id}`, payload);
    return extractApiData(response);
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    return id;
  },

  restoreTask: async (id) => {
    const response = await api.patch(`/tasks/${id}/restore`);
    return extractApiData(response);
  },
};

export default tasksService;
