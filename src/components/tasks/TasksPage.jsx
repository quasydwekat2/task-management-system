// // src/components/tasks/TasksPage.jsx - Updated table structure
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import Sidebar from '../common/Sidebar';
// import { useAuth } from '../../contexts/AuthContext';
// import AddTaskModal from './AddTaskModal';
// import EditTaskModal from './EditTaskModal';
// import Swal from 'sweetalert2';

// function TasksPage() {
//   const { currentUser } = useAuth();
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState('Task Status');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState('');
//   const [showAddTaskModal, setShowAddTaskModal] = useState(false);
//   const [showEditTaskModal, setShowEditTaskModal] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);

//   useEffect(() => {
//     fetchTasksAndProjects();
//   }, [currentUser]);

//   const fetchTasksAndProjects = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       // Fetch projects first
//       const projectsEndpoint = currentUser.role === 'admin' 
//         ? 'http://localhost:5000/api/projects' 
//         : `http://localhost:5000/api/projects/student/${currentUser._id}`;
      
//       const projectsRes = await axios.get(projectsEndpoint, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setProjects(projectsRes.data);
      
//       // Then fetch tasks
//       const tasksEndpoint = currentUser.role === 'admin' 
//         ? 'http://localhost:5000/api/tasks' 
//         : `http://localhost:5000/api/tasks/student/${currentUser._id}`;
      
//       const tasksRes = await axios.get(tasksEndpoint, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
      
//       setTasks(tasksRes.data);
//       setFilteredTasks(tasksRes.data);
//     } catch (error) {
//       console.error('Error fetching tasks and projects:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to load tasks and projects. Please try again.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Apply filters
//     let filtered = [...tasks];
    
//     if (selectedProject) {
//       filtered = filtered.filter(task => {
//         const taskProjectId = task.projectId?._id || task.projectId;
//         return taskProjectId && taskProjectId.toString() === selectedProject.toString();
//       });
//     }
    
//     if (selectedStatus) {
//       filtered = filtered.filter(task => task.status === selectedStatus);
//     }
    
//     // Apply sorting
//     switch (sortBy) {
//       case 'Task Status':
//         filtered.sort((a, b) => {
//           const statusOrder = { 'Completed': 3, 'In Progress': 1, 'Pending': 2, 'On Hold': 4, 'Cancelled': 5 };
//           return statusOrder[a.status] - statusOrder[b.status];
//         });
//         break;
//       case 'Project':
//         filtered.sort((a, b) => {
//           const projectA = getProjectTitle(a);
//           const projectB = getProjectTitle(b);
//           return projectA.localeCompare(projectB);
//         });
//         break;
//       case 'Due Date':
//         filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
//         break;
//       case 'Assigned Student':
//         filtered.sort((a, b) => {
//           const studentA = a.assignedTo?.username || '';
//           const studentB = b.assignedTo?.username || '';
//           return studentA.localeCompare(studentB);
//         });
//         break;
//       default:
//         break;
//     }
    
//     setFilteredTasks(filtered);
//   }, [tasks, sortBy, selectedProject, selectedStatus, projects]);

//   // Helper function to get project title
//   const getProjectTitle = (task) => {
//     // If projectId is already populated
//     if (task.projectId && typeof task.projectId === 'object' && task.projectId.title) {
//       return task.projectId.title;
//     }
    
//     // If projectId is just an ID, find the project in the projects array
//     const projectId = task.projectId?.toString() || '';
//     const project = projects.find(p => p._id.toString() === projectId);
    
//     return project ? project.title : 'Unknown Project';
//   };

//   const handleTaskStatusChange = async (taskId, newStatus, e) => {
//     if (e) {
//       e.stopPropagation(); // Prevent row click
//     }
    
//     try {
//       const token = localStorage.getItem('token');
//       await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, 
//         { status: newStatus },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
      
//       // Update the local state
//       setTasks(prevTasks => 
//         prevTasks.map(task => 
//           task._id === taskId ? { ...task, status: newStatus } : task
//         )
//       );
      
//       Swal.fire({
//         icon: 'success',
//         title: 'Status Updated',
//         text: 'Task status has been updated successfully',
//         timer: 1500,
//         showConfirmButton: false
//       });
//     } catch (error) {
//       console.error('Error updating task status:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to update task status',
//       });
//     }
//   };

//   const handleAddTask = (newTask) => {
//     fetchTasksAndProjects(); // Refresh all data after adding a task
//   };

//   const handleTaskClick = (task) => {
//     if (currentUser.role === 'admin') {
//       setSelectedTask(task);
//       setShowEditTaskModal(true);
//     }
//   };

//   const handleUpdateTask = (updatedTask) => {
//     fetchTasksAndProjects(); // Refresh all data after updating a task
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
//   };

//   // Function to get a shortened task ID
//   const getShortTaskId = (task) => {
//     return task._id ? task._id.substring(0, 6) : 'N/A';
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex bg-gray-900 min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-3xl text-blue-500 font-bold mb-4 md:mb-0">Tasks Overview</h1>
          
//           {currentUser.role === 'admin' && (
//             <button
//               onClick={() => setShowAddTaskModal(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//             >
//               Create a New Task
//             </button>
//           )}
//         </div>
        
//         <div className="flex flex-col md:flex-row gap-4 mb-6">
//           <div className="relative">
//             <label className="block text-gray-400 mb-1">Sort By:</label>
//             <select
//               className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 w-full md:w-48"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option>Task Status</option>
//               <option>Project</option>
//               <option>Due Date</option>
//               <option>Assigned Student</option>
//             </select>
//           </div>
          
//           <div className="relative">
//             <label className="block text-gray-400 mb-1">Project:</label>
//             <select
//               className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 w-full"
//               value={selectedProject}
//               onChange={(e) => setSelectedProject(e.target.value)}
//             >
//               <option value="">All Projects</option>
//               {projects.map(project => (
//                 <option key={project._id} value={project._id}>
//                   {project.title}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="relative">
//             <label className="block text-gray-400 mb-1">Status:</label>
//             <select
//               className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 w-full md:w-48"
//               value={selectedStatus}
//               onChange={(e) => setSelectedStatus(e.target.value)}
//             >
//               <option value="">All Statuses</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Completed">Completed</option>
//               <option value="Pending">Pending</option>
//               <option value="On Hold">On Hold</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>
//           </div>
//         </div>
        
//         {filteredTasks.length > 0 ? (
//           <div className="bg-gray-800 rounded-lg overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-700">
//                     <th className="px-4 py-2 text-left">Task ID</th>
//                     <th className="px-4 py-2 text-left">Project</th>
//                     <th className="px-4 py-2 text-left">Task Name</th>
//                     <th className="px-4 py-2 text-left">Description</th>
//                     <th className="px-4 py-2 text-left">Assigned Student</th>
//                     <th className="px-4 py-2 text-left">Status</th>
//                     <th className="px-4 py-2 text-left">Due Date</th>
//                     {currentUser.role === 'admin' && <th className="px-4 py-2 text-left">Actions</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredTasks.map(task => (
//                     <tr 
//                       key={task._id} 
//                       className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
//                       onClick={() => handleTaskClick(task)}
//                     >
//                       <td className="px-4 py-3">{getShortTaskId(task)}</td>
//                       <td className="px-4 py-3">{getProjectTitle(task)}</td>
//                       <td className="px-4 py-3">{task.name}</td>
//                       <td className="px-4 py-3">{task.description}</td>
//                       <td className="px-4 py-3">{task.assignedTo?.username || 'Unassigned'}</td>
//                       <td className="px-4 py-3">
//                         <span className={`${
//                           task.status === 'Completed' ? 'text-green-400' :
//                           task.status === 'In Progress' ? 'text-blue-400' :
//                           task.status === 'Pending' ? 'text-yellow-400' :
//                           task.status === 'On Hold' ? 'text-gray-400' :
//                           'text-red-400'} font-medium`}
//                         >
//                           {task.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">{formatDate(task.dueDate)}</td>
//                       {currentUser.role === 'admin' && (
//                         <td className="px-4 py-3 relative">
//                           <button 
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleTaskStatusChange(task._id, 
//                                 task.status === 'Pending' ? 'In Progress' :
//                                 task.status === 'In Progress' ? 'Completed' :
//                                 task.status === 'Completed' ? 'Pending' :
//                                 task.status === 'On Hold' ? 'In Progress' :
//                                 'Pending'
//                               );
//                             }}
//                             className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
//                           >
//                             {task.status === 'Pending' ? 'Start' :
//                              task.status === 'In Progress' ? 'Complete' :
//                              task.status === 'Completed' ? 'Reopen' :
//                              task.status === 'On Hold' ? 'Resume' :
//                              task.status === 'Cancelled' ? 'Reopen' : 'Start'}
//                           </button>
//                         </td>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-gray-800 rounded-lg p-10 text-center">
//             <p className="text-gray-400">No tasks found with the selected filters.</p>
//           </div>
//         )}
//       </div>

//       {/* Add Task Modal */}
//       {showAddTaskModal && (
//         <AddTaskModal 
//           onClose={() => setShowAddTaskModal(false)}
//           onAddTask={handleAddTask}
//           projectId={selectedProject || null}
//           projects={projects}
//           allStudents={true}
//         />
//       )}

//       {/* Edit Task Modal */}
//       {showEditTaskModal && selectedTask && (
//         <EditTaskModal 
//           task={selectedTask}
//           onClose={() => {
//             setShowEditTaskModal(false);
//             setSelectedTask(null);
//           }}
//           onUpdateTask={handleUpdateTask}
//           projects={projects}
//         />
//       )}
//     </div>
//   );
// }

// export default TasksPage;


// src/components/tasks/TasksPage.jsx - Keep only Status filter
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import Swal from 'sweetalert2';

function TasksPage() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasksAndProjects();
  }, [currentUser]);

  const fetchTasksAndProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch projects first
      const projectsEndpoint = currentUser.role === 'admin' 
        ? 'http://localhost:5000/api/projects' 
        : `http://localhost:5000/api/projects/student/${currentUser._id}`;
      
      const projectsRes = await axios.get(projectsEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProjects(projectsRes.data);
      
      // Then fetch tasks
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
    fetchTasksAndProjects(); // Refresh all data after adding a task
  };

  const handleTaskClick = (task) => {
    if (currentUser.role === 'admin') {
      setSelectedTask(task);
      setShowEditTaskModal(true);
    }
  };

  const handleUpdateTask = (updatedTask) => {
    fetchTasksAndProjects(); // Refresh all data after updating a task
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl text-blue-500 font-bold mb-4 md:mb-0">Tasks Overview</h1>
          
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create a New Task
            </button>
          )}
        </div>
        
        {/* Keep only the Status filter */}
        <div className="flex items-center mb-6">
          <div className="relative w-48">
            <label className="block text-gray-400 mb-1">Status:</label>
            <select
              className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 w-full"
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
                  {filteredTasks.map(task => (
                    <tr 
                      key={task._id} 
                      className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <td className="px-4 py-3">{getShortTaskId(task)}</td>
                      <td className="px-4 py-3">{getProjectTitle(task)}</td>
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
          <div className="bg-gray-800 rounded-lg p-10 text-center">
            <p className="text-gray-400">No tasks found with the selected status.</p>
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