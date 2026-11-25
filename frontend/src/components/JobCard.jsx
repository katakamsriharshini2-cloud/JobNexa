import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, Sparkles, Building2, Globe, Calendar, ArrowRight } from 'lucide-react';

const JobCard = ({ job, isSaved = false, onToggleSave, showMatch = false }) => {
  const workMode = job.workMode || (job.isRemote ? 'Remote' : 'On-site');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      <div>
        {/* Top Header: Company, Match Badge, Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-12 h-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-700 p-1 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {job.companyName || job.company?.name || 'Top Tech Firm'}
                </p>
                {job.isExternal && (
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
                    {job.source || 'Live API'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showMatch && job.matchPercentage !== undefined && (
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1 shadow-sm ${
                  job.matchPercentage >= 70
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : job.matchPercentage >= 40
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title={`${job.matchingSkills?.length || 0} skills matched: ${(job.matchingSkills || []).join(', ')}`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{job.matchPercentage}% Match</span>
              </div>
            )}

            {onToggleSave && (
              <button
                onClick={() => onToggleSave(job._id)}
                aria-label={isSaved ? 'Remove bookmark' : 'Bookmark job'}
                className={`p-2 rounded-xl transition-colors ${
                  isSaved
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Highlights: Location, Work Mode, Type, Salary */}
        <div className="flex flex-wrap gap-2.5 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>{job.location || 'Remote'}</span>
          </span>
          <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${
            workMode === 'Remote'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : workMode === 'Hybrid'
              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
          }`}>
            <Globe className="w-3.5 h-3.5" />
            <span>{workMode}</span>
          </span>
          <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
            <span className="capitalize">{job.jobType || 'Full-time'}</span>
          </span>
          {job.salaryRange && (
            <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
              <span>{job.salaryRange}</span>
            </span>
          )}
          {job.experienceLevel && (
            <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{job.experienceLevel}</span>
            </span>
          )}
          {job.deadline && (
            <span className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
            </span>
          )}
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(job.requiredSkills || []).slice(0, 4).map((skill, index) => {
            const isMatched = (job.matchingSkills || []).some(
              (s) => s.toLowerCase() === skill.toLowerCase()
            );
            return (
              <span
                key={index}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                  isMatched
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300'
                }`}
              >
                {skill}
              </span>
            );
          })}
          {(job.requiredSkills || []).length > 4 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{(job.requiredSkills || []).length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Action buttons: Apply Now & View Details */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}
        </span>
        <div className="flex items-center space-x-2">
          <Link
            to={`/jobs/${job._id}`}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Details
          </Link>
          <Link
            to={`/jobs/${job._id}?apply=true`}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-1"
          >
            <span>Apply</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

