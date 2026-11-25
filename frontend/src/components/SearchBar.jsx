import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter } from 'lucide-react';

const SearchBar = ({ onSearch, initialValues = {} }) => {
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [jobType, setJobType] = useState(initialValues.jobType || '');

  // Synchronize state if URL query params change (e.g. on Clear Filters or city pill click)
  useEffect(() => {
    setKeyword(initialValues.keyword || '');
    setLocation(initialValues.location || '');
    setJobType(initialValues.jobType || '');
  }, [initialValues.keyword, initialValues.location, initialValues.jobType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword, location, jobType });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto flex flex-col md:flex-row gap-2 transition-colors"
    >
      {/* Keyword Search */}
      <div className="flex-1 flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
        <Search className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, skills (e.g. React, Node, Python)"
          className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Location Filter */}
      <div className="flex-1 flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
        <MapPin className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or 'Remote'"
          className="w-full bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Job Type Dropdown */}
      <div className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl md:w-44">
        <Briefcase className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0" />
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 dark:text-white focus:outline-none cursor-pointer"
        >
          <option value="" className="dark:bg-slate-800">All Job Types</option>
          <option value="Full-time" className="dark:bg-slate-800">Full-time</option>
          <option value="Part-time" className="dark:bg-slate-800">Part-time</option>
          <option value="Internship" className="dark:bg-slate-800">Internship</option>
          <option value="Contract" className="dark:bg-slate-800">Contract</option>
          <option value="Remote" className="dark:bg-slate-800">Remote</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>
    </form>
  );
};

export default SearchBar;
