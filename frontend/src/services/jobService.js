import api from './api';
import { FALLBACK_INDIAN_JOBS } from './fallbackJobs';

function filterFallbackJobs(params = {}) {
  let list = [...FALLBACK_INDIAN_JOBS];
  const { keyword, location, jobType, experienceLevel, page = 1, limit = 9 } = params;

  if (keyword && keyword.trim() !== '') {
    const k = keyword.toLowerCase().trim();
    list = list.filter(
      (j) =>
        j.title.toLowerCase().includes(k) ||
        j.companyName.toLowerCase().includes(k) ||
        j.category.toLowerCase().includes(k) ||
        j.description.toLowerCase().includes(k) ||
        (j.requiredSkills && j.requiredSkills.some((s) => s.toLowerCase().includes(k)))
    );
  }

  if (location && location.trim() !== '') {
    const loc = location.toLowerCase().trim();
    if (loc === 'remote') {
      list = list.filter((j) => j.isRemote || j.location.toLowerCase().includes('remote'));
    } else {
      list = list.filter(
        (j) =>
          (j.city && j.city.toLowerCase().includes(loc)) ||
          (j.location && j.location.toLowerCase().includes(loc))
      );
    }
  }

  if (jobType) {
    list = list.filter((j) => j.jobType.toLowerCase() === jobType.toLowerCase());
  }

  if (experienceLevel) {
    list = list.filter((j) => j.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());
  }

  const total = list.length;
  const skip = (Number(page) - 1) * Number(limit);
  const data = list.slice(skip, skip + Number(limit));

  return {
    success: true,
    data,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)) || 1,
    isOfflineFallback: true,
  };
}

export const jobService = {
  getAllJobs: async (params = {}) => {
    try {
      const response = await api.get('/jobs', { params });
      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        return response.data;
      }
      return filterFallbackJobs(params);
    } catch (error) {
      console.warn('[JobService] Backend request failed, using guaranteed catalog:', error.message);
      return filterFallbackJobs(params);
    }
  },

  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data;
      }
      const fallback = FALLBACK_INDIAN_JOBS.find((j) => j._id === id || j.externalId === id);
      return { success: true, data: fallback || FALLBACK_INDIAN_JOBS[0] };
    } catch (error) {
      console.warn('[JobService] Backend request failed, using fallback item:', error.message);
      const fallback = FALLBACK_INDIAN_JOBS.find((j) => j._id === id || j.externalId === id);
      return { success: true, data: fallback || FALLBACK_INDIAN_JOBS[0] };
    }
  },

  getRecommendedJobs: async () => {
    try {
      const response = await api.get('/jobs/recommended');
      if (response.data && response.data.success && response.data.data?.length > 0) {
        return response.data;
      }
      return { success: true, data: FALLBACK_INDIAN_JOBS.slice(0, 6) };
    } catch (error) {
      return { success: true, data: FALLBACK_INDIAN_JOBS.slice(0, 6) };
    }
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getRecruiterJobs: async () => {
    try {
      const response = await api.get('/jobs/recruiter/my-jobs');
      return response.data;
    } catch (error) {
      return { success: true, data: [] };
    }
  },
};
