
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import StatusBadge from '../common/StatusBadge';
import Swal from 'sweetalert2';

function TasksPage() {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering refreshes

  useEffect(() => {
    fetchTasksAndProjects();
  }, [currentUser, refreshKey]); // Add refreshKey dependency to trigger re-fetch

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch projects first - different endpoints for admin/student
      const projectsEndpoint = currentUser.role === 'admin' 
        ? 'http://localhost:5000/api/projects' 
        : `http://localhost:5000/api/projects/student/${currentUser._id}`;
      
      const projectsRes = await axios.get(projectsEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(projectsRes.data);
      
      // Then fetch tasks - different endpoints for admin/student
      const tasksEndpoint = currentUser.role === 'admin' 
        ? 'http://localhost:5000/api/tasks' 
        : `http://localhost:5000/api/tasks/student/${currentUser._id}`;
      
      const tasksRes = await axios.get(tasksEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTasks(tasksRes.data);
      setFilteredTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching tasks and projects:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load tasks and projects. Please try again.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply status filter
    if (selectedStatus) {
      const filtered = tasks.filter(task => task.status === selectedStatus);
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, selectedStatus]);

  // Helper function to get project title
  const getProjectTitle = (task) => {
    // If projectId is already populated
    if (task.projectId && typeof task.projectId === 'object' && task.projectId.title) {
      return task.projectId.title;
    }
    
    // If projectId is just an ID, find the project in the projects array
    const projectId = task.projectId?.toString() || '';
    const project = projects.find(p => p._id.toString() === projectId);
    
    return project ? project.title : 'Unknown Project';
  };

  const handleAddTask = (newTask) => {
    // Refresh tasks by incrementing refreshKey
    setRefreshKey(prev => prev + 1);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    // Refresh tasks by incrementing refreshKey
    setRefreshKey(prev => prev + 1);
  };

  // Task deletion function - Only for admin
  const handleDeleteTask = async (e, taskId) => {
    // Stop event propagation to prevent task row click
    e.stopPropagation();
    
    if (currentUser.role !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only administrators can delete tasks.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
      return;
    }
    
    // Show confirmation dialog
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
          
          // Call API to delete task
          await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The task has been deleted successfully.',
            timer: 1500,
            showConfirmButton: false,
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827'
          });
          
          // Refresh tasks
          setRefreshKey(prev => prev + 1);
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

  // Update task status with live progress update
  const handleStatusChange = async (taskId, newStatus) => {
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
      
      // Update local state immediately for feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Also refresh all data to get updated project progress
      setRefreshKey(prev => prev + 1);
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: 'Task status has been updated successfully',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task status',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Function to get a shortened task ID
  const getShortTaskId = (task) => {
    return task._id ? task._id.substring(0, 6) : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 transition-all duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 transition-all duration-300"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-900 min-h-screen transition-all duration-300">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 mt-14 lg:mt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white font-bold mb-4 md:mb-0 transition-all duration-300">
            {currentUser.role === 'admin' ? 'Tasks Overview' : 'Your Tasks'}
          </h1>
          
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Create a New Task
          </button>
        </div>
        
        {/* Status filter */}
        <div className="flex items-center mb-6">
          <div className="relative w-48">
            <label className="block text-gray-700 dark:text-gray-300 mb-1 transition-all duration-300">Status:</label>
            <select
              className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {filteredTasks.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300">
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
                  {filteredTasks.map(task => (
                    <tr 
                      key={task._id} 
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-all duration-300"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{getShortTaskId(task)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200 transition-all duration-300">{getProjectTitle(task)}</td>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-10 text-center shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <p className="text-gray-500 dark:text-gray-400 transition-all duration-300">No tasks found with the selected status.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal 
          onClose={() => setShowAddTaskModal(false)}
          onAddTask={handleAddTask}
          projects={projects}
          allStudents={true}
        />
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && selectedTask && (
        <EditTaskModal 
          task={selectedTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdateTask={handleUpdateTask}
          projects={projects}
        />
      )}
    </div>
  );
}

export default TasksPage;