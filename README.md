# Clyde DM - Fantasy RPG Interface

Clyde DM is an interactive fantasy RPG interface for dungeon masters and players, featuring a beautiful arcane UI and user authentication.

## Features

- **User authentication** with signup, login, and logout
- **Session persistence** across browser sessions
- **Protected routes** that require authentication
- **Beautiful arcane-themed UI**
- **Responsive chat interface**
- **Simple file-based database** for user data
- **Advanced memory system** powered by local Ollama inference

## Quick Start

### One-Click Startup

Simply run the `start.bat` file in the root directory to start both the backend and frontend servers automatically.

The application will launch and open in your default browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Manual Setup

If you prefer to start the servers separately:

1. **Backend:**
   ```
   cd backend
   npm install
   npm run dev
   ```
   (The backend will run on port 5000 by default, or the port specified in `backend/.env`)

2. **Frontend:**
   - Create a `.env` file in the project root by copying `.env.example`.
     ```
     # In the project root directory
     cp .env.example .env
     ```
   - The `.env` file should contain:
     ```
     VITE_API_BASE_URL=http://localhost:5000
     ```
   - Then run:
     ```
     npm run dev -- --port 3000
     ```
   (Or simply `npm run dev` and it will usually pick port 3000 if available, or another one if 3000 is busy. The `start.bat` specifically sets it to 3000.)

## Project Structure

- **Frontend:** React with TypeScript, using shadcn/ui components (runs on port 3000)
- **Backend:** Express server with a simple file-based database using lowdb (runs on port 5000)

## User Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in or signs up:

1. The server validates credentials and returns a JWT token
2. This token is stored in the browser's localStorage
3. The token is sent with subsequent requests to authenticate the user
4. Protected routes check for a valid token before allowing access

## Development

### Backend API Endpoints

(Accessible at http://localhost:5000)

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get user information (protected route)

### Database

User data is stored in a simple JSON file at `backend/data/db.json`. This file is automatically created on first run.

## Built With

- **React** - Frontend framework
- **TypeScript** - Type safety
- **Express** - Backend server
- **lowdb** - Simple file-based JSON database
- **JWT** - Authentication tokens
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Memory System (Optional)

The application includes an advanced memory system that enhances the AI dungeon master by:
- Automatically identifying and saving important moments and information during play
- Recalling relevant memories when needed for context

To use this feature:

1. Install Ollama from [ollama.com/download](https://ollama.com/download)
2. Start the Ollama service
3. Pull the required model: `ollama pull qwen3:8b-q4_K_M`

If Ollama is not available, the application will continue to function without the memory features.
