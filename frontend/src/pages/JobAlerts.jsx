import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';
import { Bell, CheckCircle2, Plus, X, Save, Sparkles, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const JobAlerts = () => {
  const [alertConfig, setAlertConfig] = useState({
    preferredSkills: [],
    preferredLocations: '',
    jobType: '',
    isActive: true,
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/job-alerts');
        if (res.data && res.data.success && res.data.data) {
          const d = res.data.data;
          setAlertConfig({
            preferredSkills: d.preferredSkills || [],
            preferredLocations: d.preferredLocations || '',
            jobType: d.jobType || '',
            isActive: d.isActive !== undefined ? d.isActive : true,
          });
        }
      } catch (err) {
        console.error('Error fetching job alert preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !alertConfig.preferredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setAlertConfig((prev) => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, trimmed],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setAlertConfig((prev) => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.post('/job-alerts', alertConfig);
      if (res.data && res.data.success) {
        setSuccessMsg('Job alert preferences saved! You will receive in-app notifications whenever matching jobs are posted.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating alert preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading job alert preferences..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
          Smart Placement Alerts
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Job Alerts & Match Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Define your target skills and job preferences. JobNexa will automatically evaluate all newly posted jobs and ping you immediately when there is an opportunity match.
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

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        {/* Toggle Alert Status */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">In-App Job Alerts</p>
              <p className="text-xs text-slate-400">Receive real-time notifications for newly posted jobs</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAlertConfig((prev) => ({ ...prev, isActive: !prev.isActive }))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              alertConfig.isActive
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>{alertConfig.isActive ? 'Active' : 'Disabled'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Preferred Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Target Skills for Alerts
            </label>
            <div className="flex gap-2 mb-3">
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
                placeholder="e.g. React, Node.js, Python, Java..."
                className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {alertConfig.preferredSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No target skills added yet. Add skills to match against new postings.</p>
              ) : (
                alertConfig.preferredSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Preferred Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Preferred Location
            </label>
            <input
              type="text"
              value={alertConfig.preferredLocations}
              onChange={(e) => setAlertConfig({ ...alertConfig, preferredLocations: e.target.value })}
              placeholder="e.g. Bangalore, Pune, Remote, or leave blank for anywhere"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preferred Job Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Preferred Job Type
            </label>
            <select
              value={alertConfig.jobType}
              onChange={(e) => setAlertConfig({ ...alertConfig, jobType: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Any Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default JobAlerts;
