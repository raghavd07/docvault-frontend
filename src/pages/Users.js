import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faUserSlash, faUserCheck, faTrash, faKey, faTimes
} from '@fortawesome/free-solid-svg-icons';

const API = process.env.REACT_APP_API_URL;
const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch {
      toast.error('Failed to load departments');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users', form);
      toast.success('User created successfully');
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'student', department: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await API.put(`/users/${id}/deactivate`);
      toast.success('User deactivated');
      fetchUsers();
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await API.put(`/users/${id}/reactivate`);
      toast.success('User reactivated');
      fetchUsers();
    } catch {
      toast.error('Failed to reactivate user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/users/${resetUserId}/reset-password`, { password: newPassword });
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
      setResetUserId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const roleColors = {
    admin: 'bg-red-500/20 text-red-400',
    faculty: 'bg-blue-500/20 text-blue-400',
    student: 'bg-green-500/20 text-green-400',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">User Management</h1>
            <p className="text-slate-400 text-sm mt-1">Manage all users</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-surface border border-borderSubtle rounded-lg overflow-hidden">

          <div className="grid grid-cols-6 px-6 py-4 border-b border-borderSubtle text-slate-400 text-sm font-medium">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Department</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {users.map((u) => (
            <div
              key={u._id}
              className="grid grid-cols-6 px-6 py-4 border-b border-borderSubtle last:border-0 items-center hover:bg-surface/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-200 text-sm">{u.name}</span>
              </div>

              <span className="text-slate-400 text-sm">{u.email}</span>

              <span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${roleColors[u.role]}`}>
                  {u.role}
                </span>
              </span>

              <span className="text-slate-400 text-sm">
                {u.department?.name || 'N/A'}
              </span>

              <span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </span>

              <div className="flex items-center gap-2">

                {u.role !== 'admin' && (
                  <>
                    {u.isActive ? (
                      <button
                        onClick={() => handleDeactivate(u._id)}
                        className="p-2 rounded-lg hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400"
                      >
                        <FontAwesomeIcon icon={faUserSlash} className="text-xs" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(u._id)}
                        className="p-2 rounded-lg hover:bg-green-500/20 text-slate-400 hover:text-green-400"
                      >
                        <FontAwesomeIcon icon={faUserCheck} className="text-xs" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setResetUserId(u._id);
                        setShowResetModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-400"
                    >
                      <FontAwesomeIcon icon={faKey} className="text-xs" />
                    </button>

                    <button
                      onClick={() => handleDelete(u._id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </>
                )}

              </div>
            </div>
          ))}

        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-borderSubtle rounded-xl p-6 w-full max-w-md">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold">Create User</h2>
              <button onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">

              <input
                type="text"
                placeholder="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
              />

              <input
                type="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
              />

              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>

              {form.role !== 'admin' && (
  <select
    value={form.department}
    onChange={(e) => setForm({ ...form, department: e.target.value })}
    className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
  >
    <option value="">Select Department</option>
    {departments.map((d) => (
      <option key={d._id} value={d._id}>{d.name}</option>
    ))}
  </select>
)}

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
              >
                Create User
              </button>

            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-borderSubtle rounded-xl p-6 w-full max-w-md">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold">Reset Password</h2>
              <button onClick={() => setShowResetModal(false)}>
                <FontAwesomeIcon icon={faTimes} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded-lg bg-background border border-borderSubtle text-white"
              />

              <button
                type="submit"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg"
              >
                Reset Password
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
