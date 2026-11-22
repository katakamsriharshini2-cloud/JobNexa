import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Target,
  Users,
  ShieldCheck,
  Code2,
  Database,
  Cloud,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>About JobNexa</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Empowering Next-Gen Careers.
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          JobNexa (Connect. Apply. Achieve.) is a centralized recruitment platform connecting ambitious students and job seekers with modern technology companies and university administrators.
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To bridge the gap between academic education and corporate employment by providing algorithmic skill matching, reliable resume cloud management, and instantaneous job alerts that help students unlock dream careers.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            To become the premier smart recruitment ecosystem for college campuses, eliminating placement friction through modern web engineering, transparency, and data-driven hiring workflows.
          </p>
        </div>
      </div>

      {/* Technology Stack Architecture */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Architectural Technology Stack</h2>
          <p className="text-xs text-slate-500 mt-1">
            Built using modern, industry-standard full-stack technologies for reliability, security, and scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <Code2 className="w-8 h-8 text-blue-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">React.js Frontend</h3>
            <p className="text-[11px] text-slate-400">Vite, Tailwind CSS, React Router DOM, Recharts & Axios</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-indigo-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Node & Express</h3>
            <p className="text-[11px] text-slate-400">REST APIs, JWT Authentication, bcrypt, Helmet & CORS</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <Database className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">MongoDB Atlas</h3>
            <p className="text-[11px] text-slate-400">Cloud database with Mongoose schemas, indexes & validation</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <Cloud className="w-8 h-8 text-purple-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cloud Storage & Render</h3>
            <p className="text-[11px] text-slate-400">Persistent Cloudinary resume storage & dual Render deployment</p>
          </div>
        </div>
      </div>

      {/* Academic Project Attribution */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Project Attribution</h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          Developed as a comprehensive academic submission for the subject <strong>Web Technologies and Mobile Programming</strong>. Adheres to strict modularity, full-stack separation, and production-grade security standards.
        </p>
        <div className="pt-2">
          <Link
            to="/jobs"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md inline-block"
          >
            Explore Job Opportunities
          </Link>
        </div>
      </div>

    </div>
  );
};

export default About;
