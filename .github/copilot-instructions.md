# Intels PWA Application - Development Instructions

## Project Overview
A Progressive Web App (PWA) notes application with folder management, built with Node.js/Express, MongoDB, Bootstrap, and Vanilla JavaScript.

## Project Structure
- **Backend**: Node.js/Express REST API
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Database**: MongoDB
- **PWA**: Service Workers, Web App Manifest
- **Deployment**: Environment variables via .env file

## Key Features Implemented
✅ Folder management (Create, Read, Update, Delete)
✅ Note CRUD operations within folders
✅ MongoDB integration
✅ Responsive design (desktop, tablet, mobile)
✅ PWA support with offline functionality
✅ Beautiful gradient UI with animations
✅ Color customization for folders and notes
✅ Pin/unpin notes functionality
✅ Environment variable configuration

## File Organization
- `server.js` - Express server entry point
- `routes/folders.js` - Folder API endpoints
- `routes/notes.js` - Note API endpoints
- `models/Folder.js` - MongoDB folder schema
- `models/Note.js` - MongoDB note schema
- `public/index.html` - Main HTML interface
- `public/app.js` - Frontend application logic
- `public/styles.css` - Custom styling
- `public/sw.js` - Service Worker for PWA
- `public/manifest.json` - PWA manifest
- `.env` - Environment configuration
- `package.json` - Dependencies and scripts

## Setup Instructions
1. Install dependencies: `npm install`
2. Ensure MongoDB is running
3. Configure `.env` file with MongoDB URI and port
4. Start app: `npm run dev` (development) or `npm start` (production)
5. Access at http://localhost:5000

## API Endpoints Summary
- `GET /api/folders` - List all folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder
- `GET /api/notes/folder/:folderId` - Get notes in folder
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Development Notes
- Frontend uses Vanilla JavaScript with Bootstrap for responsive design
- All styles use CSS variables for easy customization
- Service Worker handles offline support
- MongoDB connection configured via environment variables
- Toast notifications for user feedback

## Production Deployment
- Update NODE_ENV in .env to 'production'
- Configure MongoDB URI for production database
- Set appropriate PORT
- Use process manager like PM2
- Consider adding user authentication
- Enable HTTPS in production
