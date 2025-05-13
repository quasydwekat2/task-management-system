

import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();


// Get all projects (Admin: all, Student: own only)
router.get('/', verifyToken, async (req, res) => {
  try {
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

// Get a single project by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('students', 'username');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isStudentAssigned = project.students.some(student => student._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isStudentAssigned) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new project (Admin only)
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
    const populatedProject = await Project.findById(savedProject._id).populate('students', 'username');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project details (Admin only)
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

// Update project progress (Admin only)
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

// Delete a project and its associated tasks (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId });
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    res.json({ message: 'Project and related tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Helper: Update project progress automatically based on task completion
 */
export const updateProjectProgress = async (projectId) => {
  try {
    const tasks = await Task.find({ projectId });

    if (tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }

    const completedTasks = tasks.filter(task => task.status === 'Completed');
    const progress = Math.round((completedTasks.length / tasks.length) * 100);

    const project = await Project.findById(projectId);
    project.progress = progress;

    if (progress === 100 && project.status !== 'Completed') {
      project.status = 'Completed';
    } else if (progress < 100 && project.status === 'Completed') {
      project.status = 'In Progress';
    }

    await project.save();
  } catch (error) {
    console.error('Error updating project progress:', error);
  }
};

/**
 * =======================
 * DASHBOARD STATS ROUTES
 * =======================
 */

// Admin dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const [projects, students, tasks, finishedProjects] = await Promise.all([
      Project.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Task.countDocuments(),
      Project.countDocuments({ status: 'Completed' }),
    ]);

    res.json({ projects, students, tasks, finishedProjects });
  } catch (error) {
    console.error('Dashboard stats error (admin):', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics.' });
  }
});

// Student-specific dashboard statistics
router.get('/stats/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role !== 'admin' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [projects, tasks, completedTasks, finishedProjects] = await Promise.all([
      Project.find({ students: studentId }),
      Task.find({ assignedTo: studentId }),
      Task.countDocuments({ assignedTo: studentId, status: 'Completed' }),
      Project.countDocuments({ students: studentId, status: 'Completed' }),
    ]);

    const stats = {
      projects: projects.length,
      tasks: tasks.length,
      completedTasks,
      finishedProjects,
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error (student):', error);
    res.status(500).json({ message: 'Failed to fetch student statistics.' });
  }
});

export default router;


// In projectRoutes.js - Update delete route
