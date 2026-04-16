import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API, { API_URL } from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faClipboard, faBook, faBell, faFilter,
  faUserGraduate, faEye
} from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-200">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-3`}>
      <FontAwesomeIcon icon={icon} className="text-white text-sm" />
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value ?? 0}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
);

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    if (selectedCourse === 'all') {
      setFilteredSubmissions(recentSubmissions);
    } else {
      setFilteredSubmissions(
        recentSubmissions.filter((sub) =>
          sub.course?._id === selectedCourse || sub.course === selectedCourse
        )
      );
    }
  }, [selectedCourse, recentSubmissions]);

  const fetchDashboard = async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        API.get('/dashboard/faculty'),
        API.get('/courses'),
      ]);
      setStats(dashRes.data.stats);
      setRecentSubmissions(dashRes.data.recentSubmissions || []);
      setFilteredSubmissions(dashRes.data.recentSubmissions || []);
      setNotifications(dashRes.data.notifications || []);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/dashboard/notifications/${id}/read`);
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (error) {}
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-indigo-400 text-xl animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-24 pr-4 py-4 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Faculty Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="My Files" value={stats?.myFiles} icon={faFile} color="from-indigo-500 to-purple-600" />
          <StatCard label="Submissions" value={stats?.totalSubmissions} icon={faClipboard} color="from-pink-500 to-rose-600" />
          <StatCard label="My Courses" value={stats?.myCourses} icon={faBook} color="from-blue-500 to-cyan-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:p-6">

          {/* Submissions Section */}
          <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6">
            {/* Section Header with Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Submissions</h2>
              <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-600 rounded-xl px-3 py-1.5">
                <FontAwesomeIcon icon={faFilter} className="text-slate-400 text-xs" />
                <select
                  className="bg-[#0f172a] text-slate-300 text-sm focus:outline-none cursor-pointer border-none outline-none"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="all" className="bg-[#0f172a] text-slate-300">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#0f172a] text-slate-300">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submission Cards Grid */}
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faClipboard} className="text-slate-600 text-4xl mb-3" />
                <p className="text-slate-500 text-sm">No submissions found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubmissions.map((sub) => (
                  <div key={sub._id} className="bg-[#0f172a] rounded-xl border border-slate-700/50 hover:border-indigo-500/40 transition-all duration-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {sub.student?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{sub.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <FontAwesomeIcon icon={faUserGraduate} className="text-slate-500 text-xs" />
                          <p className="text-slate-400 text-xs truncate">{sub.student?.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <FontAwesomeIcon icon={faBook} className="text-slate-500 text-xs" />
                          <p className="text-slate-500 text-xs truncate">{sub.course?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                        {sub.course?.code || 'N/A'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-xs">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <button
                          onClick={() => {
                            if (!sub.file?.path) { toast.error('File not found'); return; }
                            window.open(sub.file.path.startsWith('http') ? sub.file.path : `${API_URL}/` + sub.file.path.replace(/\\/g, '/'), '_blank');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faBell} className="text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              {notifications.length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faBell} className="text-slate-600 text-3xl mb-3" />
                <p className="text-slate-500 text-sm">No new notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n._id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-slate-300 text-sm mb-2">{n.message}</p>
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition font-medium"
                    >
                      Mark as read
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;