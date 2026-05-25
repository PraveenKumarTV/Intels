// Global variables
let currentFolderId = null;
let currentNoteId = null;
let folders = [];
let notes = [];
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  registerServiceWorker();
  loadFolders();
  setupEventListeners();
});

// Service Worker Registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {

      const registration = await navigator.serviceWorker.register('/sw.js');

      console.log('Service Worker registered:', registration);

      // Force update check
      registration.update();

    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
}

// Setup Event Listeners
function setupEventListeners() {
  document.getElementById('folderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    createFolder();
  });

  document.getElementById('noteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    createNote();
  });

  document.getElementById('editFolderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    updateFolder();
  });

  document.getElementById('editNoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    updateNote();
  });
}

// Show Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toast.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
  toast.classList.add(`bg-${type}`);
  toastMessage.textContent = message;
  
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// FOLDER OPERATIONS

// Load all folders
async function loadFolders() {
  try {
    const response = await fetch(`${API_BASE}/folders`);
    if (!response.ok) throw new Error('Failed to load folders');
    
    folders = await response.json();
    renderFolders();
    
    if (folders.length === 0) {
      showEmptyState();
    }
  } catch (error) {
    console.error('Error loading folders:', error);
    showToast('Error loading folders', 'danger');
  }
}

// Render folders in sidebar
function renderFolders() {
  const foldersList = document.getElementById('foldersList');
  foldersList.innerHTML = '';
  
  folders.forEach(folder => {
    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    folderItem.onclick = () => selectFolder(folder._id);
    
    if (currentFolderId === folder._id) {
      folderItem.classList.add('active');
    }
    
    folderItem.innerHTML = `
      <div class="folder-item-content">
        <i class="fas fa-folder" style="color: ${folder.color}"></i>
        <span class="folder-name">${folder.name}</span>
      </div>
      <div class="folder-item-actions">
        <button class="btn-icon" onclick="event.stopPropagation(); editFolder('${folder._id}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" onclick="event.stopPropagation(); deleteFolder('${folder._id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    foldersList.appendChild(folderItem);
  });
}

// Select folder
async function selectFolder(folderId) {
  currentFolderId = folderId;
  renderFolders();
  
  try {
    const response = await fetch(`${API_BASE}/notes/folder/${folderId}`);
    if (!response.ok) throw new Error('Failed to load notes');
    
    notes = await response.json();
    
    // Get folder details
    const folder = folders.find(f => f._id === folderId);
    
    // Update header
    document.getElementById('folderTitle').textContent = folder.name;
    document.getElementById('folderDesc').textContent = folder.description || 'No description';
    
    // Show folder content
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('folderContent').style.display = 'block';
    
    // Render notes
    renderNotes();
  } catch (error) {
    console.error('Error selecting folder:', error);
    showToast('Error loading notes', 'danger');
  }
}

// Create folder
async function createFolder() {
  const name = document.getElementById('folderName').value;
  const description = document.getElementById('folderDesc').value;
  const color = document.querySelector('input[name="folderColor"]:checked').value;
  
  if (!name.trim()) {
    showToast('Please enter a folder name', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color })
    });
    
    if (!response.ok) throw new Error('Failed to create folder');
    
    const newFolder = await response.json();
    folders.push(newFolder);
    
    // Clear form and close modal
    document.getElementById('folderForm').reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('folderModal'));
    modal.hide();
    
    // Select new folder
    selectFolder(newFolder._id);
    showToast('Folder created successfully!');
    renderFolders();
  } catch (error) {
    console.error('Error creating folder:', error);
    showToast('Error creating folder', 'danger');
  }
}

// Edit folder
async function editFolder(folderId) {
  const folder = folders.find(f => f._id === folderId);
  
  if (!folder) return;
  
  document.getElementById('editFolderName').value = folder.name;
  document.getElementById('editFolderDesc').value = folder.description;
  document.querySelector(`input[name="editFolderColor"][value="${folder.color}"]`).checked = true;
  
  const modal = new bootstrap.Modal(document.getElementById('editFolderModal'));
  modal.show();
  
  // Store current folder ID for update
  window.editingFolderId = folderId;
}

// Update folder
async function updateFolder() {
  const folderId = window.editingFolderId;
  const name = document.getElementById('editFolderName').value;
  const description = document.getElementById('editFolderDesc').value;
  const color = document.querySelector('input[name="editFolderColor"]:checked').value;
  
  if (!name.trim()) {
    showToast('Please enter a folder name', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color })
    });
    
    if (!response.ok) throw new Error('Failed to update folder');
    
    // Reload folders
    await loadFolders();
    
    if (currentFolderId === folderId) {
      selectFolder(folderId);
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editFolderModal'));
    modal.hide();
    
    showToast('Folder updated successfully!');
  } catch (error) {
    console.error('Error updating folder:', error);
    showToast('Error updating folder', 'danger');
  }
}

// Delete folder
async function deleteFolder(folderId) {
  if (!confirm('Are you sure you want to delete this folder and all its notes?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/folders/${folderId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete folder');
    
    folders = folders.filter(f => f._id !== folderId);
    
    if (currentFolderId === folderId) {
      currentFolderId = null;
      showEmptyState();
    }
    
    renderFolders();
    showToast('Folder deleted successfully!');
  } catch (error) {
    console.error('Error deleting folder:', error);
    showToast('Error deleting folder', 'danger');
  }
}

// Delete current folder
function deleteCurrentFolder() {
  if (currentFolderId) {
    deleteFolder(currentFolderId);
  }
}

// NOTE OPERATIONS

// Render notes in grid
function renderNotes() {
  const notesGrid = document.getElementById('notesGrid');
  const noNotesState = document.getElementById('noNotesState');
  
  if (notes.length === 0) {
    notesGrid.style.display = 'none';
    noNotesState.style.display = 'block';
    return;
  }
  
  notesGrid.style.display = 'grid';
  noNotesState.style.display = 'none';
  notesGrid.innerHTML = '';
  
  notes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.style.backgroundColor = note.color;
    
    const truncatedContent = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
    
    noteCard.innerHTML = `
      <div class="note-card-header">
        <h5 class="note-title">${note.title}</h5>
        <button class="btn-icon" onclick="event.stopPropagation(); togglePin('${note._id}', ${note.isPinned})">
          <i class="fas fa-thumbtack ${note.isPinned ? 'active' : ''}"></i>
        </button>
      </div>
      <div class="note-content">${truncatedContent}</div>
      <div class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</div>
      <div class="note-actions">
        <button class="btn-icon" onclick="event.stopPropagation(); viewNote('${note._id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-icon" onclick="event.stopPropagation(); openEditNote('${note._id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" onclick="event.stopPropagation(); deleteNote('${note._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    noteCard.onclick = () => viewNote(note._id);
    notesGrid.appendChild(noteCard);
  });
}

// Create note
async function createNote() {
  if (!currentFolderId) {
    showToast('Please select a folder first', 'warning');
    return;
  }
  
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  const color = document.querySelector('input[name="noteColor"]:checked').value;
  
  if (!title.trim()) {
    showToast('Please enter a note title', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        folderId: currentFolderId,
        color
      })
    });
    
    if (!response.ok) throw new Error('Failed to create note');
    
    const newNote = await response.json();
    notes.push(newNote);
    
    // Clear form and close modal
    document.getElementById('noteForm').reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('noteModal'));
    modal.hide();
    
    renderNotes();
    showToast('Note created successfully!');
  } catch (error) {
    console.error('Error creating note:', error);
    showToast('Error creating note', 'danger');
  }
}

// View note
async function viewNote(noteId) {
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`);
    if (!response.ok) throw new Error('Failed to load note');
    
    const note = await response.json();
    
    document.getElementById('viewNoteTitle').textContent = note.title;
    document.getElementById('viewNoteContent').innerHTML = `<p>${note.content.replace(/\n/g, '<br>')}</p>`;
    
    currentNoteId = noteId;
    
    const modal = new bootstrap.Modal(document.getElementById('viewNoteModal'));
    modal.show();
  } catch (error) {
    console.error('Error viewing note:', error);
    showToast('Error loading note', 'danger');
  }
}

// Open edit note modal
async function openEditNote(noteId) {
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`);
    if (!response.ok) throw new Error('Failed to load note');
    
    const note = await response.json();
    
    document.getElementById('editNoteTitle').value = note.title;
    document.getElementById('editNoteContent').value = note.content;
    document.querySelector(`input[name="editNoteColor"][value="${note.color}"]`).checked = true;
    
    currentNoteId = noteId;
    
    // Close view modal if open
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewNoteModal'));
    if (viewModal) viewModal.hide();
    
    const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
    modal.show();
  } catch (error) {
    console.error('Error opening edit modal:', error);
    showToast('Error loading note', 'danger');
  }
}

// Update note
async function updateNote() {
  const noteId = currentNoteId;
  const title = document.getElementById('editNoteTitle').value;
  const content = document.getElementById('editNoteContent').value;
  const color = document.querySelector('input[name="editNoteColor"]:checked').value;
  
  if (!title.trim()) {
    showToast('Please enter a note title', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, color })
    });
    
    if (!response.ok) throw new Error('Failed to update note');
    
    // Reload notes
    const notesResponse = await fetch(`${API_BASE}/notes/folder/${currentFolderId}`);
    notes = await notesResponse.json();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    modal.hide();
    
    renderNotes();
    showToast('Note updated successfully!');
  } catch (error) {
    console.error('Error updating note:', error);
    showToast('Error updating note', 'danger');
  }
}

// Delete note
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete note');
    
    notes = notes.filter(n => n._id !== noteId);
    
    // Close modals
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewNoteModal'));
    if (viewModal) viewModal.hide();
    
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editNoteModal'));
    if (editModal) editModal.hide();
    
    renderNotes();
    showToast('Note deleted successfully!');
  } catch (error) {
    console.error('Error deleting note:', error);
    showToast('Error deleting note', 'danger');
  }
}

// Delete current note
function deleteCurrentNote() {
  if (currentNoteId) {
    deleteNote(currentNoteId);
  }
}

// Edit current note
function editCurrentNote() {
  if (currentNoteId) {
    openEditNote(currentNoteId);
  }
}

// Toggle pin note
async function togglePin(noteId, isPinned) {
  try {
    const response = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: !isPinned })
    });
    
    if (!response.ok) throw new Error('Failed to update note');
    
    const noteIndex = notes.findIndex(n => n._id === noteId);
    if (noteIndex !== -1) {
      notes[noteIndex].isPinned = !isPinned;
    }
    
    renderNotes();
  } catch (error) {
    console.error('Error toggling pin:', error);
  }
}

// Show empty state
function showEmptyState() {
  document.getElementById('emptyState').style.display = 'block';
  document.getElementById('folderContent').style.display = 'none';
}
