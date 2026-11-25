import React, { useState, useEffect } from 'react';
import { resumeService } from '../services/resumeService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ConfirmDialog from '../components/ConfirmDialog';
import ResumeBuilder from '../components/ResumeBuilder';
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
  Eye,
  RefreshCw,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const ResumeUpload = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'builder'
  const [studentProfile, setStudentProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  // Replace modal state
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [resumeToReplace, setResumeToReplace] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [replacing, setReplacing] = useState(false);

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const [res, profRes] = await Promise.allSettled([
        resumeService.getMyResumes(),
        api.get('/students/profile'),
      ]);
      if (res.status === 'fulfilled' && res.value.success && res.value.data) {
        setResumes(res.value.data);
      }
      if (profRes.status === 'fulfilled' && profRes.value.data?.success) {
        setStudentProfile(profRes.value.data.data);
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
        setSuccessMsg('Resume uploaded successfully to persistent storage!');
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

  const handleSetDefault = async (resumeId) => {
    try {
      const res = await resumeService.setDefaultResume(resumeId);
      if (res.success) {
        setResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isDefault: r._id === resumeId,
          }))
        );
        setSuccessMsg('Default application resume updated successfully.');
      }
    } catch (err) {
      setErrorMsg('Failed to set default resume.');
    }
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    try {
      const res = await resumeService.deleteResume(resumeToDelete._id);
      if (res.success) {
        setDeleteModalOpen(false);
        setResumeToDelete(null);
        setSuccessMsg('Resume deleted successfully.');
        fetchResumes();
      }
    } catch (err) {
      setErrorMsg('Failed to delete resume.');
    }
  };

  const handleReplaceSubmit = async (e) => {
    e.preventDefault();
    if (!replaceFile || !resumeToReplace) return;

    try {
      setReplacing(true);
      setErrorMsg('');
      const formData = new FormData();
      formData.append('resume', replaceFile);

      const res = await resumeService.replaceResume(resumeToReplace._id, formData);
      if (res.success) {
        setReplaceModalOpen(false);
        setResumeToReplace(null);
        setReplaceFile(null);
        setSuccessMsg('Resume replaced successfully!');
        fetchResumes();
      } else {
        setErrorMsg(res.message || 'Replacement failed.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error replacing resume.');
    } finally {
      setReplacing(false);
    }
  };

  if (loading && resumes.length === 0) {
    return <Loading text="Loading your stored resumes..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="print:hidden">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span>Resume Management & Cloud Storage</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload, manage, and replace your resume documents. Your default resume is automatically shared with authorized recruiters upon job application.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Uploaded Resumes ({resumes.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'builder'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Smart Resume Builder & PDF Export</span>
        </button>
      </div>

      {activeTab === 'builder' ? (
        <ResumeBuilder studentProfile={studentProfile} user={user} />
      ) : (
        <>
          {/* Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center space-x-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

      {/* Uploader Card */}
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
                Supports PDF or DOCX format (Max file size: 5MB)
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
              <span>{uploading ? 'Uploading to Persistent Storage...' : 'Upload Resume'}</span>
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
          <span className="text-xs text-slate-400">Default resume is auto-attached to applications</span>
        </div>

        {resumes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No resumes uploaded yet. Upload your first resume above to apply for jobs.
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => {
              const fileLink = resumeService.getResumeUrl(resume.fileUrl, resume._id);

              return (
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
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {resume.fileType || 'pdf'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Uploaded on {new Date(resume.createdAt).toLocaleDateString()} •{' '}
                        {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(1)} KB` : 'Stored'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {/* Make Default */}
                    {!resume.isDefault && (
                      <button
                        onClick={() => handleSetDefault(resume._id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1"
                        title="Set as Default Resume"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Make Default</span>
                      </button>
                    )}

                    {/* Preview Button */}
                    <button
                      onClick={() => {
                        setPreviewResume(resume);
                        setPreviewModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                      title="Preview Resume"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Download Button */}
                    <a
                      href={fileLink}
                      target="_blank"
                      rel="noreferrer"
                      download={resume.originalName}
                      className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      title="Download Resume"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Replace Button */}
                    <button
                      onClick={() => {
                        setResumeToReplace(resume);
                        setReplaceFile(null);
                        setReplaceModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                      title="Replace Resume File"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
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
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* REPLACE RESUME MODAL */}
      {replaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Replace Resume</h3>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Replacing <span className="font-bold text-slate-800 dark:text-slate-200">{resumeToReplace?.originalName}</span> with a newly updated document.
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl text-center">
                <input
                  type="file"
                  id="replaceFileInput"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setReplaceFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="replaceFileInput" className="cursor-pointer block text-xs">
                  <Upload className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 block">
                    {replaceFile ? replaceFile.name : 'Choose replacement PDF / DOCX file'}
                  </span>
                  <span className="text-[10px] text-slate-400">Max size 5MB</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replaceFile || replacing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {replacing ? 'Replacing...' : 'Upload Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW RESUME MODAL */}
      {previewModalOpen && previewResume && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full h-[85vh] p-6 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {previewResume.originalName}
                </h3>
                <p className="text-xs text-slate-400">Candidate Document Preview</p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={resumeService.getResumeUrl(previewResume.fileUrl, previewResume._id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {previewResume.fileType === 'pdf' ? (
                <iframe
                  src={resumeService.getResumeUrl(previewResume.fileUrl, previewResume._id)}
                  title="Resume Preview"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <FileText className="w-16 h-16 text-blue-500" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Direct in-browser preview is available for PDF files.
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    This document is in DOCX format. Click below to download and inspect it in Microsoft Word or Google Docs.
                  </p>
                  <a
                    href={resumeService.getResumeUrl(previewResume.fileUrl, previewResume._id)}
                    download={previewResume.originalName}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download DOCX Document</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Resume?"
        message={`Are you sure you want to permanently delete "${resumeToDelete?.originalName || 'this resume'}"? This action removes the document from storage.`}
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
