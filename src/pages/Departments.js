import { useState, useEffect } from 'react';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBuilding, faTrash, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/departments', form);
      toast.success('Department created successfully');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setEditForm({ name: dept.name, description: dept.description });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/departments/${selectedDept._id}`, editForm);
      toast.success('Department updated successfully');
      setShowEditModal(false);
      setSelectedDept(null);
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await API.delete(`/departments/${id}`);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Departments</h1>
            <p className="text-slate-400 mt-1">Manage academic departments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg hover:shadow-indigo-500/25"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Department
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 lg:grid-cols-3 gap-5">
          {departments.length === 0 && (
            <p className="text-slate-500 col-span-3 text-center py-12">No departments found.</p>
          )}
          {departments.map((dept) => (
            <div key={dept._id} className="bg-[#1e293b] rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-200 p-4 md:p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faBuilding} className="text-white text-lg" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{dept.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{dept.description || 'No description provided'}</p>
              <p className="text-slate-500 text-xs">
                Created {new Date(dept.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-xl font-bold text-white">Create Department</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter department description..."
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm resize-none h-24"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition">
                  Create
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-xl font-bold text-white">Edit Department</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Enter department description..."
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm resize-none h-24"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition">
                  Update
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;