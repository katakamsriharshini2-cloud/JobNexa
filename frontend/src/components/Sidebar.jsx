import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  Briefcase,
  PlusCircle,
  Users,
  ShieldCheck,
  Settings,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Resume Manager', path: '/student/resumes', icon: FileText },
    { name: 'Job Recommendations', path: '/student/recommended', icon: Sparkles },
    { name: 'My Applications', path: '/student/applications', icon: Briefcase },
    { name: 'Saved Jobs', path: '/student/saved-jobs', icon: Bookmark },
    { name: 'Job Alerts', path: '/student/job-alerts', icon: Bell },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post a New Job', path: '/recruiter/post-job', icon: PlusCircle },
    { name: 'Manage Jobs', path: '/recruiter/manage-jobs', icon: Briefcase },
    { name: 'All Applicants', path: '/recruiter/applicants', icon: Users },
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: ShieldCheck },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Moderate Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Applications Review', path: '/admin/applications', icon: FileText },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'recruiter'
      ? recruiterLinks
      : studentLinks;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-[calc(100vh-4rem)] p-4 transition-colors">
      <div className="mb-6 px-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {role} portal
        </p>
        <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
          {user?.name}
        </p>
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
