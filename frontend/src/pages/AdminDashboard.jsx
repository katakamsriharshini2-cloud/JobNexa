import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Building,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, jobs
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    selected: 0,
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'user' | 'job', id, name }

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
        setUsers(res.data.users || []);
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data && res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleApproveRecruiter = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, {
        status: 'active',
        isApproved: true,
      });
      if (res.data && res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isApproved: true, status: 'active' } : u))
        );
      }
    } catch (err) {
      console.error('Error approving recruiter:', err);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'job') {
        await api.delete(`/jobs/${itemToDelete.id}`);
        setJobs((prev) => prev.filter((j) => j._id !== itemToDelete.id));
        setStats((prev) => ({ ...prev, totalJobs: Math.max(0, prev.totalJobs - 1) }));
      } else if (itemToDelete.type === 'user') {
        await api.delete(`/admin/users/${itemToDelete.id}`);
        setUsers((prev) => prev.filter((u) => u._id !== itemToDelete.id));
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error executing delete:', err);
    }
  };

  if (loading) return <Loading text="Loading JobNexa Administrative Portal..." />;

  // Chart data
  const userDistribution = [
    { name: 'Students', value: stats.totalStudents || 0, color: '#3b82f6' },
    { name: 'Recruiters', value: stats.totalRecruiters || 0, color: '#8b5cf6' },
  ];

  const appStatusData = [
    { name: 'Total Applied', count: stats.totalApplications || 0 },
    { name: 'Shortlisted', count: stats.shortlisted || 0 },
    { name: 'Offers / Selected', count: stats.selected || 0 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Root Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">JobNexa System Oversight</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
            Monitor platform metrics, moderate job postings, verify recruiter identities, and audit student applications.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Job Postings ({jobs.length})
          </button>
        </div>
      </div>

      {/* 6 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Students</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.totalStudents}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Recruiters</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.totalRecruiters}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Jobs</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.totalJobs}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Applications</p>
          <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalApplications}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Shortlisted</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.shortlisted}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Selected</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{stats.selected}</p>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Applications Bar Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Campus Recruitment Funnel</span>
            </h2>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appStatusData}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Distribution Pie */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>User Composition (Students vs Recruiters)</span>
            </h2>
            <div className="h-64 w-full pt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Accounts</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-bold text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'suspended'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'recruiter' ? (
                        u.isApproved ? (
                          <span className="text-emerald-600 font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveRecruiter(u._id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700"
                          >
                            Approve
                          </button>
                        )
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleUserStatus(u._id, u.status || 'active')}
                            className="text-xs text-blue-600 hover:underline font-bold"
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete({ type: 'user', id: u._id, name: u.name });
                              setDeleteModalOpen(true);
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATE JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">All Platform Jobs</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Job Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Job Type</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{j.title}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{j.companyName}</td>
                    <td className="py-3.5 px-4 text-slate-400">{j.location}</td>
                    <td className="py-3.5 px-4">{j.jobType}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{j.applicantCount || 0}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'job', id: j._id, name: j.title });
                          setDeleteModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                      >
                        Remove Posting
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Admin Action Confirmation"
        message={`Are you sure you want to permanently delete "${itemToDelete?.name}"?`}
        confirmText="Confirm Delete"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
      />

    </div>
  );
};

export default AdminDashboard;
