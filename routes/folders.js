const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Note = require('../models/Note');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all folder routes
router.use(authenticate);

// Get all folders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Get folder by ID (for the authenticated user)
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    const notesCount = await Note.countDocuments({ folderId: req.params.id, userId: req.user.uid });
    res.json({ ...folder.toObject(), notesCount });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folder' });
  }
});

// Create new folder
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Explicitly check for user ID from the authenticated token
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User identification failed. Please sign in again.' });
    }

    const folder = new Folder({
      userId: req.user.uid, // This field must be present in the Mongoose Model
      name: name.trim(),
      description: description || '',
      color: color || '#4f46e5'
    });

    console.log('Saving folder for user:', req.user.uid);
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (name && name.trim() === '') {
      return res.status(400).json({ error: 'Folder name cannot be empty' });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        color: color || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Error updating folder' });
  }
});

// Delete folder and all notes in it
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete all notes in this folder that belong to the user
    await Note.deleteMany({ folderId: req.params.id, userId: req.user.uid });
    
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

module.exports = router;
