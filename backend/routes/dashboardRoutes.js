

import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get overall dashboard stats (Admin only)
 * @access  Protected
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Ensure only admin can access this route
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


router.get('/stats/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Allow only admin or the student themself
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


