import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { resumeService } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import {
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Users,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft,
  Send,
  ExternalLink,
  X
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Apply modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobById(id);
        if (res.success && res.data) {
          setJob(res.data);
          if (res.hasApplied) {
            setHasApplied(true);
          }
        } else {
          setError('Job not found.');
        }
      } catch (err) {
        setError('Error fetching job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // Fetch student resumes when apply modal is opened
  const handleOpenApplyModal = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (user.role !== 'student') {
      alert('Only students/job seekers can apply for jobs.');
      return;
    }

    setIsApplyModalOpen(true);
    setApplyError('');
    try {
      const res = await resumeService.getMyResumes();
      if (res.success && res.data) {
        setResumes(res.data);
        const defaultResume = res.data.find((r) => r.isDefault) || res.data[0];
        if (defaultResume) {
          setSelectedResumeId(defaultResume._id);
        }
      }
    } catch (err) {
      console.error('Error fetching candidate resumes:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setApplyError('Please select or upload a resume to attach.');
      return;
    }

    try {
      setApplyLoading(true);
      setApplyError('');
      const res = await applicationService.applyForJob({
        jobId: job._id,
        resumeId: selectedResumeId,
        coverLetter,
      });

      if (res.success) {
        setApplySuccess(true);
        setHasApplied(true);
        setTimeout(() => {
          setIsApplyModalOpen(false);
        }, 1800);
      } else {
        setApplyError(res.message || 'Failed to submit application.');
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <Loading fullScreen text="Loading Job Details..." />;

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{error || 'Job not found'}</h2>
        <Link to="/jobs" className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
          Return to Job Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </button>

      {/* Main Job Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <p className="text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
              {job.companyName || job.company?.name}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{job.location || 'Remote'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                <span className="capitalize">{job.jobType}</span>
              </span>
              {job.salaryRange && (
                <span className="flex items-center space-x-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{job.salaryRange}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {hasApplied ? (
            <div className="px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Application Submitted</span>
            </div>
          ) : user?.role === 'recruiter' || user?.role === 'admin' ? (
            <div className="text-xs font-semibold text-slate-400 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl">
              Logged in as {user.role}
            </div>
          ) : job.isExternal && job.originalUrl ? (
            <a
              href={job.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Apply on {job.source ? job.source.toUpperCase() : 'Official Site'}</span>
            </a>
          ) : (
            <button
              onClick={handleOpenApplyModal}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Apply Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Job Details & Match Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description, Requirements, Skills */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Overview */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Job Description
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Required Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2 pt-2">
              {(job.requiredSkills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Key Details & Skill Match */}
        <div className="space-y-6">
          
          {/* Skill Match Calculator Card (for candidate) */}
          {user?.role === 'student' && job.matchDetails && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 p-6 rounded-3xl border border-blue-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Skill-Match Analysis
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Match Compatibility</span>
                <span className="text-2xl font-black text-blue-600 dark:text-purple-400">
                  {job.matchDetails.matchPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                  style={{ width: `${job.matchDetails.matchPercentage}%` }}
                ></div>
              </div>

              {/* Matching Skills */}
              {job.matchDetails.matchingSkills?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    Matching Skills ({job.matchDetails.matchingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {job.matchDetails.matchingSkills.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {job.matchDetails.missingSkills?.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Missing Skills ({job.matchDetails.missingSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {job.matchDetails.missingSkills.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Job Info Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Opportunity Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Experience</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{job.experienceLevel || 'Fresher'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Total Vacancies</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{job.vacancies || 1} Openings</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400">Deadline</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Date Posted</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* APPLICATION MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Apply for {job.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{job.companyName}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-500">The recruiter has received your application and resume.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                
                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Choose Resume */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Attach Your Resume
                  </label>

                  {resumes.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        You have not uploaded any resume yet.
                      </p>
                      <Link
                        to="/student/resumes"
                        className="inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                      >
                        Upload Resume in Resume Manager
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map((r) => (
                        <label
                          key={r._id}
                          className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedResumeId === r._id
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="resumeChoice"
                            value={r._id}
                            checked={selectedResumeId === r._id}
                            onChange={() => setSelectedResumeId(r._id)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 truncate">
                            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {r.originalName || 'Candidate Resume'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Uploaded {new Date(r.createdAt).toLocaleDateString()}
                              {r.isDefault && ' • Default'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Cover Letter / Note to Recruiter (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Describe why you are a great match for this role and what relevant projects you have built..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading || resumes.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>{applyLoading ? 'Submitting...' : 'Submit Application'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetails;
