import { useState, useEffect } from 'react';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faBook, faTrash, faTimes,
  faChalkboardTeacher, faUserGraduate, faEdit
} from '@fortawesome/free-solid-svg-icons';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [form, setForm] = useState({ name: '', code: '', description: '', department: '' });
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', department: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [coursesRes, deptsRes, usersRes] = await Promise.all([
        API.get('/courses'),
        API.get('/departments'),
        API.get('/users'),
      ]);
      setCourses(coursesRes.data);
      setDepartments(deptsRes.data);
      setFaculty(usersRes.data.filter((u) => u.role === 'faculty'));
      setStudents(usersRes.data.filter((u) => u.role === 'student'));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/courses', form);
      toast.success('Course created successfully');
      setShowModal(false);
      setForm({ name: '', code: '', description: '', department: '' });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditForm({
      name: course.name,
      code: course.code,
      description: course.description,
      department: course.department?._id || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/courses/${selectedCourse._id}`, editForm);
      toast.success('Course updated successfully');
      setShowEditModal(false);
      setSelectedCourse(null);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/courses/${selectedCourse._id}/assign-faculty`, { facultyId: selectedFaculty });
      toast.success('Faculty assigned successfully');
      setShowAssignModal(false);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign faculty');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/courses/${selectedCourse._id}/enroll-student`, { studentId: selectedStudent });
      toast.success('Student enrolled successfully');
      setShowEnrollModal(false);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchAll();
    } catch (error) {
      toast.error('Failed to delete course');
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
      <div className="flex-1 p-8 overflow-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Courses</h1>
            <p className="text-slate-400 mt-1">Manage academic courses</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.length === 0 && (
            <p className="text-slate-500 col-span-3 text-center py-12">No courses found.</p>
          )}
          {courses.map((course) => (
            <div key={course._id} className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-6 group hover:border-indigo-500/50 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBook} className="text-white text-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-400 group-hover:hidden">
                    {course.code}
                  </span>
                  <div className="flex gap-1 hidden group-hover:flex transition">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-semibold text-lg mb-1">{course.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{course.description || 'No description'}</p>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-400" />
                  <span>{course.faculty?.length || 0} Faculty</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-green-400" />
                  <span>{course.students?.length || 0} Students</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50 flex gap-2">
                <button
                  onClick={() => { setSelectedCourse(course); setShowAssignModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition"
                >
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-xs" />
                  Assign Faculty
                </button>
                <button
                  onClick={() => { setSelectedCourse(course); setShowEnrollModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium transition"
                >
                  <FontAwesomeIcon icon={faUserGraduate} className="text-xs" />
                  Enroll Student
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Course</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Course Name', key: 'name', placeholder: 'e.g. Data Structures' },
                { label: 'Course Code', key: 'code', placeholder: 'e.g. CS101' },
                { label: 'Description', key: 'description', placeholder: 'Enter description' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required={field.key !== 'description'}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <select
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                >
                  <option value=''>Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl transition">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Course</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              {[
                { label: 'Course Name', key: 'name', placeholder: 'e.g. Data Structures' },
                { label: 'Course Code', key: 'code', placeholder: 'e.g. CS101' },
                { label: 'Description', key: 'description', placeholder: 'Enter description' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 text-sm"
                    value={editForm[field.key]}
                    onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                    required={field.key !== 'description'}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <select
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  required
                >
                  <option value=''>Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium py-3 rounded-xl transition">Update</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Assign Faculty</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Assigning to: <span className="text-indigo-400 font-medium">{selectedCourse?.name}</span></p>
            <form onSubmit={handleAssignFaculty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Faculty</label>
                <select
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  required
                >
                  <option value=''>Select Faculty</option>
                  {faculty.map((f) => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium py-3 rounded-xl transition">Assign</button>
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Enroll Student</h2>
              <button onClick={() => setShowEnrollModal(false)} className="text-slate-400 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Enrolling in: <span className="text-green-400 font-medium">{selectedCourse?.name}</span></p>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Student</label>
                <select
                  className="w-full bg-[#0f172a] border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value=''>Select Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-3 rounded-xl transition">Enroll</button>
                <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;