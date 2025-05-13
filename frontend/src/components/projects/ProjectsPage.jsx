import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ProjectCard from './ProjectCard';
import ProjectDetails from './ProjectDetails';
import AddProjectModal from './AddProjectModal';
import Swal from 'sweetalert2';

function ProjectsPage() {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const endpoint = currentUser.role === 'admin' 
        ? 'http://localhost:5000/api/projects' 
        : `http://localhost:5000/api/projects/student/${currentUser._id}`;
      
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects(res.data);
      setFilteredProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load projects. Please try again.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter projects based on search term and status filter
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleAddProject = async (newProject) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/projects', newProject, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setProjects([...projects, res.data]);
      setShowAddModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Project Added',
        text: 'The project has been successfully created',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    } catch (error) {
      console.error('Error adding project:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add project. Please try again.',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    }
  };

  // New function to handle project deletion
  const handleDeleteProject = async (projectId) => {
    Swal.fire({
      title: 'Delete Project',
      text: 'Are you sure you want to delete this project? All related tasks will be deleted automatically.',
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
          await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Update local state
          setProjects(projects.filter(project => project._id !== projectId));
          setFilteredProjects(filteredProjects.filter(project => project._id !== projectId));
          
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'The project and all related tasks have been deleted.',
            timer: 1500,
            showConfirmButton: false,
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827'
          });
        } catch (error) {
          console.error('Error deleting project:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete project. Please try again.',
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827'
          });
        }
      }
    });
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
          <h1 className="text-3xl text-blue-500 font-bold mb-4 md:mb-0">Projects Overview</h1>
          
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Add New Project
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search projects by title or description..."
            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>On Hold</option>
            <option>Cancelled</option>
          </select>
        </div>
        
        {selectedProject ? (
          <ProjectDetails 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
            onRefresh={fetchProjects}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <ProjectCard 
                  key={project._id} 
                  project={project} 
                  onClick={() => handleProjectClick(project)}
                  onDelete={handleDeleteProject}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-400">
                No projects found. {currentUser.role === 'admin' && "Click 'Add New Project' to create one."}
              </div>
            )}
          </div>
        )}
        
        {showAddModal && (
          <AddProjectModal 
            onClose={() => setShowAddModal(false)}
            onAddProject={handleAddProject}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;