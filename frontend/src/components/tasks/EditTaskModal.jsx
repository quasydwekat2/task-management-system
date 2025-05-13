// src/components/tasks/EditTaskModal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

function EditTaskModal({ task, onClose, onUpdateTask, projects = [] }) {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Convert projectId to string if it's an object
  const initialProjectId = task.projectId?._id || task.projectId || '';
  
  const [name, setName] = useState(task.name || '');
  const [description, setDescription] = useState(task.description || '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId.toString());
  const [assignedToId, setAssignedToId] = useState(
    task.assignedTo?._id || task.assignedTo || ''
  );
  const [dueDate, setDueDate] = useState(formatDate(task.dueDate) || '');
  const [status, setStatus] = useState(task.status || 'Pending');
  const [studentOptions, setStudentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectEndDate, setProjectEndDate] = useState(null);

  // Format date helper
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        // Get project end date
        if (selectedProjectId) {
          // Find the project in the projects array
          const project = projects.find(p => 
            p._id.toString() === selectedProjectId.toString()
          );
          
          if (project) {
            setProjectEndDate(project.endDate);
          } else {
            try {
              // If not found locally, fetch from API
              const projectRes = await axios.get(`http://localhost:5000/api/projects/${selectedProjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setProjectEndDate(projectRes.data.endDate);
            } catch (err) {
              console.error('Error fetching project details:', err);
            }
          }
        }
        
        // Fetch student options (only needed for admin)
        if (currentUser.role === 'admin') {
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
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjectId, projects, isDarkMode, currentUser.role]);

  const handleProjectChange = (e) => {
    const newProjectId = e.target.value;
    setSelectedProjectId(newProjectId);
    
    // Update project end date
    const project = projects.find(p => p._id.toString() === newProjectId.toString());
    if (project) {
      setProjectEndDate(project.endDate);
    }
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

  const handleDueDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (!validateDueDate(selectedDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Task due date cannot be after project end date.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
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
    
    // Validate inputs based on role
    if (currentUser.role === 'admin') {
      if (!name || !description || !assignedToId || !dueDate || !status || !selectedProjectId) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: 'Please fill in all required fields',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827'
        });
        
        setIsSubmitting(false);
        return;
      }
    } else {
      // For students, only validate fields they can edit
      if (!description || !status) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          text: 'Please fill in all required fields',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#f9fafb' : '#111827'
        });
        
        setIsSubmitting(false);
        return;
      }
    }

    // Create updated task object - Only include fields that the current user role can update
    let updatedTask = {};
    
    if (currentUser.role === 'admin') {
      updatedTask = {
        name,
        description,
        projectId: selectedProjectId,
        assignedTo: assignedToId,
        dueDate,
        status
      };
    } else {
      // Students can only update status and description
      updatedTask = {
        description,
        status
      };
    }
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Make the API call to update the task
      const response = await axios.put(`http://localhost:5000/api/tasks/${task._id}`, updatedTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Close the modal
      onClose();
      
      // Call the update callback
      onUpdateTask(response.data);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Task Updated',
        text: 'The task has been successfully updated',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update task. Please try again.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
      
      setIsSubmitting(false);
    }
  };

  // Find the current project object
  const currentProject = projects.find(p => p._id.toString() === selectedProjectId.toString());
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 dark:border-gray-700">
          <h2 className="text-2xl text-blue-400 dark:text-blue-400 font-bold transition-all duration-300">
            Update Task
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 dark:hover:text-white text-2xl transition-all duration-300"
          >
            &times;
          </button>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mx-auto transition-all duration-300"></div>
            <p className="mt-4 text-gray-300 dark:text-gray-300 transition-all duration-300">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Project Title - Show for everyone but only admin can edit */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Project Title:</label>
              <select 
                className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                value={selectedProjectId}
                onChange={handleProjectChange}
                required
                disabled={currentUser.role !== 'admin'} // Only admin can change project
              >
                {projects.length > 0 ? (
                  <>
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option 
                        key={project._id} 
                        value={project._id}
                      >
                        {project.title}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value={selectedProjectId}>
                    {currentProject ? currentProject.title : "Loading project..."}
                  </option>
                )}
              </select>
              {currentUser.role !== 'admin' && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1 transition-all duration-300">
                  Only administrators can change the project assignment
                </p>
              )}
            </div>
            
            {/* Task Name - Show for everyone but only admin can edit */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Task Name:</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={currentUser.role !== 'admin'} // Only admin can change name
              />
              {currentUser.role !== 'admin' && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1 transition-all duration-300">
                  Only administrators can change the task name
                </p>
              )}
            </div>
            
            {/* Description - Editable for everyone */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Description:</label>
              <textarea 
                className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 h-24 transition-all duration-300"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            {/* Student Assignment - Only visible for admins */}
            {currentUser.role === 'admin' && (
              <div className="mb-4">
                <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Assigned Student:</label>
                <select 
                  className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  required
                >
                  <option value="">Select a student</option>
                  {studentOptions.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Status - Editable for everyone */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Status:</label>
              <select 
                className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Due Date - Show for everyone but only admin can edit */}
            <div className="mb-6">
              <label className="block mb-2 text-gray-300 dark:text-gray-300 transition-all duration-300">Due Date:</label>
              <input 
                type="date" 
                className="w-full p-2 bg-gray-700 dark:bg-gray-700 border border-gray-600 dark:border-gray-600 rounded text-white dark:text-white focus:outline-none focus:border-blue-500 transition-all duration-300"
                value={dueDate}
                onChange={handleDueDateChange}
                required
                disabled={currentUser.role !== 'admin'} // Only admin can change due date
                max={projectEndDate ? formatDate(projectEndDate) : ''}
              />
              {projectEndDate && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-400 transition-all duration-300">
                  Project end date: {formatDate(projectEndDate)}
                </p>
              )}
              {currentUser.role !== 'admin' && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1 transition-all duration-300">
                  Only administrators can change the due date
                </p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full p-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditTaskModal;