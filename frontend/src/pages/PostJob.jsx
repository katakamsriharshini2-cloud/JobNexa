import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Building,
  MapPin,
  IndianRupee,
  Clock,
  Calendar,
  Users,
  Code2,
  Plus,
  X,
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editJob = location.state?.job;

  const [formData, setFormData] = useState({
    title: '',
    companyName: user?.companyName || '',
    description: '',
    requiredSkills: [],
    location: '',
    salaryRange: '',
    jobType: 'Full-time',
    experienceLevel: 'Fresher / Entry-Level',
    vacancies: 1,
    deadline: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title || '',
        companyName: editJob.companyName || user?.companyName || '',
        description: editJob.description || '',
        requiredSkills: editJob.requiredSkills || [],
        location: editJob.location || '',
        salaryRange: editJob.salaryRange || '',
        jobType: editJob.jobType || 'Full-time',
        experienceLevel: editJob.experienceLevel || 'Fresher / Entry-Level',
        vacancies: editJob.vacancies || 1,
        deadline: editJob.deadline ? editJob.deadline.split('T')[0] : '',
      });
    }
  }, [editJob, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (skill) => {
    const trimmed = (skill || newSkill).trim();
    if (trimmed && !formData.requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.requiredSkills.length === 0) {
      setErrorMsg('Please specify at least one required skill for candidate matching.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      let res;
      if (editJob) {
        res = await jobService.updateJob(editJob._id, formData);
      } else {
        res = await jobService.createJob(formData);
      }

      if (res.success) {
        setSuccessMsg(editJob ? 'Job updated successfully!' : 'Job posted successfully! Relevant candidates will be alerted.');
        setTimeout(() => {
          navigate('/recruiter/manage-jobs');
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Operation failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving job posting.');
    } finally {
      setLoading(false);
    }
  };

  const popularSkills = [
    'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript',
    'Python', 'Java', 'SQL', 'C++', 'AWS', 'Docker', 'Git'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
          Job Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          {editJob ? 'Edit Job Posting' : 'Post a New Job Opportunity'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Fill in the required technical requirements, salary range, and position expectations.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        {/* Title and Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Associate Full-Stack Developer"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Google, NexaTech"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location, Salary, Job Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore or Remote"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Salary Range
            </label>
            <input
              type="text"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="e.g. ₹6 - 10 LPA"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Experience Level, Vacancies, Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Fresher / Entry-Level">Fresher / Entry-Level</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Number of Vacancies
            </label>
            <input
              type="number"
              min="1"
              name="vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Required Skills Management */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
            Required Technical Skills * (Used by matching algorithm)
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. React, Node.js, Python..."
              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center space-x-1.5"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
            {popularSkills
              .filter((s) => !formData.requiredSkills.some((rs) => rs.toLowerCase() === s.toLowerCase()))
              .slice(0, 8)
              .map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
            Comprehensive Job Description *
          </label>
          <textarea
            rows={6}
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed overview of candidate responsibilities, qualifications, and project stack..."
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : editJob ? 'Update Job Posting' : 'Publish Job Opportunity'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default PostJob;
