import dotenv from 'dotenv';
// Configure dotenv as early as possible
dotenv.config(); 

import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth';
import path from 'path';
import fs from 'fs';

// Ensure .env file exists with default values if not already present
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'JWT_SECRET=verysecretkey12345\nPORT=5000');
  console.log('Created default .env file with PORT=5000. Please restart if this was the first run.');
  // Reload .env if it was just created
  dotenv.config({ override: true }); 
}

const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port: ${PORT}`); // Log the port

const app = express();

// Init Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Define Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close the other application or change the PORT in .env file.`);
    process.exit(1);
  } else {
    console.error('An error occurred while starting the server:', err);
    process.exit(1);
  }
}); 