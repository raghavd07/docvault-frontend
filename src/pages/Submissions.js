import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faDownload, faEye,
  faTimes, faClipboard, faFilePdf, faFileWord,
  faFileExcel, faFilePowerpoint, faFileImage,
  faFileArchive, faFileAlt, faFile
} from '@fortawesome/free-solid-svg-icons';

const getFileIcon = (mimetype) => {
  if (!mimetype) return faFile;
  if (mimetype.includes('pdf')) return faFilePdf;
  if (mimetype.includes('word')) return faFileWord;
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return faFileExcel;
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return faFilePowerpoint;
  if (mimetype.includes('image')) return faFileImage;
  if (mimetype.includes('zip') || mimetype.includes('rar')) return faFileArchive;
  return faFileAlt;
};

const getFileColor = (mimetype) => {
  if (!mimetype) return 'from-slate-500 to-slate-600';
  if (mimetype.includes('pdf')) return 'from-red-500 to-rose-600';
  if (mimetype.includes('word')) return 'from-blue-500 to-blue-600';
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'from-green-500 to-emerald-600';
  if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return 'from-orange-500 to-red-500';
  if (mimetype.includes('image')) return 'from-purple-500 to-pink-600';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return 'from-yellow-500 to-orange-500';
  return 'from-slate-500 to-slate-600';
};

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course: '', file: null });

  useEffect(() => { fetchSubmissions(); fetchCourses(); }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get('/submissions');
      setSubmissions(res.data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get('/courses');
      setCourses(res.data);
    } catch (error) { }
  };

  const filteredCourses = courses.filter((c) => {
    const userId = user?.id || user?._id;
    if (user?.role === 'admin') return true;
    if (user?.role === 'faculty') return c.faculty?.some((f) => f._id === userId || f === userId);
    if (user?.role === 'student') return c.students?.some((s) => s._id === userId || s === userId);
    return false;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('course', form.course);
    formData.append('file', form.file);
    try {
      await API.post('/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Assignment submitted!');
      setShowModal(false);
      setForm({ title: '', description: '', course: '', file: null });
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      await API.delete(`/submissions/${id}`);
      toast.success('Submission deleted');
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to delete submission');
    }
  };

  const handleDownload = async (sub) => {
    try {
      const res = await API.get(`/submissions/${sub._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', sub.file?.originalName || sub.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleView = async (sub) => {
    if (!sub.file?.path) {
      toast.error('File path not found');
      return;
    }
    try {
      const res = await API.get(`/submissions/${sub._id}/view`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: sub.file?.mimetype || 'application/pdf' }));
      window.open(url, '_blank');
    } catch (e) {
      toast.error('Failed to view submission');
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
            <h1 className="text-3xl font-bold text-white">Submissions</h1>
            <p className="text-slate-400 mt-1">
              {user?.role === 'student' ? 'Your submitted assignments' : 'View all student submissions'}
            </p>
          </div>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg hover:shadow-indigo-500/25"
            >
              <FontAwesomeIcon icon={faPlus} />
              Submit Assignment
            </button>
          )}
        </div>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {submissions.length === 0 && (
            <div className="col-span-4 text-center py-16">
              <FontAwesomeIcon icon={faClipboard} className="text-slate-600 text-5xl mb-4" />
              <p className="text-slate-500">No submissions found.</p>
            </div>
          )}
          {submissions.map((sub) => (
            <div key={sub._id} className="bg-[#1e293b] rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-200 p-5">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(sub.file?.mimetype)} flex items-center justify-center shadow-lg mb-4`}>
                <FontAwesomeIcon icon={getFileIcon(sub.file?.mimetype)} className="text-white text-lg" />
              </div>

              {/* Info */}
              <h3 className="text-white font-medium text-sm mb-1 truncate">{sub.title}</h3>
              <p className="text-slate-500 text-xs mb-1 truncate">{sub.student?.name}</p>
              <p className="text-slate-500 text-xs mb-3 truncate">{sub.course?.name}</p>

              {/* Date */}
              <p className="text-slate-600 text-xs mb-4">
                {new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-700/50 mt-auto">
                <button
                  onClick={() => handleView(sub)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition text-xs gap-1"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => handleDownload(sub)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-700/50 hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition text-xs gap-1"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
                {(user?.role === 'admin' || sub.student?._id === user?._id) && (
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-xl font-bold text-white">Submit Assignment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter assignment title"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Enter description"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course</label>
                <select
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  required
                >
                  <option value=''>Select Course</option>
                  {filteredCourses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">File</label>
                <div className="w-full bg-[#0f172a] border border-slate-600 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="file"
                    className="hidden"
                    id="subFileInput"
                    onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                    required
                  />
                  <label htmlFor="subFileInput" className="cursor-pointer">
                    {form.file ? (
                      <p className="text-indigo-400 text-sm font-medium">{form.file.name}</p>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="text-slate-400 text-2xl mb-2" />
                        <p className="text-slate-400 text-sm">Click to browse files</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl transition">
                  Submit
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">
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

export default Submissions;