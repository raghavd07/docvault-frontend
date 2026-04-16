import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { user } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    admin: 'from-red-500 to-pink-600',
    faculty: 'from-blue-500 to-cyan-600',
    student: 'from-green-500 to-emerald-600',
  };

  const roleGradient = roleColors[user?.role] || 'from-indigo-500 to-purple-600';

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-24 pr-4 py-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:p-6">

          {/* Profile Card */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-white text-xl font-bold mb-1">{user?.name}</h2>
            <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize bg-gradient-to-r ${roleGradient} text-white`}>
              {user?.role}
            </span>

            <div className="w-full mt-6 pt-6 border-t border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Role</span>
                <span className="text-white capitalize">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Email</span>
                <span className="text-white truncate max-w-[150px]">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faKey} className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Change Password</h2>
                <p className="text-slate-400 text-xs">Make sure your new password is strong</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm pr-12"
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                    <FontAwesomeIcon icon={showCurrent ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm pr-12"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                    <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    className={`w-full bg-[#0f172a] border text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm pr-12 ${
                      form.confirmPassword && form.newPassword !== form.confirmPassword
                        ? 'border-red-500/50' : 'border-slate-600'
                    }`}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                    <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                  </button>
                </div>
                {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;