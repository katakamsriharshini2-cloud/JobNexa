import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import { jobService } from '../services/jobService';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Users,
  Building,
  CheckCircle2,
  FileCheck2,
  BellRing
} from 'lucide-react';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobService.getAllJobs({ limit: 6 });
        if (res.success && res.data) {
          setFeaturedJobs(res.data);
        }
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (searchFilters) => {
    const query = new URLSearchParams();
    if (searchFilters.keyword) query.set('keyword', searchFilters.keyword);
    if (searchFilters.location) query.set('location', searchFilters.location);
    if (searchFilters.jobType) query.set('jobType', searchFilters.jobType);
    navigate(`/jobs?${query.toString()}`);
  };

  const categories = [
    { title: 'Software Engineering', icon: '💻', count: '120+ Jobs', bg: 'from-blue-500/10 to-blue-500/5' },
    { title: 'Data & AI / ML', icon: '🤖', count: '85+ Jobs', bg: 'from-purple-500/10 to-purple-500/5' },
    { title: 'Frontend & UI/UX', icon: '🎨', count: '64+ Jobs', bg: 'from-pink-500/10 to-pink-500/5' },
    { title: 'Cloud & DevOps', icon: '☁️', count: '45+ Jobs', bg: 'from-cyan-500/10 to-cyan-500/5' },
    { title: 'Cybersecurity', icon: '🛡️', count: '32+ Jobs', bg: 'from-emerald-500/10 to-emerald-500/5' },
    { title: 'Product & Tech Sales', icon: '📈', count: '50+ Jobs', bg: 'from-amber-500/10 to-amber-500/5' },
  ];

  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Adobe', 'Infosys', 'TCS', 'Wipro', 'Cognizant'
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-blue-50/50 via-purple-50/20 to-transparent dark:from-slate-900/60 dark:via-slate-900/20 dark:to-transparent">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-sm border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Next-Gen Smart Campus & Tech Recruitment</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight lg:leading-none max-w-4xl mx-auto">
            Discover Opportunities.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Shape Your Future.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find the right job, showcase your skills, and connect with top recruiters through JobNexa. Empowered with algorithmic skill matching and instant placement alerts.
          </p>

          {/* Search Bar */}
          <div className="mt-10">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/jobs"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              Post a Job as Recruiter
            </Link>
          </div>

          {/* Statistics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">500+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Jobs</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">2,500+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Students</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">120+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Partner Companies</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">92%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP COMPANIES TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-6">
          Trusted by Top Tech Employers & University Recruiters
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-70 dark:opacity-80">
          {companies.map((company, i) => (
            <span
              key={i}
              className="text-lg sm:text-xl font-bold tracking-tight text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              {company}
            </span>
          ))}
        </div>
      </section>

      {/* POPULAR JOB CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              Browse by Industry
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Job Categories
            </h2>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(cat.title)}`)}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer flex items-center space-x-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cat.count}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* HOW JOBNEXA WORKS */}
      <section className="bg-slate-100/60 dark:bg-slate-800/40 py-16 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            Seamless Workflow
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            How JobNexa Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2">
            A frictionless, intelligent hiring pipeline for modern students and agile recruiters.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Create Profile & Resume</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Build your verified academic profile and upload PDF/DOCX resumes securely to persistent cloud storage.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Skill-Based Match</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our recommendation engine analyzes required skills vs your competencies to generate match scores.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Apply & Instant Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Submit one-click job applications with attached resumes and receive real-time alerts on postings.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center relative shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 font-black text-lg">
                4
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Interview & Achieve</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Recruiters shortlist candidates, schedule interviews, and finalize placement offers seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              Latest Openings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Opportunities
            </h2>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Building className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">No jobs listed yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to post a job vacancy or explore categories.</p>
            <Link
              to="/register"
              className="mt-4 inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Accelerate Your Career with JobNexa?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Join thousands of ambitious students and hundreds of top tech recruiters. Setup your profile, upload your resume, and start matching today.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-blue-600 font-extrabold text-sm shadow-md hover:bg-blue-50 transition-colors"
              >
                Sign Up for Free
              </Link>
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-xl bg-blue-700/60 border border-white/20 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
              >
                Browse Job Vacancies
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
