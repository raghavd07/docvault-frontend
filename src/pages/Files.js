import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API, { API_URL } from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload, faFile, faTrash, faDownload, faEye,
  faShare, faTimes, faSearch, faFilePdf, faFileWord,
  faFileExcel, faFilePowerpoint, faFileImage, faFileArchive, faFileAlt
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

const Files = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareType, setShareType] = useState('specific');
  const [shareTarget, setShareTarget] = useState('');
  const [uploadForm, setUploadForm] = useState({
    name: '', description: '', course: '',
    shareType: 'private', shareTarget: '', file: null
  });

  useEffect(() => {
    fetchFiles();
    fetchCourses();
    if (user?.role === 'admin' || user?.role === 'faculty') fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await API.get('/files');
      setFiles(res.data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get('/courses');
      setCourses(res.data);
    } catch (error) {}
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.filter((u) => u.role === 'student' || u.role === 'faculty'));
    } catch (error) {}
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', uploadForm.name);
    formData.append('description', uploadForm.description);
    if (uploadForm.course) formData.append('course', uploadForm.course);
    formData.append('file', uploadForm.file);
    try {
      const res = await API.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fileId = res.data.file._id;

      // Apply sharing immediately after upload
      if (uploadForm.shareType === 'specific' && uploadForm.shareTarget) {
        await API.put(`/share/${fileId}/specific`, { userId: uploadForm.shareTarget });
      } else if (uploadForm.shareType === 'course' && uploadForm.shareTarget) {
        await API.put(`/share/${fileId}/course`, { courseId: uploadForm.shareTarget });
      }

      toast.success('File uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ name: '', description: '', course: '', shareType: 'private', shareTarget: '', file: null });
      fetchFiles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      if (shareType === 'specific') {
        await API.put(`/share/${selectedFile._id}/specific`, { userId: shareTarget });
      } else if (shareType === 'course') {
        await API.put(`/share/${selectedFile._id}/course`, { courseId: shareTarget });
      } else {
        await API.put(`/share/${selectedFile._id}/private`);
      }
      toast.success('Sharing updated!');
      setShowShareModal(false);
      fetchFiles();
    } catch (error) {
      toast.error('Failed to update sharing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await API.delete(`/files/${id}`);
      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      toast.error('Failed to delete file');
    }
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

  const handleView = (file) => {
    window.open(file.path.startsWith('http') ? file.path : `${API_URL}/` + file.path.replace(/\\/g, '/'), '_blank');
  };

  const filteredFiles = files.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-white">Files</h1>
            <p className="text-slate-400 mt-1">
              {user?.role === 'student' ? 'Files shared with you' : 'Manage and share files'}
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg hover:shadow-indigo-500/25"
            >
              <FontAwesomeIcon icon={faUpload} />
              Upload File
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            className="w-full bg-[#1e293b] border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 lg:grid-cols-3 xl:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFiles.length === 0 && (
            <p className="text-slate-500 col-span-4 text-center py-12">No files found.</p>
          )}
          {filteredFiles.map((file) => (
            <div key={file._id} className={`bg-[#1e293b] rounded-2xl border transition-all duration-200 p-5 group ${
  file.isDeleted
    ? 'border-red-500/30 opacity-60 hover:border-red-500/50'
    : 'border-slate-700/50 hover:border-indigo-500/50'
}`}>
  {file.isDeleted && (
  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400 mb-2 inline-block">
    Deleted
  </span>
)}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(file.mimetype)} flex items-center justify-center shadow-lg mb-4`}>
                <FontAwesomeIcon icon={getFileIcon(file.mimetype)} className="text-white text-lg" />
              </div>
              <h3 className="text-white font-medium text-sm mb-1 truncate">{file.name}</h3>
              <p className="text-slate-500 text-xs mb-3 truncate">{file.uploadedBy?.name}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                  file.shareType === 'public' ? 'bg-green-500/20 text-green-400' :
                  file.shareType === 'course' ? 'bg-blue-500/20 text-blue-400' :
                  file.shareType === 'specific' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {file.shareType || 'private'}
                </span>
                {file.course && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-500/20 text-indigo-400 truncate max-w-[100px]">
                    {file.course?.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => handleView(file)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition text-xs gap-1"
                >
                  <FontAwesomeIcon icon={faEye} />
                  View
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-700/50 hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition text-xs gap-1"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                  <>
                    <button
                      onClick={() => { setSelectedFile(file); setShowShareModal(true); }}
                      className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 transition"
                      title="Share"
                    >
                      <FontAwesomeIcon icon={faShare} className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      title="Delete"
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-xl font-bold text-white">Upload File</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">File Name</label>
                <input
                  type="text"
                  placeholder="Enter file name"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Enter description"
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                />
              </div>
              
              {/* Removed redundant Course selection dropdown */}

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {['private', 'specific', 'course'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUploadForm({ ...uploadForm, shareType: type, shareTarget: '' })}
                      className={`py-2 rounded-xl text-sm font-medium capitalize transition ${
                        uploadForm.shareType === type
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share Target - Specific User */}
              {uploadForm.shareType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Share With</label>
                  <select
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={uploadForm.shareTarget}
                    onChange={(e) => setUploadForm({ ...uploadForm, shareTarget: e.target.value })}
                    required
                  >
                    <option value=''>Select User</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Share Target - Course */}
              {uploadForm.shareType === 'course' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Share With Course</label>
                  <select
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={uploadForm.shareTarget}
                    onChange={(e) => setUploadForm({ ...uploadForm, shareTarget: e.target.value })}
                    required
                  >
                    <option value=''>Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select File</label>
                <div className="w-full bg-[#0f172a] border border-slate-600 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer hover:border-indigo-500 transition">
                  <input
                    type="file"
                    className="hidden"
                    id="fileInput"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    required
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    {uploadForm.file ? (
                      <p className="text-indigo-400 text-sm font-medium">{uploadForm.file.name}</p>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} className="text-slate-400 text-2xl mb-2" />
                        <p className="text-slate-400 text-sm">Click to browse files</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl transition">
                  Upload
                </button>
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
              <h2 className="text-xl font-bold text-white">Share File</h2>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Sharing: <span className="text-indigo-400 font-medium">{selectedFile?.name}</span></p>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Share Type</label>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {['specific', 'course', 'private'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setShareType(type); setShareTarget(''); }}
                      className={`py-2 rounded-xl text-sm font-medium capitalize transition ${
                        shareType === type
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {shareType === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select User</label>
                  <select
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={shareTarget}
                    onChange={(e) => setShareTarget(e.target.value)}
                    required
                  >
                    <option value=''>Select User</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              )}
              {shareType === 'course' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Course</label>
                  <select
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={shareTarget}
                    onChange={(e) => setShareTarget(e.target.value)}
                    required
                  >
                    <option value=''>Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl transition">
                  Update Sharing
                </button>
                <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">
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

export default Files;