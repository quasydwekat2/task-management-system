import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = {
      projects: await Project.countDocuments(),
      students: await User.countDocuments({ role: 'student' }),
      tasks: await Task.countDocuments(),
      finishedProjects: await Project.countDocuments({ status: 'Completed' })
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;