import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Define a type for our User
export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

// Define a type for our database schema
type Schema = {
  users: User[];
  nextId: number;
};

// Create database instance and set defaults
const adapter = new FileSync<Schema>(path.join(dataDir, 'db.json'));
const db = low(adapter);

// Set default data
db.defaults({ users: [], nextId: 1 }).write();

export default db; 