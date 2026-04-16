import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faBuilding, faBook, faFile, faClipboard, faFolder, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: faHome, color: 'text-indigo-400' },
    { label: 'Users', path: '/users', icon: faUsers, color: 'text-blue-400' },
    { label: 'Departments', path: '/departments', icon: faBuilding, color: 'text-purple-400' },
    { label: 'Courses', path: '/courses', icon: faBook, color: 'text-cyan-400' },
    { label: 'Files', path: '/files', icon: faFile, color: 'text-orange-400' },
    { label: 'Submissions', path: '/submissions', icon: faClipboard, color: 'text-pink-400' },
    { label: 'Profile', path: '/profile', icon: faUser },
  ];

  const facultyLinks = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: faHome, color: 'text-indigo-400' },
    { label: 'Files', path: '/files', icon: faFile, color: 'text-orange-400' },
    { label: 'Submissions', path: '/submissions', icon: faClipboard, color: 'text-pink-400' },
    { label: 'Profile', path: '/profile', icon: faUser },
  ];

  const studentLinks = [
    { label: 'Dashboard', path: '/student/dashboard', icon: faHome, color: 'text-indigo-400' },
    { label: 'Files', path: '/files', icon: faFile, color: 'text-orange-400' },
    { label: 'Submissions', path: '/submissions', icon: faClipboard, color: 'text-pink-400' },
    { label: 'Profile', path: '/profile', icon: faUser },
  ];

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'faculty'
      ? facultyLinks
      : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-64 min-h-screen bg-background border-r border-borderSubtle flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-borderSubtle">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faFolder} className="text-white text-lg" />
          </div>

          <div>
            <h1 className="text-white font-semibold text-sm">
              DocVault
            </h1>
            <p className="text-slate-400 text-xs">
              File Sharing System
            </p>
          </div>

        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-3 mt-4 rounded-lg bg-surface border border-borderSubtle">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">
              {user?.name}
            </p>
            <p className="text-slate-400 text-xs capitalize">
              {user?.role}
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 mt-3 space-y-1">

        {links.map((item) => {

          const isActive = location.pathname === item.path;

          return (
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-surface'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className={`w-4 h-4 ${!isActive && item.color}`} />
              {item.label}
            </motion.button>
          );

        })}

      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-borderSubtle">

        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
          Logout
        </motion.button>

      </div>

    </motion.div>
  );
};

export default Sidebar;