import dotenv from 'dotenv';
// Configure dotenv as early as possible
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth';
// import chatApiRoutes from './src/routes/chatApi'; // Old chat routes, to be removed
import adventureApiRoutes from './src/routes/adventureApi'; // New adventure routes
import path from 'path';
import fs from 'fs';

// Ensure .env file exists with default values if not already present
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'JWT_SECRET=verysecretkey12345\nPORT=5000\nOPENAI_API_KEY=YOUR_OPENAI_KEY_HERE\nOLLAMA_BASE_URL=http://localhost:11434\nOLLAMA_MODEL=qwen3:8b-q4_K_M');
  console.log('Created default .env file with PORT=5000, OPENAI_API_KEY placeholder, and Ollama defaults. Please restart if this was the first run and update keys.');
  // Reload .env if it was just created
  dotenv.config({ override: true }); 
}

const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port: ${PORT}`); // Log the port

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://sneakyjp.duckdns.org:3000',
    'http://85.237.194.73:3000',
    'https://sneakyjp.duckdns.org:3000',
    'https://85.237.194.73:3000',
    // Add any other potential origins your client might connect from
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token']
};

// Init Middleware
app.use(cors(corsOptions)); // Enable CORS with configured options
app.use(express.json()); // Parse JSON bodies

// Define Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/adventures', adventureApiRoutes); // Use new adventure routes
// app.use('/api/chat', chatApiRoutes); // Remove old chat routes

// Start server with error handling
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server started on port ${PORT} and listening on all interfaces (0.0.0.0)`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the other application or change the PORT in .env file.`);
    process.exit(1);
  } else {
    console.error('An error occurred while starting the server:', err);
    process.exit(1);
  }
}); 