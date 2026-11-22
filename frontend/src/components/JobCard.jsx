import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, Sparkles, Building2 } from 'lucide-react';

const JobCard = ({ job, isSaved = false, onToggleSave, showMatch = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      <div>
        {/* Top Header: Company, Match Badge, Bookmark */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {job.companyName || job.company?.name || 'Top Tech Firm'}
              </p>
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

        {/* Highlights: Location, Type, Salary */}
        <div className="flex flex-wrap gap-2.5 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>{job.location || 'Remote'}</span>
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

      {/* Footer Details button */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-sm hover:shadow transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
