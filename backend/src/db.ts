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

// Define a type for Chat Messages within an Adventure
export type ChatMessage = {
  id: string; // Unique ID for each message
  role: 'user' | 'assistant'; // 'assistant' for AI/DM responses
  content: string;
  timestamp: string;
  // userId could be added if non-owners can participate, but for now, adventure implies owner
};

// Define a type for structured explicit memories
export type MemoryItem = {
  id: string; // Unique ID for the memory item
  text: string; // The content of the memory
  createdAt: string; // Timestamp of when the memory was created
  // Potentially: lastRecalledAt, relevanceScore, keywords for future enhancements
};

// Define D&D Character Stats
export type CharacterStats = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

// Define Character Skills
export type CharacterSkills = {
  [key: string]: number; // Skill name and proficiency bonus
};

// Define D&D Character Traits/Features
export type CharacterTrait = {
  id: string;
  name: string;
  description: string;
  source: string; // e.g., 'race', 'class', 'background', 'feat'
};

// Define D&D Character Equipment/Inventory
export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  equipped: boolean;
};

// Define a Character in the adventure
export type Character = {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experiencePoints: number;
  stats: CharacterStats;
  skills: CharacterSkills;
  traits: CharacterTrait[];
  inventory: InventoryItem[];
  hitPoints: {
    current: number;
    maximum: number;
  };
  armorClass: number;
  proficiencyBonus: number;
  createdAt: string;
  updatedAt: string;
};

// Define a type for our Adventure
export type Adventure = {
  id: string; // Unique ID for the adventure
  userId: string; // ID of the user who owns this adventure
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[]; // Array to store chat history for this adventure
  explicitMemories: MemoryItem[]; // Array to store explicit, structured memories
  characters: Character[]; // Array of characters in this adventure
  playerCount: number; // Number of players in this adventure
};

// Define a type for our database schema
type Schema = {
  users: User[];
  adventures: Adventure[]; // Added adventures array
  // We removed nextId as we are using UUIDs for IDs now
};

// Create database instance and set defaults
const adapter = new FileSync<Schema>(path.join(dataDir, 'db.json'));
const db = low(adapter);

// Set default data: Initialize with empty users and adventures arrays if they don't exist.
db.defaults({ users: [], adventures: [] }).write();

// Ensure all adventures have the explicitMemories field
db.get('adventures').value().forEach(adventure => {
  if (adventure.explicitMemories === undefined) {
    // @ts-ignore // Temporary ignore for type mismatch during migration
    adventure.explicitMemories = [];
  }
  
  // Add characters array if it doesn't exist
  if (adventure.characters === undefined) {
    // @ts-ignore // Temporary ignore for type mismatch during migration
    adventure.characters = [];
  }
  
  // Add playerCount if it doesn't exist
  if (adventure.playerCount === undefined) {
    // @ts-ignore // Temporary ignore for type mismatch during migration
    adventure.playerCount = 1; // Default to 1 player
  }
});
db.write(); // Write changes if any migration happened

export default db; 