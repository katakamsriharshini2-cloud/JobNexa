import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  FileText,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Target,
  Terminal,
  Zap,
} from 'lucide-react';

const CareerResources = () => {
  const [activeTab, setActiveTab] = useState('technical');

  const technicalQuestions = [
    {
      topic: 'Full-Stack & Web Technologies',
      q: 'What is the Virtual DOM in React and how does reconciliation work?',
      a: 'The Virtual DOM is an in-memory representation of real DOM elements. When state changes, React runs a diffing algorithm (Reconciliation) to calculate the minimum updates necessary and batches DOM mutations, preventing expensive full page layout recalculations.',
    },
    {
      topic: 'Backend & System Design',
      q: 'Explain horizontal vs vertical scaling and when to use each.',
      a: 'Vertical scaling (scale-up) adds CPU, RAM, or storage to a single server. Horizontal scaling (scale-out) adds more server nodes behind a reverse proxy/load balancer. Full-stack microservices and high-concurrency systems favor horizontal scaling for high availability and fault tolerance.',
    },
    {
      topic: 'Databases & MongoDB',
      q: 'What are MongoDB compound indexes and text indexes?',
      a: 'Compound indexes index multiple fields together (e.g. { category: 1, createdAt: -1 }), dramatically speeding up multi-criteria queries. Text indexes create specialized tokenized inverted indices that support full-text wildcard search and relevance score ranking across multiple document fields.',
    },
    {
      topic: 'Data Structures & Algorithms',
      q: 'How does binary search achieve O(log n) time complexity?',
      a: 'On a sorted array, binary search compares the target with the median element, halving the search space each step. Because the search size decreases geometrically (N, N/2, N/4 ... 1), the maximum comparisons needed is log2(N).',
    },
  ];

  const resumeTips = [
    {
      title: 'Action Verbs & Quantifiable Metrics',
      desc: 'Start each project bullet with strong action verbs (Architected, Deployed, Optimized, Engineered). Always quantify results: e.g. "reduced API response time by 40%" instead of "made APIs faster".',
    },
    {
      title: 'ATS-Friendly Formatting',
      desc: 'Use standard clean headings (Education, Technical Skills, Projects, Experience). Avoid tables or decorative graphics that confuse automated ATS parsers.',
    },
    {
      title: 'Direct GitHub & Live Demo Links',
      desc: 'Recruiters prioritize verifiable code. Provide working links to your deployed web applications and GitHub repositories for all major projects.',
    },
    {
      title: 'Tailor Skills to Job Descriptions',
      desc: 'Align your technical skill keywords with the specific requirements of the positions you apply for on JobNexa to boost algorithmic matching scores.',
    },
  ];

  const aptitudeTopics = [
    {
      subject: 'Quantitative Aptitude',
      keyAreas: ['Percentages & Profit/Loss', 'Time, Speed & Distance', 'Permutations & Combinations', 'Probability', 'Ratios & Proportions'],
      strategy: 'Practice mental arithmetic and formula shortcuts. Focus on high-frequency campus placement aptitude topics.',
    },
    {
      subject: 'Logical Reasoning',
      keyAreas: ['Blood Relations', 'Direction Sense', 'Seating Arrangements (Linear & Circular)', 'Coding-Decoding', 'Syllogisms'],
      strategy: 'Draw quick diagrams and elimination grids to solve multi-variable puzzles systematically within 60 seconds.',
    },
    {
      subject: 'Verbal Ability & Comprehension',
      keyAreas: ['Reading Comprehension', 'Sentence Correction & Grammar', 'Para Jumbles', 'Vocabulary & Synonyms'],
      strategy: 'Skim reading passages for central themes and keywords before answering detail-oriented questions.',
    },
  ];

  const placementRoadmap = [
    {
      phase: 'Phase 1: Core Computer Science Foundations',
      timeline: 'Weeks 1 – 4',
      tasks: ['Master Data Structures (Arrays, Linked Lists, Trees, Graphs, Hash Maps)', 'Object-Oriented Programming principles', 'Database Normalization and SQL/NoSQL queries'],
    },
    {
      phase: 'Phase 2: Full-Stack Project Portfolio',
      timeline: 'Weeks 5 – 8',
      tasks: ['Build 2 full-stack applications with authentication, database CRUD, and cloud deployment', 'Push production code to GitHub with clean READMEs', 'Generate professional resume via JobNexa Resume Builder'],
    },
    {
      phase: 'Phase 3: Mock Interviews & Timed Assessments',
      timeline: 'Weeks 9 – 12',
      tasks: ['Solve 100+ LeetCode problems across medium patterns', 'Conduct peer mock technical interviews with whiteboard coding', 'Prepare behavioral STAR responses for recruiter HR rounds'],
    },
    {
      phase: 'Phase 4: Targeted Applications & Placement Drives',
      timeline: 'Placement Season',
      tasks: ['Set up JobNexa Real-Time Job Alerts for your target cities', 'Apply with customized cover letters and tailored resumes', 'Track recruitment rounds through My Applications dashboard'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>JobNexa Career Launchpad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Career Resources & Placement Preparation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Comprehensive interview preparation guides, technical questions, resume tips, and aptitude training curated for college students and tech graduates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-700">
        {[
          { id: 'technical', label: 'Technical Q&A', icon: Code2 },
          { id: 'resume', label: 'Resume Tips', icon: FileText },
          { id: 'aptitude', label: 'Aptitude Prep', icon: Lightbulb },
          { id: 'roadmap', label: 'Placement Roadmap', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Technical Questions */}
      {activeTab === 'technical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalQuestions.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                  {item.topic}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {item.q}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Resume Tips */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
            >
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <h4>{tip.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-7">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Aptitude Preparation */}
      {activeTab === 'aptitude' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aptitudeTopics.map((apt, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-2">
                {apt.subject}
              </h3>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High-Yield Topics:</p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  {apt.keyAreas.map((k, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-[11px] text-blue-700 dark:text-blue-300">
                <strong>Strategy Tip:</strong> {apt.strategy}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Placement Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placementRoadmap.map((phase, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {phase.timeline}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {phase.phase}
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-1">
                  {phase.tasks.map((task, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default CareerResources;
