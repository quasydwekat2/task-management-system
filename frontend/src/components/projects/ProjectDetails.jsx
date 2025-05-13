// src/components/projects/ProjectDetails.jsx - Updated with new task table format
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import EditTaskModal from '../tasks/EditTaskModal';
import Swal from 'sweetalert2';

function ProjectDetails({ project, onBack, onRefresh }) {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  useEffect(() => {
    fetchProjectTasks();
  }, [project._id]);
  
  const fetchProjectTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
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

  // Function to get a shortened task ID
  const getShortTaskId = (task) => {
    return task._id ? task._id.substring(0, 6) : 'N/A';
  };
  
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Refresh project details to update progress
      if (onRefresh) onRefresh();
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: 'Task status has been updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task status',
      });
    }
  };

  // Handle clicking on a task row
  const handleTaskClick = (task) => {
    if (currentUser.role === 'admin') {
      setSelectedTask(task);
      setShowEditTaskModal(true);
    }
  };

  // Handle updating a task
  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      )
    );
    
    // Refresh project details
    if (onRefresh) onRefresh();
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-blue-400 hover:text-blue-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Projects
        </button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl text-blue-500 font-bold mb-4">{project.title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-xl text-gray-300 mb-2">Description</h3>
            <p className="text-white">{project.description}</p>
          </div>
          
          <div>
            <h3 className="text-xl text-gray-300 mb-2">Details</h3>
            <p className="mb-2">
              <span className="text-gray-400">Category:</span> {project.category}
            </p>
            <p className="mb-2">
              <span className="text-gray-400">Students:</span> {project.students.map(student => student.username || student).join(', ')}
            </p>
            <p className="mb-2">
              <span className="text-gray-400">Start Date:</span> {formatDate(project.startDate)}
            </p>
            <p className="mb-2">
              <span className="text-gray-400">End Date:</span> {formatDate(project.endDate)}
            </p>
            <p className="mb-2">
              <span className="text-gray-400">Status:</span> {project.status}
            </p>
            <div className="mt-4">
              <p className="text-gray-400 mb-1">Progress: {project.progress}%</p>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className={`${project.progress >= 100 ? 'bg-green-500' : 
                               project.progress >= 75 ? 'bg-blue-500' : 
                               project.progress >= 50 ? 'bg-yellow-500' : 
                               'bg-red-500'} h-4 rounded-full`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl text-blue-400 font-bold mb-4">Tasks</h2>
        
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2 text-left">Task ID</th>
                    <th className="px-4 py-2 text-left">Project</th>
                    <th className="px-4 py-2 text-left">Task Name</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Assigned Student</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr 
                      key={task._id} 
                      className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-4 py-3">{getShortTaskId(task)}</td>
                      <td className="px-4 py-3">{project.title}</td>
                      <td className="px-4 py-3">{task.name}</td>
                      <td className="px-4 py-3">{task.description}</td>
                      <td className="px-4 py-3">{task.assignedTo?.username || 'Unassigned'}</td>
                      <td className="px-4 py-3">
                        <span className={`${
                          task.status === 'Completed' ? 'text-green-400' :
                          task.status === 'In Progress' ? 'text-blue-400' :
                          task.status === 'Pending' ? 'text-yellow-400' :
                          task.status === 'On Hold' ? 'text-gray-400' :
                          'text-red-400'} font-medium`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(task.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No tasks found for this project.
            <p className="mt-2">Add tasks from the Tasks page.</p>
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