import React, { useState, useEffect } from 'react';
import { resumeService } from '../services/resumeService';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Download,
  AlertCircle,
  Star,
  FileCheck,
  ShieldCheck,
  Eye
} from 'lucide-react';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeService.getMyResumes();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) return;

    // Validate extension
    const allowedExtensions = ['pdf', 'docx', 'doc'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMsg('Invalid file format. Only PDF and DOCX files are allowed.');
      setSelectedFile(null);
      return;
    }

    // Validate size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setErrorMsg('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await resumeService.uploadResume(formData);
      if (res.success) {
        setSuccessMsg('Resume uploaded successfully to persistent cloud storage!');
        setSelectedFile(null);
        fetchResumes();
      } else {
        setErrorMsg(res.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error uploading resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await resumeService.setDefaultResume(id);
      if (res.success) {
        fetchResumes();
      }
    } catch (err) {
      console.error('Error setting default resume:', err);
    }
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    try {
      const res = await resumeService.deleteResume(resumeToDelete._id);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r._id !== resumeToDelete._id));
        setDeleteModalOpen(false);
        setResumeToDelete(null);
      }
    } catch (err) {
      setErrorMsg('Failed to delete resume.');
    }
  };

  if (loading) return <Loading text="Loading your saved resumes..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
          Career Documents
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Resume Manager & Cloud Storage
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your uploaded resumes. All documents are stored securely with encrypted cloud storage.
        </p>
      </div>

      {/* Alerts */}
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

      {/* Upload Box */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-blue-500" />
          <span>Upload New Resume</span>
        </h2>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center transition-colors">
            <input
              type="file"
              id="resumeInput"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resumeInput"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop your resume'}
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF or DOCX (Max file size: 5MB)
              </p>
              {selectedFile && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                </span>
              )}
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-40 flex items-center space-x-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading to Cloud...' : 'Upload Resume'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Resumes List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-purple-500" />
            <span>Your Stored Resumes ({resumes.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Only 1 default resume used for quick apply</span>
        </div>

        {resumes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No resumes uploaded yet. Upload your first resume above to apply for jobs.
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                        {resume.originalName || 'Candidate Resume'}
                      </p>
                      {resume.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Uploaded on {new Date(resume.createdAt).toLocaleDateString()} •{' '}
                      {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(1)} KB` : 'Cloud Stored'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {!resume.isDefault && (
                    <button
                      onClick={() => handleSetDefault(resume._id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Make Default</span>
                    </button>
                  )}

                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    title="View / Download Resume"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setResumeToDelete(resume);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Resume?"
        message={`Are you sure you want to permanently delete "${resumeToDelete?.originalName || 'this resume'}"? This action removes the file from cloud storage.`}
        confirmText="Delete Resume"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setResumeToDelete(null);
        }}
      />

    </div>
  );
};

export default ResumeUpload;
