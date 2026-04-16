import { useState, useEffect } from 'react';
import API from '../utils/axios';
import { toast } from 'react-toastify';
import Sidebar from '../components/layout/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import {
  faPlus, faBook, faTrash, faTimes,
  faChalkboardTeacher, faUserGraduate, faEdit, faCheck, faTimesCircle, faClock
} from '@fortawesome/free-solid-svg-icons';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  
  const [form, setForm] = useState({ name: '', code: '', description: '', department: '' });
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', department: '' });

  const [selectedForEnrollment, setSelectedForEnrollment] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const promises = [
        API.get('/courses'),
        API.get('/departments')
      ];
      if (user?.role === 'admin') {
        promises.push(API.get('/users'));
        promises.push(API.get('/courses/enrollment-requests'));
      }
      
      const results = await Promise.all(promises);
      setCourses(results[0].data);
      setDepartments(results[1].data);
      
      if (user?.role === 'admin') {
        setFaculty(results[2].data.filter((u) => u.role === 'faculty'));
        setEnrollmentRequests(results[3].data);
      }
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

  const handleToggleEnrollment = (courseId) => {
    setSelectedForEnrollment(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const submitEnrollment = async () => {
    if (selectedForEnrollment.length === 0) return toast.info("Select at least one course");
    try {
      await API.post('/courses/enroll-request', { courseIds: selectedForEnrollment });
      toast.success('Enrollment request submitted to admin');
      setSelectedForEnrollment([]);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit enrollment request');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await API.put(`/courses/enrollment-requests/${id}/approve`);
      toast.success('Enrollment approved');
      fetchAll();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await API.put(`/courses/enrollment-requests/${id}/reject`);
      toast.success('Enrollment rejected');
      fetchAll();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-indigo-400 text-xl animate-pulse">Loading...</div>
    </div>
  );

  const displayCourses = user?.role === 'admin' 
    ? courses 
    : courses.filter(c => {
        const deptId = c.department?._id || c.department;
        const userDeptId = typeof user?.department === 'object' ? user.department?._id : user?.department;
        return deptId === userDeptId;
      });

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-24 pr-4 py-4 md:p-8">

        {/* Requests Section limit to Admin */}
        {user?.role === 'admin' && enrollmentRequests.filter(r => r.status === 'pending').length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Enrollment Requests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollmentRequests.filter(r => r.status === 'pending').map(req => (
                <div key={req._id} className="bg-[#1e293b] p-4 rounded-xl border border-indigo-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{req.student?.name} <span className="text-xs text-slate-400 block">{req.student?.email}</span></h3>
                    <FontAwesomeIcon icon={faClock} className="text-yellow-500" />
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Requested {req.courses?.length} courses: 
                    <span className="text-white block mt-1">
                      {req.courses?.map(c => c.code).join(', ')}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveRequest(req._id)} className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 py-1.5 rounded-lg text-sm transition">Approve</button>
                    <button onClick={() => handleRejectRequest(req._id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 rounded-lg text-sm transition">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Courses</h1>
            <p className="text-slate-400">
              {user?.role === 'admin' ? 'Manage academic courses' : 'View and enroll in department courses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'student' && selectedForEnrollment.length > 0 && (
              <button
                onClick={submitEnrollment}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg"
              >
                <FontAwesomeIcon icon={faCheck} />
                Enroll Selected ({selectedForEnrollment.length})
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-lg"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create Course
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 lg:grid-cols-3 gap-5">
          {displayCourses.length === 0 && (
            <p className="text-slate-500 col-span-3 text-center py-12">No courses found for your department.</p>
          )}
          {displayCourses.map((course) => {
            const isEnrolled = course.students?.some(s => s._id === user._id || s === user._id);
            const isPending = enrollmentRequests.some(r => r.student?._id === user._id && r.status === 'pending' && r.courses.some(c => c._id === course._id));

            return (
              <div key={course._id} className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-4 md:p-6 group hover:border-indigo-500/50 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {user?.role === 'student' && !isEnrolled && !isPending && (
                      <input 
                        type="checkbox" 
                        checked={selectedForEnrollment.includes(course._id)}
                        onChange={() => handleToggleEnrollment(course._id)}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-800"
                      />
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faBook} className="text-white text-lg" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${isEnrolled ? 'bg-green-500/20 text-green-400' : isPending ? 'bg-yellow-500/20 text-yellow-500' : 'bg-indigo-500/20 text-indigo-400'} ${user?.role === 'admin' ? 'group-hover:hidden' : ''}`}>
                      {isEnrolled ? 'Enrolled' : isPending ? 'Pending' : course.code}
                    </span>
                    {user?.role === 'admin' && (
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
                    )}
                  </div>
                </div>

                <h3 className="text-white font-semibold text-lg mb-1">{course.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{course.description || 'No description'}</p>

                <div className="flex flex-col gap-3 mb-4 text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1.5">
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-400 text-xs" />
                      <span>{course.faculty?.length || 0} Faculty</span>
                    </div>
                    {user?.role === 'admin' && course.faculty?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {course.faculty.map(f => (
                          <span key={f._id || f} className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-300">{f.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1.5">
                      <FontAwesomeIcon icon={faUserGraduate} className="text-green-400 text-xs" />
                      <span>{course.students?.length || 0} Enrolled Students</span>
                    </div>
                    {user?.role === 'admin' && course.students?.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                         {course.students.map(s => (
                           <span key={s._id || s} className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-300 truncate max-w-[120px]">{s.name}</span>
                         ))}
                      </div>
                    )}
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => { setSelectedCourse(course); setShowAssignModal(true); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition"
                    >
                      <FontAwesomeIcon icon={faChalkboardTeacher} className="text-xs" />
                      Assign Faculty
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Modals */}
      {user?.role === 'admin' && showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
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

      {user?.role === 'admin' && showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
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

      {user?.role === 'admin' && showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 w-full max-w-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
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

    </div>
  );
};

export default Courses;