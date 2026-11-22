import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Briefcase,
  Users,
  Edit,
  Trash2,
  PlusCircle,
  Eye,
  MapPin,
  Calendar,
  IndianRupee
} from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getRecruiterJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Error fetching recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      const res = await jobService.deleteJob(jobToDelete._id);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
        setDeleteModalOpen(false);
        setJobToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  if (loading) return <Loading text="Loading your posted vacancies..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
            Employer Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Manage Posted Vacancies ({jobs.length})
          </h1>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No active job listings</h3>
          <p className="text-xs text-slate-400">
            You haven't posted any jobs yet. Create a posting to start receiving student applications.
          </p>
          <Link
            to="/recruiter/post-job"
            className="inline-block mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Create Job Vacancy
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {job.applicantCount || 0} Applicants
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                    <span>{job.jobType}</span>
                  </span>
                  {job.salaryRange && (
                    <span className="flex items-center space-x-1">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{job.salaryRange}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                <Link
                  to={`/recruiter/applicants?jobId=${job._id}`}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 flex items-center space-x-1.5 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>View Applicants</span>
                </Link>

                <button
                  onClick={() => navigate('/recruiter/post-job', { state: { job } })}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setJobToDelete(job);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Job Posting?"
        message={`Are you sure you want to remove "${jobToDelete?.title}"? All submitted applications for this job will also be removed.`}
        confirmText="Delete Job"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setJobToDelete(null);
        }}
      />
    </div>
  );
};

export default ManageJobs;
