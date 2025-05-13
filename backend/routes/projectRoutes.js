import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all projects (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // If admin, get all projects
    // If student, get only projects assigned to them
    const query = req.user.role === 'admin' ? {} : { students: req.user._id };
    
    const projects = await Project.find(query).populate('students', 'username');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get projects by student ID
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    // Ensure student can only access their own projects
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const projects = await Project.find({ students: req.params.studentId }).populate('students', 'username');
    res.json(projects);
  } catch (error) {
    console.error('Error fetching student projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('students', 'username');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Ensure student can only access projects assigned to them
    if (req.user.role !== 'admin' && !project.students.some(student => student._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, students, category, startDate, endDate, status } = req.body;
    
    const newProject = new Project({
      title,
      description,
      students,
      category,
      startDate,
      endDate,
      status,
      progress: 0
    });
    
    const savedProject = await newProject.save();
    
    // Populate students data for the response
    const populatedProject = await Project.findById(savedProject._id).populate('students', 'username');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('students', 'username');
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project progress
router.patch('/:id/progress', verifyToken, isAdmin, async (req, res) => {
  try {
    const { progress } = req.body;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true }
    ).populate('students', 'username');
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update project progress based on tasks
export const updateProjectProgress = async (projectId) => {
  try {
    // Get all tasks for the project
    const tasks = await Task.find({ projectId });
    
    if (tasks.length === 0) {
      // If no tasks, set progress to 0
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }
    
    // Calculate progress based on completed tasks
    const completedTasks = tasks.filter(task => task.status === 'Completed');
    const progress = Math.round((completedTasks.length / tasks.length) * 100);
    
    // Update project progress
    const project = await Project.findById(projectId);
    
    // Update progress
    project.progress = progress;
    
    // If all tasks are completed, mark project as completed
    if (progress === 100 && project.status !== 'Completed') {
      project.status = 'Completed';
    } else if (progress < 100 && project.status === 'Completed') {
      // If progress is not 100% but project was marked as completed, update status
      project.status = 'In Progress';
    }
    
    await project.save();
  } catch (error) {
    console.error('Error updating project progress:', error);
  }
};

// Delete project (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: req.params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;