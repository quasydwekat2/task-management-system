import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AddProjectModal({ onClose, onAddProject }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [students, setStudents] = useState([]);
  const [categories] = useState([
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'DevOps',
    'Security',
    'E-commerce'
  ]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users/students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load students. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const openCalendar = (type) => {
    setCalendarType(type);
    setShowCalendar(true);
  };

  const handleDateSelect = (date) => {
    if (calendarType === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setShowCalendar(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !description || selectedStudents.length === 0 || !category || !startDate || !endDate || !status) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
      });
      return;
    }
    
    const newProject = {
      title,
      description,
      students: selectedStudents,
      category,
      startDate,
      endDate,
      status,
      progress: 0
    };
    
    onAddProject(newProject);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl text-blue-400 font-bold">Add New Project</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Project Title:</label>
            <input 
              type="text" 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Project Description:</label>
            <textarea 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Students List:</label>
            {loading ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded p-2">
                {students.length > 0 ? (
                  students.map(student => (
                    <div key={student._id} className="mb-1 flex items-center">
                      <input 
                        type="checkbox" 
                        id={`student-${student._id}`}
                        className="mr-2 h-5 w-5"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentSelection(student._id)}
                      />
                      <label htmlFor={`student-${student._id}`} className="text-white cursor-pointer">
                        {student.username} {student.universityId ? `(${student.universityId})` : ''}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-2">No students available</p>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-gray-300">Project Category:</label>
            <select 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-gray-300">Starting Date:</label>
              <input 
                type="date" 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300">Ending Date:</label>
              <input 
                type="date" 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">Project Status:</label>
            <select 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none"
          >
            Add Project
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;