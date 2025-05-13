import express from 'express';
import Task from '../models/Task.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { updateProjectProgress } from './projectRoutes.js';

const router = express.Router();

// Get all tasks (filtered by user role)
router.get('/', verifyToken, async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'admin') {
      // Admin can see all tasks
      tasks = await Task.find()
        .populate('assignedTo', 'username')
        .populate('projectId', 'title');
    } else {
      // Students can only see tasks assigned to them
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'username')
        .populate('projectId', 'title');
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by project ID
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'username');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by student ID
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    // Ensure student can only access their own tasks
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tasks = await Task.find({ assignedTo: req.params.studentId })
      .populate('projectId', 'title');
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username')
      .populate('projectId', 'title');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Ensure student can only access tasks assigned to them
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, projectId, assignedTo, status, dueDate } = req.body;
    
    const newTask = new Task({
      name,
      description,
      projectId,
      assignedTo,
      status,
      dueDate
    });
    
    const savedTask = await newTask.save();
    
    // Update project progress
    await updateProjectProgress(projectId);
    
    // Populate response data
    const populatedTask = await Task.findById(savedTask._id)
      .populate('assignedTo', 'username')
      .populate('projectId', 'title');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const projectId = task.projectId;
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('assignedTo', 'username')
      .populate('projectId', 'title');
    
    // Update project progress
    await updateProjectProgress(projectId);
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Students can only update their own tasks
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const projectId = task.projectId;
    
    task.status = status;
    await task.save();
    
    // Update project progress
    await updateProjectProgress(projectId);
    
    // Populate response data
    const updatedTask = await Task.findById(req.params.id)
      .populate('assignedTo', 'username')
      .populate('projectId', 'title');
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const projectId = task.projectId;
    
    await Task.findByIdAndDelete(req.params.id);
    
    // Update project progress
    await updateProjectProgress(projectId);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;