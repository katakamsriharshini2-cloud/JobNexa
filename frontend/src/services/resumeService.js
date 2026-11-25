import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_ROOT = API_BASE_URL.replace(/\/api\/?$/, '');

export const resumeService = {
  uploadResume: async (formData) => {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  replaceResume: async (id, formData) => {
    const response = await api.put(`/resumes/${id}/replace`, formData, {
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

  /**
   * Helper to resolve the correct URL for viewing or downloading a resume
   * Supports Cloudinary direct links, backend proxy endpoints, and local uploads
   */
  getResumeUrl: (fileUrl, resumeId) => {
    if (!fileUrl && !resumeId) return '#';
    if (fileUrl && fileUrl.startsWith('http')) {
      return fileUrl;
    }
    if (fileUrl && fileUrl.startsWith('/uploads')) {
      return `${BACKEND_ROOT}${fileUrl}`;
    }
    if (resumeId) {
      return `${API_BASE_URL}/resumes/${resumeId}/download`;
    }
    return fileUrl || '#';
  },
};
