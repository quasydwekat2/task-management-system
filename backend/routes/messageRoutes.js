import express from 'express';
import Message from '../models/Message.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get messages between current user and another user
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    
    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content
    });
    
    const savedMessage = await newMessage.save();
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.patch('/read/:userId', verifyToken, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, recipient: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;