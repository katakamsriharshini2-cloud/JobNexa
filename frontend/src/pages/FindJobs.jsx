import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import { jobService } from '../services/jobService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Filter, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

const FindJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Local filter states
  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const jobType = searchParams.get('jobType') || '';
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [sortBy, setSortBy] = useState('latest');

  // Fetch saved jobs for the current student
  const fetchSavedJobs = async () => {
    if (isAuthenticated && user?.role === 'student') {
      try {
        const res = await api.get('/saved-jobs');
        if (res.data && res.data.success) {
          const ids = new Set(res.data.data.map((item) => item.job?._id || item.job));
          setSavedJobIds(ids);
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    }
  };

  // Toggle Save Job
  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated || user?.role !== 'student') {
      alert('Please log in as a student to save jobs.');
      return;
    }
    try {
      if (savedJobIds.has(jobId)) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await api.post('/saved-jobs', { jobId });
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          keyword,
          location,
          jobType,
          experienceLevel,
          sortBy,
        };
        const res = await jobService.getAllJobs(params);
        if (res.success && res.data) {
          setJobs(res.data);
          setTotalJobs(res.total || res.data.length);
          setTotalPages(res.pages || Math.ceil((res.total || res.data.length) / limit) || 1);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    fetchSavedJobs();
  }, [keyword, location, jobType, experienceLevel, sortBy, page]);

  const handleSearch = (filters) => {
    setPage(1);
    const newParams = new URLSearchParams();
    if (filters.keyword) newParams.set('keyword', filters.keyword);
    if (filters.location) newParams.set('location', filters.location);
    if (filters.jobType) newParams.set('jobType', filters.jobType);
    if (experienceLevel) newParams.set('experienceLevel', experienceLevel);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Explore All Job Opportunities
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Filter through hundreds of tech opportunities verified by university recruiters.
        </p>
        <div className="pt-4">
          <SearchBar onSearch={handleSearch} initialValues={{ keyword, location, jobType }} />
        </div>
      </div>

      {/* Filter / Sort bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Results Counter */}
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Briefcase className="w-4 h-4 text-blue-500" />
          <span>Showing <strong className="text-blue-600 dark:text-blue-400">{jobs.length}</strong> of {totalJobs} available jobs</span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Experience Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Experience:</span>
            <select
              value={experienceLevel}
              onChange={(e) => {
                setExperienceLevel(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="">All Levels</option>
              <option value="Fresher / Entry-Level">Fresher / Entry-Level</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="latest">Latest First</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(keyword || location || jobType || experienceLevel) && (
            <button
              onClick={() => {
                setExperienceLevel('');
                setSearchParams({});
                setPage(1);
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <Loading text="Finding matching jobs..." />
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No matching jobs found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria, removing location filters, or searching for broader skills like 'JavaScript', 'React', or 'Python'.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isSaved={savedJobIds.has(job._id)}
              onToggleSave={handleToggleSave}
              showMatch={user?.role === 'student'}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      )}

    </div>
  );
};

export default FindJobs;
