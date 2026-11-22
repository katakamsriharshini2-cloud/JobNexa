import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import Loading from '../components/Loading';
import {
  Briefcase,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await applicationService.getMyApplications();
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300';
    }
  };

  const getStepProgress = (status) => {
    const steps = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected'];
    if (status === 'Rejected') return -1;
    if (status === 'Selected') return 4;
    if (status === 'Interview Scheduled') return 3;
    if (status === 'Shortlisted') return 2;
    return 1;
  };

  if (loading) return <Loading text="Loading your job applications..." />;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
          Application Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          My Applications ({applications.length})
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your recruitment progress in real time as recruiters review, shortlist, and schedule interviews.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No applications yet</h3>
          <p className="text-xs text-slate-400">
            Apply for positions matching your profile to track interview schedules and decisions.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Browse Open Positions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStep = getStepProgress(app.status);
            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {app.job?.title || 'Job Position'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {app.job?.companyName || 'Company'} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                    {app.job && (
                      <Link
                        to={`/jobs/${app.job._id}`}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>View Job</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Tracker (4 steps) */}
                {app.status !== 'Rejected' ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer / Selected'].map((step, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              currentStep >= idx + 1
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          ></div>
                          <span
                            className={`text-[10px] font-bold block ${
                              currentStep >= idx + 1
                                ? 'text-blue-600 dark:text-purple-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                    Thank you for applying. The recruiter has decided not to move forward with your application at this time.
                  </div>
                )}

                {/* Interview Information Card if scheduled */}
                {app.interview && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-slate-800 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/50 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-extrabold text-purple-700 dark:text-purple-300">
                      <Video className="w-4 h-4" />
                      <span>Interview Scheduled!</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        <span>Date: <strong>{new Date(app.interview.date).toLocaleDateString()}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>Time: <strong>{app.interview.time || 'TBD'}</strong></span>
                      </div>
                    </div>
                    {app.interview.link && (
                      <div className="pt-1">
                        <a
                          href={app.interview.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Meeting / Details</span>
                        </a>
                      </div>
                    )}
                    {app.interview.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Note: {app.interview.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Resume attached & cover letter preview */}
                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Resume Attached: {app.resume?.originalName || 'Candidate Resume'}</span>
                  {app.coverLetter && <span className="italic">Cover letter included</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
