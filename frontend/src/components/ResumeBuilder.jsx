import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  FolderGit2,
} from 'lucide-react';

const ResumeBuilder = ({ studentProfile, user }) => {
  const [formData, setFormData] = useState({
    fullName: studentProfile?.fullName || user?.name || '',
    email: user?.email || '',
    phone: studentProfile?.phone || user?.phone || '',
    location: 'Hyderabad, India',
    linkedin: studentProfile?.linkedinUrl || 'linkedin.com/in/student',
    github: studentProfile?.githubUrl || 'github.com/student',
    objective:
      'Motivated and detail-oriented Computer Science student with strong fundamentals in full-stack development, seeking a software engineering role to contribute to high-impact products.',
    college: studentProfile?.college || 'Engineering Institute of Technology',
    degree: studentProfile?.degree || 'B.Tech - Computer Science & Engineering',
    graduationYear: studentProfile?.graduationYear || '2025',
    cgpa: '8.8 / 10',
    skills:
      (studentProfile?.skills || []).join(', ') ||
      'JavaScript, React.js, Node.js, Express, MongoDB, Python, Git, REST APIs, Tailwind CSS',
    projects: [
      {
        title: 'JobNexa – Full Stack Job & Campus Placement Portal',
        tech: 'React, Node.js, Express, MongoDB, Tailwind CSS',
        description:
          'Engineered a scalable recruitment portal with algorithmic skill matching, PDF resume parsing, real-time application trackers, and recruiter scheduling tools.',
      },
      {
        title: 'Cloud Document & Resume Manager',
        tech: 'React, Cloudinary, Node.js, JWT',
        description:
          'Developed persistent multi-version file storage supporting PDF/DOCX format verification and secure document previewing.',
      },
    ],
    experience: [
      {
        role: 'Full Stack Web Developer Intern',
        company: 'Innovate Tech Solutions',
        duration: 'June 2024 – August 2024',
        details:
          'Collaborated with engineering team to implement responsive frontend components, optimized API response latency by 25%, and integrated REST endpoints.',
      },
    ],
    certifications: [
      'AWS Certified Cloud Practitioner (2024)',
      'Meta Frontend Developer Professional Certificate',
      'MongoDB Certified Associate Developer',
    ],
    achievements: [
      'Finalist in National Smart Campus Hackathon (Top 5 out of 400+ teams)',
      'Academic Excellence Scholarship for top 5% semester standing',
    ],
  });

  const [activeSection, setActiveSection] = useState('personal');

  const handlePrint = () => {
    window.print();
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...formData.projects];
    updated[index][field] = value;
    setFormData({ ...formData, projects: updated });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: 'New Technical Project', tech: 'Tech Stack', description: 'Brief description of features...' },
      ],
    });
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { role: 'Software Intern', company: 'Company Name', duration: 'Duration', details: 'Responsibilities...' },
      ],
    });
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Resume Builder</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Build & Export Professional PDF Resume
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in your career details and export a verified, recruiter-formatted PDF resume ready for job applications.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Export Resume as PDF</span>
        </button>
      </div>

      {/* Builder Layout: Form on Left, Live Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Editor Form Tabs & Fields (Hidden during Print) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 print:hidden">
          
          {/* Section Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveSection('personal')}
              className={`py-1.5 rounded-lg transition-all ${
                activeSection === 'personal'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Personal & Education
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('skills_projects')}
              className={`py-1.5 rounded-lg transition-all ${
                activeSection === 'skills_projects'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Projects & Skills
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('experience_certs')}
              className={`py-1.5 rounded-lg transition-all ${
                activeSection === 'experience_certs'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Experience & Honors
            </button>
          </div>

          {/* Section 1: Personal & Education */}
          {activeSection === 'personal' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">LinkedIn / Portfolio</label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Career Objective</label>
                <textarea
                  rows={3}
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Education</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="College / University"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Degree & Branch"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year & CGPA"
                      value={`${formData.graduationYear} • ${formData.cgpa}`}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Projects & Skills */}
          {activeSection === 'skills_projects' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Technical & Soft Skills (Comma Separated)
                </label>
                <textarea
                  rows={3}
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Technical Projects</h4>
                  <button
                    type="button"
                    onClick={addProject}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="absolute right-2 top-2 text-rose-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Technologies Used"
                        value={proj.tech}
                        onChange={(e) => handleProjectChange(idx, 'tech', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="Key accomplishments..."
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Experience & Honors */}
          {activeSection === 'experience_certs' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Internships & Work Experience</h4>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute right-2 top-2 text-rose-400 hover:text-rose-600"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Organization"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. May 2024 - July 2024)"
                      value={exp.duration}
                      onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Key contributions..."
                      value={exp.details}
                      onChange={(e) => handleExperienceChange(idx, 'details', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Certifications (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.certifications.join('\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        certifications: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Achievements & Honors (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.achievements.join('\n')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        achievements: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Live Resume Sheet / Printable Canvas */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 min-h-[750px] font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:col-span-12">
          
          {/* Resume Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center sm:text-left sm:flex sm:justify-between sm:items-end">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                {formData.fullName || 'Student Name'}
              </h1>
              <p className="text-xs font-bold text-blue-700 mt-1 uppercase tracking-wider">
                {formData.degree || 'Computer Science Graduate'}
              </p>
            </div>
            <div className="text-[11px] text-slate-600 text-right mt-2 sm:mt-0 space-y-0.5">
              <p>{formData.email} • {formData.phone}</p>
              <p>{formData.location} • {formData.linkedin}</p>
            </div>
          </div>

          {/* Career Objective */}
          {formData.objective && (
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Career Objective
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {formData.objective}
              </p>
            </div>
          )}

          {/* Education */}
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Education
            </h3>
            <div className="flex justify-between items-start text-xs">
              <div>
                <p className="font-bold text-slate-900">{formData.college}</p>
                <p className="text-slate-600">{formData.degree}</p>
              </div>
              <div className="text-right text-slate-600">
                <p className="font-semibold">{formData.graduationYear}</p>
                <p>CGPA: {formData.cgpa}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          {formData.skills && (
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                Technical Skills
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {formData.skills}
              </p>
            </div>
          )}

          {/* Technical Projects */}
          {formData.projects?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Projects
              </h3>
              <div className="space-y-2.5">
                {formData.projects.map((proj, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{proj.title}</span>
                      <span className="text-[11px] text-blue-700 font-semibold">{proj.tech}</span>
                    </div>
                    <p className="text-slate-600 text-[11.5px] mt-0.5 leading-relaxed">
                      • {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {formData.experience?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Internships & Experience
              </h3>
              <div className="space-y-2">
                {formData.experience.map((exp, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{exp.role} – {exp.company}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{exp.duration}</span>
                    </div>
                    <p className="text-slate-600 text-[11.5px] mt-0.5 leading-relaxed">
                      • {exp.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Honors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.certifications?.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                  Certifications
                </h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  {formData.certifications.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {formData.achievements?.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-1.5">
                  Key Achievements
                </h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  {formData.achievements.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ResumeBuilder;
