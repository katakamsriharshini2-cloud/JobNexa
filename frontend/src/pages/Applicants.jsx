import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import { resumeService } from '../services/resumeService';
import Loading from '../components/Loading';
import {
  Users,
  Briefcase,
  FileText,
  Download,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  Clock3,
  X,
  Send,
  AlertCircle
} from 'lucide-react';

const Applicants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interview modal state
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    link: '',
    notes: '',
  });
  const [interviewSaving, setInterviewSaving] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const jobRes = await jobService.getRecruiterJobs();
        if (jobRes.success && jobRes.data) {
          setJobs(jobRes.data);
          
          const targetJobId = selectedJobId || (jobRes.data[0] ? jobRes.data[0]._id : '');
          if (targetJobId) {
            fetchApplicantsForJob(targetJobId);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs for applicants view:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchApplicantsForJob = async (jobId) => {
    try {
      setLoading(true);
      const res = await applicationService.getJobApplications(jobId);
      if (res.success && res.data) {
        setApplicants(res.data);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobFilterChange = (jobId) => {
    setSearchParams(jobId ? { jobId } : {});
    if (jobId) {
      fetchApplicantsForJob(jobId);
    } else {
      setApplicants([]);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplicationStatus(appId, { status: newStatus });
      if (res.success) {
        setApplicants((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleOpenInterviewModal = (app) => {
    setActiveApplicant(app);
    setInterviewData({
      date: app.interview?.date ? app.interview.date.split('T')[0] : '',
      time: app.interview?.time || '',
      link: app.interview?.link || '',
      notes: app.interview?.notes || '',
    });
    setInterviewModalOpen(true);
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeApplicant) return;

    try {
      setInterviewSaving(true);
      const res = await applicationService.scheduleInterview(activeApplicant._id, interviewData);
      if (res.success) {
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === activeApplicant._id
              ? { ...app, status: 'Interview Scheduled', interview: interviewData }
              : app
          )
        );
        setInterviewModalOpen(false);
        setActiveApplicant(null);
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
    } finally {
      setInterviewSaving(false);
    }
  };

  if (loading && jobs.length === 0) return <Loading text="Loading applications..." />;

  return (
    <div className="space-y-6">
      
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
            Candidate Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Applicant Submissions ({applicants.length})
          </h1>
        </div>

        {/* Job selector dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Filter Position:</span>
          <select
            value={selectedJobId || (jobs[0]?._id || '')}
            onChange={(e) => handleJobFilterChange(e.target.value)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.applicantCount || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No applicants found for this position</h3>
          <p className="text-xs text-slate-400">
            When students submit applications, their resumes and profiles will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {app.student?.name || 'Applicant'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {app.student?.email} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.studentProfile && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {app.studentProfile.college || 'College'} • {app.studentProfile.degree} ({app.studentProfile.branch})
                    </p>
                  )}
                </div>

                {/* Status selector & Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="p-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="Applied">Status: Applied</option>
                    <option value="Shortlisted">Status: Shortlisted</option>
                    <option value="Interview Scheduled">Status: Interview Scheduled</option>
                    <option value="Selected">Status: Selected / Offer</option>
                    <option value="Rejected">Status: Rejected</option>
                  </select>

                  {/* Schedule Interview button */}
                  <button
                    onClick={() => handleOpenInterviewModal(app)}
                    className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-colors flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>

                  {/* View/Download Resume */}
                  {app.resume ? (
                    <a
                      href={resumeService.getResumeUrl(app.resume.fileUrl, app.resume._id)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No resume attached</span>
                  )}
                </div>
              </div>

              {/* Cover letter & Candidate Skills */}
              <div className="space-y-3 text-xs">
                {app.coverLetter && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="font-bold text-slate-600 dark:text-slate-400 text-[10px] uppercase mb-1">
                      Candidate Note / Cover Letter:
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {app.studentProfile?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Skills:</span>
                    {app.studentProfile.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Schedule Interview</h3>
                <p className="text-xs text-slate-400">Candidate: {activeApplicant?.student?.name}</p>
              </div>
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Interview Date *
                </label>
                <input
                  type="date"
                  required
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Interview Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:30 AM IST"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Meeting Link / Location URL
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://meet.google.com/xyz or Microsoft Teams"
                  value={interviewData.link}
                  onChange={(e) => setInterviewData({ ...interviewData, link: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Please have your camera on and prepare a 5-minute walkthrough of your GitHub projects..."
                  value={interviewData.notes}
                  onChange={(e) => setInterviewData({ ...interviewData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={interviewSaving}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {interviewSaving ? 'Scheduling...' : 'Save & Notify Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Applicants;
