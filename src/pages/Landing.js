import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder, faShield, faUpload, faShare,
  faClipboard, faBell, faSearch, faUserShield,
  faChalkboardTeacher, faUserGraduate, faArrowRight
} from '@fortawesome/free-solid-svg-icons';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: faUpload,
      title: 'File Upload & Management',
      description: 'Upload documents, presentations, PDFs and more. Organize files by course or department.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: faShare,
      title: 'Smart File Sharing',
      description: 'Share files with specific users, entire courses, or keep them private with one click.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: faClipboard,
      title: 'Assignment Submissions',
      description: 'Students can submit assignments directly. Faculty can view and download submissions.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: faShield,
      title: 'Role Based Access',
      description: 'Three roles — Admin, Faculty, Student — each with their own permissions and dashboard.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: faBell,
      title: 'Notifications',
      description: 'Get notified when files are shared with you or new materials are uploaded to your course.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: faSearch,
      title: 'Search & Filter',
      description: 'Quickly find files by name, course or date. Filter submissions by course with ease.',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const roles = [
    {
      icon: faUserShield,
      title: 'Admin',
      color: 'from-red-500 to-pink-600',
      points: [
        'Manage users, departments & courses',
        'View all files including deleted ones',
        'Restore or permanently delete files',
        'Monitor activity logs & analytics',
      ],
    },
    {
      icon: faChalkboardTeacher,
      title: 'Faculty',
      color: 'from-blue-500 to-cyan-600',
      points: [
        'Upload and share course materials',
        'Share files with students or courses',
        'View and download submissions',
        'Receive notifications from students',
      ],
    },
    {
      icon: faUserGraduate,
      title: 'Student',
      color: 'from-green-500 to-emerald-600',
      points: [
        'Access files shared with you',
        'Submit assignments to faculty',
        'Filter files and submissions by course',
        'Get notified about new materials',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faFolder} className="text-white text-sm" />
            </div>
            <span className="text-white font-bold text-xl">DocVault</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg hover:shadow-indigo-500/25"
          >
            Login
            <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <FontAwesomeIcon icon={faShield} className="text-xs" />
            Secure File Sharing System
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Welcome to </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              DocVault
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-slate-400 text-xl md:text-2xl mb-4 leading-relaxed">
            A smart platform for managing and sharing academic files
          </p>
          <p className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto">
            Empowering admins, faculty and students with seamless file management,
            assignment submissions and role-based access control.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-2xl transition shadow-2xl hover:shadow-indigo-500/25 text-lg"
            >
              Get Started
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 max-w-lg mx-auto">
            {[
              { value: '3', label: 'User Roles' },
              { value: '10+', label: 'Features' },
              { value: '100%', label: 'Secure' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              DocVault brings together all the tools needed for academic file management in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-[#1e293b] rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4`}>
                  <FontAwesomeIcon icon={feature.icon} className="text-white text-lg" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 px-6 bg-[#1e293b]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built for Everyone</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Three dedicated roles, each with a tailored experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.title} className="bg-[#0f172a] rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg mb-5`}>
                  <FontAwesomeIcon icon={role.icon} className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-xl mb-4">{role.title}</h3>
                <ul className="space-y-3">
                  {role.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-slate-400 text-sm">
                      <span className="text-indigo-400 mt-0.5">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faFolder} className="text-white text-xs" />
            </div>
            <span className="text-white font-bold">DocVault</span>
          </div>
          <p className="text-slate-500 text-sm">
            File Sharing System — B.Tech Mini Project © 2026
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;