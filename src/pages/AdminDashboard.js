import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faChalkboardTeacher, faUserGraduate,
  faFile, faClipboard, faBuilding, faBook, faDownload
} from '@fortawesome/free-solid-svg-icons';

const StatCard = ({ label, value, icon, color }) => (
  <motion.div
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.98 }}
    className="bg-surface border border-borderSubtle rounded-lg p-5 shadow-card"
  >
    <div className="flex items-center justify-between mb-3">

      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <FontAwesomeIcon icon={icon} className="text-white text-sm" />
      </div>

    </div>

    <div className="text-2xl font-semibold text-white mb-1">
      {value}
    </div>

    <div className="text-slate-400 text-sm">
      {label}
    </div>
  </motion.div>
);

const AdminDashboard = () => {

  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [mostDownloaded, setMostDownloaded] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {

      const res = await API.get('/dashboard/admin');

      setStats(res.data.stats);
      setRecentLogs(res.data.recentLogs);
      setMostDownloaded(res.data.mostDownloaded);

    } catch (error) {

      toast.error('Failed to load dashboard');

    } finally {

      setLoading(false);

    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-lg animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );

  const actionColors = {
    login: 'bg-green-500/20 text-green-400',
    logout: 'bg-slate-500/20 text-slate-400',
    upload: 'bg-blue-500/20 text-blue-400',
    download: 'bg-cyan-500/20 text-cyan-400',
    delete: 'bg-red-500/20 text-red-400',
    share: 'bg-purple-500/20 text-purple-400',
    submit: 'bg-yellow-500/20 text-yellow-400',
    create_user: 'bg-indigo-500/20 text-indigo-400',
    create_department: 'bg-pink-500/20 text-pink-400',
    create_course: 'bg-orange-500/20 text-orange-400',
  };

  return (

    <div className="flex min-h-screen bg-background">

      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >

          <h1 className="text-2xl font-semibold text-white">
            Admin Dashboard
          </h1>

          <p className="text-slate-400 mt-1 text-sm">
            Welcome back, {user?.name}! Here's what's happening.
          </p>

        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <StatCard label="Total Users" value={stats?.totalUsers} icon={faUsers} color="bg-indigo-500" />
          <StatCard label="Faculty" value={stats?.totalFaculty} icon={faChalkboardTeacher} color="bg-blue-500" />
          <StatCard label="Students" value={stats?.totalStudents} icon={faUserGraduate} color="bg-green-500" />
          <StatCard label="Files" value={stats?.totalFiles} icon={faFile} color="bg-orange-500" />
          <StatCard label="Submissions" value={stats?.totalSubmissions} icon={faClipboard} color="bg-pink-500" />
          <StatCard label="Departments" value={stats?.totalDepartments} icon={faBuilding} color="bg-purple-500" />
          <StatCard label="Courses" value={stats?.totalCourses} icon={faBook} color="bg-cyan-500" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-surface border border-borderSubtle rounded-lg p-6 shadow-card">

            <h2 className="text-white font-semibold mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">

              {recentLogs.map((log) => (

                <div
                  key={log._id}
                  className="flex items-center justify-between py-2 border-b border-borderSubtle last:border-0"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                      {log.user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-slate-200 text-sm">
                        {log.description}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {log.user?.name}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-2">

                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${actionColors[log.action] || 'bg-slate-500/20 text-slate-400'}`}>
                      {log.action}
                    </span>

                    <span className="text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* Most Downloaded */}
          <div className="bg-surface border border-borderSubtle rounded-lg p-6 shadow-card">

            <h2 className="text-white font-semibold mb-4">
              Most Downloaded
            </h2>

            <div className="space-y-3">

              {mostDownloaded.length === 0 &&
                <p className="text-slate-500 text-sm">
                  No downloads yet.
                </p>
              }

              {mostDownloaded.map((file) => (

                <div
                  key={file._id}
                  className="flex items-center justify-between py-2 border-b border-borderSubtle last:border-0"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faFile} className="text-blue-400 text-xs" />
                    </div>

                    <p className="text-slate-300 text-sm truncate max-w-[140px]">
                      {file.name}
                    </p>

                  </div>

                  <div className="flex items-center gap-1 text-blue-400 text-sm">
                    <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    <span>{file.downloadCount}</span>
                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;