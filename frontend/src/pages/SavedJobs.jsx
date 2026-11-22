import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import { Bookmark, ArrowRight, Briefcase } from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-jobs');
      if (res.data && res.data.success) {
        setSavedJobs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((item) => (item.job?._id || item.job) !== jobId));
    } catch (err) {
      console.error('Error removing saved job:', err);
    }
  };

  if (loading) return <Loading text="Loading your bookmarked jobs..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
            Bookmarked Roles
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Saved Jobs ({savedJobs.length})
          </h1>
        </div>
        <Link
          to="/jobs"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
        >
          <span>Find More Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No saved jobs</h3>
          <p className="text-xs text-slate-400">
            Click the bookmark icon on any job card to save opportunities for later.
          </p>
          <Link
            to="/jobs"
            className="inline-block mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Explore Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;
            return (
              <JobCard
                key={job._id}
                job={job}
                isSaved={true}
                onToggleSave={() => handleRemove(job._id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
