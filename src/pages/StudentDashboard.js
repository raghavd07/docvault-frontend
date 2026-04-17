import { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faClipboard, faBook, faBell,
  faEye, faDownload, faFilter
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

const StudentDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  useEffect(() => {
    if (selectedCourse === 'all') {
      setFilteredFiles(recentFiles);
    } else {
      setFilteredFiles(
        recentFiles.filter((f) =>
          f.course?._id === selectedCourse || f.course === selectedCourse
        )
      );
    }
  }, [selectedCourse, recentFiles]);

  const fetchDashboard = async () => {
    try {
      const [dashRes, coursesRes] = await Promise.all([
        API.get('/dashboard/student'),
        API.get('/courses'),
      ]);
      setStats(dashRes.data.stats);
      setRecentFiles(dashRes.data.recentFiles || []);
      setFilteredFiles(dashRes.data.recentFiles || []);
      setRecentSubmissions(dashRes.data.recentSubmissions || []);
      setNotifications(dashRes.data.notifications || []);
      const userId = user?.id || user?._id;
      setCourses(coursesRes.data.filter((c) =>
        c.students?.some((s) => s._id === userId || s === userId)
      ));
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
    } catch (error) { }
  };

  const handleDownload = async (file) => {
    try {
      const res = await API.get(`/files/${file._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName || file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleView = async (file) => {
    if (!file.path) { toast.error('File not found'); return; }
    try {
      const res = await API.get(`/files/${file._id}/view`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: file.mimetype || 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) { toast.error('Failed to view file'); }
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
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Shared Files" value={stats?.sharedFiles} icon={faFile} color="from-indigo-500 to-purple-600" />
          <StatCard label="My Submissions" value={stats?.mySubmissions} icon={faClipboard} color="from-pink-500 to-rose-600" />
          <StatCard label="My Courses" value={stats?.totalCourses} icon={faBook} color="from-blue-500 to-cyan-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:p-6">

          {/* Recent Files */}
          <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Shared Files</h2>
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

            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faFile} className="text-slate-600 text-4xl mb-3" />
                <p className="text-slate-500 text-sm">No files shared with you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFiles.map((file) => (
                  <div key={file._id} className="bg-[#0f172a] rounded-xl border border-slate-700/50 hover:border-indigo-500/40 transition-all duration-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <FontAwesomeIcon icon={faFile} className="text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <FontAwesomeIcon icon={faBook} className="text-slate-500 text-xs" />
                          <p className="text-slate-500 text-xs truncate">{file.course?.name || 'General'}</p>
                        </div>
                        <p className="text-slate-600 text-xs mt-1">By {file.uploadedBy?.name}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                      <button
                        onClick={() => handleView(file)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs transition"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-xs" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:p-6">

            {/* Recent Submissions */}
            <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">My Submissions</h2>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-6">
                  <FontAwesomeIcon icon={faClipboard} className="text-slate-600 text-3xl mb-2" />
                  <p className="text-slate-500 text-sm">No submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                      <div>
                        <p className="text-slate-200 text-sm font-medium truncate max-w-[150px]">{sub.title}</p>
                        <p className="text-slate-500 text-xs">{sub.course?.name}</p>
                      </div>
                      <span className="text-slate-600 text-xs">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
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
                <div className="text-center py-6">
                  <FontAwesomeIcon icon={faBell} className="text-slate-600 text-3xl mb-2" />
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
    </div>
  );
};

export default StudentDashboard;