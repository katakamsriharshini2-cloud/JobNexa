import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindJobs from './pages/FindJobs';
import JobDetails from './pages/JobDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import CareerResources from './pages/CareerResources';
import NotFound from './pages/NotFound';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ResumeUpload from './pages/ResumeUpload';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import JobAlerts from './pages/JobAlerts';

// Recruiter pages
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import ManageJobs from './pages/ManageJobs';
import Applicants from './pages/Applicants';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <Routes>
        {/* Public Routes with standard Navbar and Footer */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Home />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/jobs"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <FindJobs />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <JobDetails />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <About />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Contact />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/resources"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <CareerResources />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Login />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Register />
              </main>
              <Footer />
            </>
          }
        />

        {/* Student Protected Portal */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="resumes" element={<ResumeUpload />} />
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="job-alerts" element={<JobAlerts />} />
          <Route path="recommended" element={<FindJobs />} />
        </Route>

        {/* Recruiter Protected Portal */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RecruiterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="applicants" element={<Applicants />} />
        </Route>

        {/* Admin Protected Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="jobs" element={<AdminDashboard />} />
          <Route path="applications" element={<AdminDashboard />} />
        </Route>

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <NotFound />
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
