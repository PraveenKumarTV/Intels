const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Folder = require('../models/Folder');

// Get all notes for a folder
router.get('/folder/:folderId', async (req, res) => {
  try {
    const notes = await Note.find({ folderId: req.params.folderId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
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

    // Check if folder exists
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const note = new Note({
      title: title.trim(),
      content: content || '',
      folderId,
      color: color || '#ffffff'
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
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

    const note = await Note.findByIdAndUpdate(
      req.params.id,
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
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting note' });
  }
});

module.exports = router;
