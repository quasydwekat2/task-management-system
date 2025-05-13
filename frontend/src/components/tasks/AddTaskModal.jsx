// src/components/tasks/AddTaskModal.jsx - Updated for more flexibility
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function AddTaskModal({ onClose, onAddTask, projectId = null, projects = [], students = [], allStudents = false }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [assignedToId, setAssignedToId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [studentOptions, setStudentOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectEndDate, setProjectEndDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch projects if not provided and no specific projectId
        if (projects.length === 0 && !projectId) {
          const projectsRes = await axios.get('http://localhost:5000/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProjectOptions(projectsRes.data);
        } else {
          setProjectOptions(projects);
        }
        
        // Get project end date if projectId is selected
        if (projectId) {
          const projectRes = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProjectEndDate(projectRes.data.endDate);
        } else if (selectedProjectId && projects.length > 0) {
          const project = projects.find(p => p._id === selectedProjectId);
          if (project) {
            setProjectEndDate(project.endDate);
          }
        }
        
        // Process students
        if (allStudents) {
          // Fetch all students
          const studentsRes = await axios.get('http://localhost:5000/api/users/students', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStudentOptions(studentsRes.data);
        } else if (Array.isArray(students) && students.length > 0) {
          if (typeof students[0] === 'string') {
            // Students are IDs, fetch the full data
            const promises = students.map(id => 
              axios.get(`http://localhost:5000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            );
            
            const responses = await Promise.all(promises);
            const fetchedStudents = responses.map(res => res.data);
            setStudentOptions(fetchedStudents);
          } else if (students[0]._id) {
            // Students are already full objects
            setStudentOptions(students);
          } else {
            // Fetch all students as fallback
            const studentsRes = await axios.get('http://localhost:5000/api/users/students', {
              headers: { Authorization: `Bearer ${token}` }
            });
            setStudentOptions(studentsRes.data);
          }
        } else {
          // Fetch all students as fallback
          const studentsRes = await axios.get('http://localhost:5000/api/users/students', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStudentOptions(studentsRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load data. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, projects, students, allStudents, selectedProjectId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const validateDueDate = (selectedDate) => {
    if (!projectEndDate) return true;
    
    const taskDate = new Date(selectedDate);
    const endDate = new Date(projectEndDate);
    
    // Remove time part for comparison
    taskDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return taskDate <= endDate;
  };

  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProjectId(newProjectId);
    
    // Find the project end date
    if (newProjectId && projectOptions.length > 0) {
      const project = projectOptions.find(p => p._id === newProjectId);
      if (project) {
        setProjectEndDate(project.endDate);
      }
    }
  };

  const handleDueDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (!validateDueDate(selectedDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Task due date cannot be after project end date.',
      });
      return;
    }
    
    setDueDate(selectedDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Validate inputs
    if (!name || !description || !assignedToId || !dueDate || !status || !(projectId || selectedProjectId)) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
      });
      
      setIsSubmitting(false);
      return;
    }

    // Validate due date
    if (!validateDueDate(dueDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Due Date',
        text: 'Task due date cannot be after project end date.',
      });
      
      setIsSubmitting(false);
      return;
    }

    // Create task object
    const newTask = {
      name,
      description,
      projectId: projectId || selectedProjectId,
      assignedTo: assignedToId,
      dueDate,
      status
    };
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Make the API call
      const response = await axios.post('http://localhost:5000/api/tasks', newTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Close the modal
      onClose();
      
      // Call the callback
      setTimeout(() => {
        onAddTask(response.data);
      }, 100);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Task Added',
        text: 'The task has been successfully created',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create task. Please try again.',
      });
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl text-blue-400 font-bold">Create New Task</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Project Selection - Only show if no projectId provided */}
            {!projectId && (
              <div className="mb-4">
                <label className="block mb-2 text-gray-300">Project:</label>
                <select 
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                  value={selectedProjectId}
                  onChange={handleProjectChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a project</option>
                  {projectOptions.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block mb-2 text-gray-300">Task Name:</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-gray-300">Description:</label>
              <textarea 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-gray-300">Assigned Student:</label>
              <select 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Select a student</option>
                {studentOptions.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.username}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-gray-300">Status:</label>
              <select 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 text-gray-300">Due Date:</label>
              <input 
                type="date" 
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                value={dueDate}
                onChange={handleDueDateChange}
                required
                disabled={isSubmitting}
                max={projectEndDate ? formatDate(projectEndDate) : ''}
              />
              {projectEndDate && (
                <p className="mt-1 text-xs text-gray-400">
                  Project end date: {formatDate(projectEndDate)}
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`w-full p-3 text-white rounded focus:outline-none ${
                isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Task...' : 'Add Task'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddTaskModal;