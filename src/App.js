import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import Files from './pages/Files';
import Submissions from './pages/Submissions';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-indigo-400 text-xl animate-pulse">Loading...</div>
    </div>
  );
  if (!user) return <Navigate to='/login' />;
  if (roles && !roles.includes(user.role)) return <Navigate to='/' />;
  return children;
};

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-indigo-400 text-xl animate-pulse">Loading...</div>
    </div>
  );
  if (user?.role === 'admin') return <Navigate to='/admin/dashboard' />;
  if (user?.role === 'faculty') return <Navigate to='/faculty/dashboard' />;
  if (user?.role === 'student') return <Navigate to='/student/dashboard' />;
  return <Navigate to='/home' />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/home' element={<Landing />} />
      <Route path='/' element={<DashboardRedirect />} />
      <Route path='/login' element={<Login />} />
      <Route path='/setup' element={<SetupAdmin />} />
      <Route path='/profile' element={
        <ProtectedRoute roles={['admin', 'faculty', 'student']}><Profile /></ProtectedRoute>
      } />
      <Route path='/admin/dashboard' element={
        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path='/faculty/dashboard' element={
        <ProtectedRoute roles={['faculty']}><FacultyDashboard /></ProtectedRoute>
      } />
      <Route path='/student/dashboard' element={
        <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
      } />
      <Route path='/users' element={
        <ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>
      } />
      <Route path='/departments' element={
        <ProtectedRoute roles={['admin']}><Departments /></ProtectedRoute>
      } />
      <Route path='/courses' element={
        <ProtectedRoute roles={['admin']}><Courses /></ProtectedRoute>
      } />
      <Route path='/files' element={
        <ProtectedRoute roles={['admin', 'faculty', 'student']}><Files /></ProtectedRoute>
      } />
      <Route path='/submissions' element={
        <ProtectedRoute roles={['admin', 'faculty', 'student']}><Submissions /></ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position='top-right' autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;