import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import { jobService } from '../services/jobService';
import api from '../services/api';
import Loading from '../components/Loading';
import JobCard from '../components/JobCard';
import {
  FileText,
  Bookmark,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  UserCheck
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    recommendedJobs: 0,
    profileCompletion: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch profile
        const profRes = await api.get('/students/profile');
        if (profRes.data && profRes.data.success) {
          setProfile(profRes.data.data);
          setStats((prev) => ({
            ...prev,
            profileCompletion: profRes.data.profileCompletion || 65,
          }));
        }

        // Fetch applications
        const appRes = await applicationService.getMyApplications();
        if (appRes.success && appRes.data) {
          setRecentApplications(appRes.data.slice(0, 5));
          setStats((prev) => ({ ...prev, totalApplications: appRes.data.length }));
        }

        // Fetch saved jobs
        const savedRes = await api.get('/saved-jobs');
        if (savedRes.data && savedRes.data.success) {
          setStats((prev) => ({ ...prev, savedJobs: savedRes.data.data.length }));
        }

        // Fetch recommended jobs
        const recRes = await jobService.getRecommendedJobs();
        if (recRes.success && recRes.data) {
          setRecommendedJobs(recRes.data.slice(0, 3));
          setStats((prev) => ({ ...prev, recommendedJobs: recRes.data.length }));
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading text="Loading your Candidate Dashboard..." />;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200';
      case 'Interview Scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200';
      case 'Shortlisted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome & Profile completion alert */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg">
            Track your recruitment progress, explore algorithm-matched job recommendations, and maintain your academic profile.
          </p>
        </div>

        {/* Profile Completion Dial */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center space-x-4 min-w-[240px]">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * (stats.profileCompletion || 65)) / 100}
                className="text-amber-300 transition-all duration-1000"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">
              {stats.profileCompletion}%
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-white">Profile Strength</p>
            <Link
              to="/student/profile"
              className="text-[11px] text-amber-300 hover:underline font-semibold flex items-center space-x-1 mt-0.5"
            >
              <span>Complete Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalApplications}</p>
            <p className="text-xs font-semibold text-slate-400">Applications Sent</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.recommendedJobs}</p>
            <p className="text-xs font-semibold text-slate-400">Skill Matches</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.savedJobs}</p>
            <p className="text-xs font-semibold text-slate-400">Saved Jobs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.profileCompletion}%</p>
            <p className="text-xs font-semibold text-slate-400">Profile Complete</p>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Skill-Based Recommendations
            </h2>
          </div>
          <Link
            to="/student/recommended"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              No matching recommendations yet. Add more technical skills to your profile to boost match scores!
            </p>
            <Link
              to="/student/profile"
              className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Add Skills in Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard key={job._id} job={job} showMatch={true} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Applications
          </h2>
          <Link
            to="/student/applications"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            See Full History
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            You haven't submitted any job applications yet.{' '}
            <Link to="/jobs" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Browse Openings
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Job Position</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {app.job?.title || 'Position'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {app.job?.companyName || 'Company'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/student/applications"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;
