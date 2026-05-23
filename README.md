# Intels - Progressive Web App Notes Application

A modern, feature-rich Progressive Web App (PWA) for managing notes with folders. Built with Node.js, Express, MongoDB, Bootstrap, and HTML5.

## 🌟 Features

- **📁 Folder Management**: Create, edit, and delete folders to organize your notes
- **📝 Note CRUD Operations**: Full Create, Read, Update, Delete operations for notes
- **💾 MongoDB Integration**: Persistent data storage with MongoDB
- **📱 Progressive Web App**: Install and use as a mobile app on iOS and Android
- **🎨 Beautiful UI**: Modern, eye-catching design with gradient effects
- **🌈 Color Coding**: Customize folder and note colors
- **📌 Pin Notes**: Mark important notes for quick access
- **⚡ Offline Support**: Works offline with service worker caching
- **🔄 Responsive Design**: Perfectly adapted for desktop, tablet, and mobile devices
- **🚀 Fast & Lightweight**: Optimized performance with minimal dependencies
- **🔐 Environment Variables**: Secure configuration with .env file support

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4.4 or higher)

## 🚀 Installation

### 1. Clone or Navigate to Project

```bash
cd /home/praveen/Fire/Intents
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Edit the `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes-app
NODE_ENV=development
```

**Environment Variables Explanation:**
- `PORT`: The port number the server will run on (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Application environment (development/production)

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Linux/Mac
mongod

# On Windows
mongod.exe
```

### 5. Start the Application

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The app will be available at `http://localhost:5000`

## 📁 Project Structure

```
Intents/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── app.js             # Main application JavaScript
│   ├── styles.css         # Custom styles
│   ├── sw.js              # Service Worker (PWA support)
│   └── manifest.json      # PWA manifest file
├── routes/                # API routes
│   ├── folders.js         # Folder endpoints
│   └── notes.js           # Note endpoints
├── models/                # MongoDB models
│   ├── Folder.js          # Folder schema
│   └── Note.js            # Note schema
├── controllers/           # Business logic (optional)
├── server.js              # Express server setup
├── package.json           # Project dependencies
├── .env                   # Environment variables
└── README.md              # This file
```

## 🔌 API Endpoints

### Folder Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | Get all folders |
| GET | `/api/folders/:id` | Get specific folder |
| POST | `/api/folders` | Create new folder |
| PUT | `/api/folders/:id` | Update folder |
| DELETE | `/api/folders/:id` | Delete folder and notes |

### Note Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes/folder/:folderId` | Get notes in folder |
| GET | `/api/notes/:id` | Get specific note |
| POST | `/api/notes` | Create new note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

## 🎨 UI Features

### Colors
- **Primary Gradient**: Indigo to Blue (#4f46e5 → #818cf8)
- **Folder Colors**: Indigo, Purple, Pink, Red, Orange
- **Note Colors**: White, Yellow, Blue, Green, Red

### Components
- **Sidebar**: Quick folder navigation with search and create options
- **Main Content Area**: Dynamic note grid layout
- **Modals**: Create/Edit dialogs for folders and notes
- **Toast Notifications**: User feedback for actions

## 📱 PWA Features

### Install on Mobile
1. Open the app in Chrome/Safari
2. Tap the menu icon (three dots)
3. Select "Install app" or "Add to Home Screen"
4. The app will be added to your home screen

### Offline Support
- Service Worker caches all static assets
- Works offline with cached data
- Syncs when connection is restored

### App Shortcuts
- Create new folder directly from home screen

## 🛠️ Technology Stack

- **Frontend**: HTML5, Bootstrap 5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **PWA**: Service Workers, Web App Manifest
- **Icons**: Font Awesome 6
- **Styling**: CSS3 with Gradients, Animations, Responsive Design

## 📦 Dependencies

### Runtime
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `cors`: Cross-Origin Resource Sharing
- `body-parser`: Request body parsing
- `dotenv`: Environment variable management

### Development
- `nodemon`: Auto-reload development server

## 🚀 Building for Production

1. Update `.env` file with production values
2. Set `NODE_ENV=production`
3. Use process managers like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "notes-app"
```

## 📝 Usage Guide

### Creating a Folder
1. Click "New Folder" button in sidebar
2. Enter folder name
3. Add optional description
4. Choose folder color
5. Click "Create Folder"

### Creating a Note
1. Select a folder from sidebar
2. Click "New Note" button
3. Enter note title and content
4. Choose note color
5. Click "Create Note"

### Editing Content
- Click edit icon on folders or notes
- Modify the content
- Click "Update" to save changes

### Deleting Items
- Click delete icon on folders or notes
- Confirm the deletion

### Pinning Notes
- Click thumbtack icon on note cards to pin/unpin
- Pinned notes appear at the top

## 🔒 Security Considerations

- Store sensitive data in `.env` file
- Never commit `.env` file to version control
- Use environment variables for API keys
- Validate all user inputs on server side
- Consider adding authentication for production

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB is listening on the correct port

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
- Change PORT in .env file
- Or kill the process using the port

### Service Worker Issues
- Clear browser cache and service worker
- Try incognito/private mode
- Check browser console for errors

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Tips for Best Experience

1. **Desktop**: Use on desktop for full-featured experience
2. **Mobile**: Install as PWA on your phone for app-like experience
3. **Organization**: Create folders based on categories or projects
4. **Color Coding**: Use different colors to quickly identify note types
5. **Pin Important**: Use pin feature for frequently accessed notes

## 🎯 Future Enhancements

- Add user authentication
- Implement note search and filtering
- Add tags and labels
- Export notes to PDF/Word
- Collaborative notes sharing
- Cloud backup integration
- Note templates
- Voice-to-text notes

## 📞 Support

For issues or questions, check the browser console for error messages or refer to the MongoDB/Express documentation.

---

**Enjoy organizing your notes with Intels! 🎉**
