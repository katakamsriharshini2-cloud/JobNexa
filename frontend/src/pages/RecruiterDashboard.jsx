import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import api from '../services/api';
import Loading from '../components/Loading';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  PlusCircle,
  TrendingUp,
  XCircle,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        // Fetch recruiter jobs
        const res = await jobService.getRecruiterJobs();
        if (res.success && res.data) {
          setJobs(res.data);
        }

        // Fetch recruiter dashboard stats
        const statsRes = await api.get('/recruiter/dashboard');
        if (statsRes.data && statsRes.data.success) {
          setStats(statsRes.data.stats);
          setRecentApplicants(statsRes.data.recentApplicants || []);
        }
      } catch (err) {
        console.error('Error fetching recruiter dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  if (loading) return <Loading text="Loading Recruiter Dashboard..." />;

  // Chart data: Applicants per job
  const chartData = jobs.slice(0, 6).map((j) => ({
    name: j.title.length > 15 ? j.title.substring(0, 15) + '...' : j.title,
    applicants: j.applicantCount || 0,
  }));

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
            Employer & Recruiter Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            Welcome, {user?.name}! 🏢
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg">
            Manage your corporate postings, review candidate resumes, and coordinate campus placement interviews.
          </p>
        </div>

        <Link
          to="/recruiter/post-job"
          className="px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg flex items-center space-x-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400">Total Jobs</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalJobs}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400">Total Applicants</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.totalApplicants}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400">Shortlisted</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.shortlisted}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400">Offers / Selected</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.selected}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-slate-400">Rejected</p>
          <p className="text-2xl font-black text-rose-500 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Analytics Chart & Recent Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Applications Per Job Vacancy</span>
            </h2>
            <span className="text-xs text-slate-400">Live Recruiter Analytics</span>
          </div>

          {chartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No jobs posted yet. Post your first vacancy to generate analytics.
            </div>
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="applicants" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Quick actions & recent jobs */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Postings</h2>
            <Link to="/recruiter/manage-jobs" className="text-xs font-bold text-blue-600 hover:underline">
              Manage All
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active jobs posted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map((j) => (
                <div key={j._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{j.title}</p>
                    <p className="text-[11px] text-slate-400">{j.location} • {j.jobType}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                    {j.applicantCount || 0} applicants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent Applicants */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Applicants</h2>
          <Link to="/recruiter/applicants" className="text-xs font-bold text-blue-600 hover:underline">
            View All Applicants
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No applicant submissions received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Candidate</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {recentApplicants.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {a.student?.name || 'Candidate'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{a.job?.title}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/recruiter/applicants"
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Review
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

export default RecruiterDashboard;
