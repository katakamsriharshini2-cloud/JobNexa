import api from './api';

export const applicationService = {
  applyForJob: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  getJobApplications: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    const response = await api.put(`/applications/${applicationId}/status`, statusData);
    return response.data;
  },

  scheduleInterview: async (applicationId, interviewData) => {
    const response = await api.put(`/applications/${applicationId}/interview`, interviewData);
    return response.data;
  },
};
