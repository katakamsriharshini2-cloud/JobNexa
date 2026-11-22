import api from './api';

export const resumeService = {
  uploadResume: async (formData) => {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  setDefaultResume: async (id) => {
    const response = await api.put(`/resumes/${id}/default`);
    return response.data;
  },
};
