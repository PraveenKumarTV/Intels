const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Note = require('../models/Note');

// Get all folders
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Get folder by ID with notes count
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    const notesCount = await Note.countDocuments({ folderId: req.params.id });
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

    const folder = new Folder({
      name: name.trim(),
      description: description || '',
      color: color || '#4f46e5'
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
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

    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
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
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete all notes in this folder
    await Note.deleteMany({ folderId: req.params.id });
    
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

module.exports = router;
