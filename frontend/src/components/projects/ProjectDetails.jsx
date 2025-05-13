// src/components/projects/ProjectDetails.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import EditTaskModal from '../tasks/EditTaskModal';
import StatusBadge from '../common/StatusBadge';
import LiveProgressBar from '../common/LiveProgressBar';
import Swal from 'sweetalert2';

function ProjectDetails({ project, onBack, onRefresh }) {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch project tasks
  useEffect(() => {
    fetchProjectTasks();
  }, [project._id, refreshKey]);
  
  // Filter tasks for student view
  useEffect(() => {
    if (tasks.length > 0) {
      if (currentUser.role !== 'admin') {
        // Students only see their assigned tasks
        setFilteredTasks(tasks.filter(task => 
          (task.assignedTo?._id === currentUser._id) || 
          (task.assignedTo === currentUser._id)
        ));
      } else {
        // Admins see all tasks
        setFilteredTasks(tasks);
      }
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, currentUser]);
  
  const fetchProjectTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/tasks/project/${project._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load project tasks',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#374151'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getShortTaskId = (task) => {
    return task._id ? task._id.substring(0, 6) : 'N/A';
  };
  
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Refresh project to update progress
      if (onRefresh) onRefresh();
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: 'Task status has been updated successfully',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#374151'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task status',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#374151'
      });
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    
    // Refresh project to update progress
    if (onRefresh) onRefresh();
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    
    // Admin-only check
    if (currentUser.role !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only administrators can delete tasks',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#e5e7eb' : '#374151'
      });
      return;
    }
    
    Swal.fire({
      title: 'Delete Task',
      text: 'Are you sure you want to delete this task?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isDarkMode ? '#3085d6' : '#2563eb',
      cancelButtonColor: isDarkMode ? '#d33' : '#dc2626',
      confirmButtonText: 'Yes, delete it!',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#111827'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The task has been deleted successfully.',
            timer: 1500,
            showConfirmButton: false,
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827'
          });
          
          // Refresh tasks and project
          setRefreshKey(prev => prev + 1);
          if (onRefresh) onRefresh();
        } catch (error) {
          console.error('Error deleting task:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete task. Please try again.',
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827'
          });
        }
      }
    });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Projects
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-blue-400 font-bold mb-4 transition-all duration-300">{project.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2 transition-all duration-300">Description</h3>
            <p className="text-gray-800 dark:text-white transition-all duration-300">{project.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-2 transition-all duration-300">Details</h3>
            <p className="mb-2 transition-all duration-300">
              <span className="text-gray-500 dark:text-gray-400">Category:</span>{' '}
              <span className="text-gray-800 dark:text-white">{project.category}</span>
            </p>
            <p className="mb-2 transition-all duration-300">
              <span className="text-gray-500 dark:text-gray-400">Students:</span>{' '}
              <span className="text-gray-800 dark:text-white">{project.students.map(student => student.username || student).join(', ')}</span>
            </p>
            <p className="mb-2 transition-all duration-300">
              <span className="text-gray-500 dark:text-gray-400">Start Date:</span>{' '}
              <span className="text-gray-800 dark:text-white">{formatDate(project.startDate)}</span>
            </p>
            <p className="mb-2 transition-all duration-300">
              <span className="text-gray-500 dark:text-gray-400">End Date:</span>{' '}
              <span className="text-gray-800 dark:text-white">{formatDate(project.endDate)}</span>
            </p>
            <p className="mb-2 transition-all duration-300">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>{' '}
              <span className="inline-block ml-1">
                <StatusBadge status={project.status} />
              </span>
            </p>
            <div className="mt-4">
              {/* Use LiveProgressBar instead of static progress bar */}
              <LiveProgressBar value={project.progress} />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl md:text-2xl text-gray-900 dark:text-blue-400 font-bold mb-4 transition-all duration-300">
          {currentUser.role === 'admin' ? 'Tasks' : 'Your Tasks'}
        </h2>
        
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 mx-auto transition-all duration-300"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 transition-all duration-300">
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Task ID</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Project</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Task Name</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Description</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Assigned Student</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Status</th>
                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Due Date</th>
                    {currentUser.role === 'admin' && (
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300 transition-all duration-300">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Use filteredTasks instead of tasks */}
                  {filteredTasks.map(task => (
                    <tr 
                      key={task._id} 
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-300"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{getShortTaskId(task)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{project.title}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{task.name}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{task.description}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{task.assignedTo?.username || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{formatDate(task.dueDate)}</td>
                      {currentUser.role === 'admin' && (
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => handleDeleteTask(e, task._id)}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                            aria-label="Delete task"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {currentUser.role === 'admin' 
              ? 'No tasks found for this project.' 
              : 'You have no tasks assigned in this project.'}
            <p className="mt-2">
              {currentUser.role === 'admin'
                ? 'Add tasks from the Tasks page.'
                : 'Check with your instructor for task assignments.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEditTaskModal && selectedTask && (
        <EditTaskModal 
          task={selectedTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdateTask={handleUpdateTask}
          projects={[project]} // Only pass the current project
          projectId={project._id} // Force project selection
        />
      )}
    </div>
  );
}

export default ProjectDetails;