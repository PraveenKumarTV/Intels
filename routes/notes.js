const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all note routes
router.use(authenticate);

// Get all notes for a folder (belonging to current user)
router.get('/folder/:folderId', async (req, res) => {
  try {
    const notes = await Note.find({ 
      folderId: req.params.folderId, 
      userId: req.user.uid 
    }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching note' });
  }
});

// Create new note
router.post('/', async (req, res) => {
  try {
    const { title, content, folderId, color } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Note title is required' });
    }

    // Explicitly check for user ID
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User identification failed' });
    }

    // Check if folder exists and belongs to user
    const folder = await Folder.findOne({ _id: folderId, userId: req.user.uid });
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found or unauthorized' });
    }

    const note = new Note({
      userId: req.user.uid, // Save the unique Firebase UID
      title: title.trim(),
      content: content || '',
      folderId,
      color: color || '#ffffff'
    });

    console.log('Saving note for user:', req.user.uid);
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Note creation error:', error);
    res.status(500).json({ error: 'Error creating note' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, color, isPinned } = req.body;

    if (title && title.trim() === '') {
      return res.status(400).json({ error: 'Note title cannot be empty' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      {
        title: title || undefined,
        content: content !== undefined ? content : undefined,
        color: color || undefined,
        isPinned: isPinned !== undefined ? isPinned : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error updating note' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting note' });
  }
});

module.exports = router;
