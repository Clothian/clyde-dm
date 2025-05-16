import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db, { Adventure, ChatMessage, MemoryItem, Character, CharacterStats, CharacterTrait, InventoryItem } from '../db';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware';
import OpenAI from 'openai';
import fetch from 'node-fetch'; // For making requests to Ollama

const router = express.Router();

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:8b-q4_K_M';

/**
 * Process messages with Ollama to extract and recall memories
 */
async function processMemoriesWithOllama(
  userMessage: string, 
  adventure: Adventure,
  maxMessagesToConsider: number = 10
): Promise<{ memoriesToAdd: string[], memoryIdsToRecall: string[], success: boolean }> {
  // Default return object for failed operations
  const emptyResult = { 
    memoriesToAdd: [] as string[], 
    memoryIdsToRecall: [] as string[],
    success: false 
  };
  
  try {
    // Get the most recent messages for context
    const recentMessages = adventure.messages.slice(-maxMessagesToConsider);
    
    // Create a context string from recent messages
    const conversationContext = recentMessages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    // Create a summary of existing memories
    const existingMemories = adventure.explicitMemories.map(mem => 
      `ID: ${mem.id}\nContent: ${mem.text}\nCreated: ${mem.createdAt}`
    ).join('\n\n');
    
    // Construct the prompt for Ollama
    const prompt = `
You are a dungeon master's memory manager for a fantasy RPG adventure called "${adventure.name}".

## CONTEXT:
${adventure.description}

## RECENT CONVERSATION:
${conversationContext}

## USER'S LATEST MESSAGE:
${userMessage}

## CURRENT STORED MEMORIES:
${existingMemories || "No memories stored yet."}

## TASK:
Analyze the conversation and answer TWO questions:

1. Based on the user's latest message and conversation context, what important information (if any) should be saved as a new memory?
   - Focus on key plot points, character details, important decisions, quest objectives
   - Do NOT save trivial information or basic greetings
   - ONLY create memories for TRULY significant story information

2. Which existing memories (if any) are relevant to the current conversation and should be recalled?
   - Only select memories that provide crucial context for responding to the user's latest message
   - Reference memories by their exact ID

Respond with VALID JSON only, in this exact format:
{
  "new_memories": ["memory text 1", "memory text 2"],
  "recall_memory_ids": ["memory-id-1", "memory-id-2"]
}

Notes:
- "new_memories" can be an empty array if nothing important to remember
- "recall_memory_ids" can be an empty array if no existing memories are relevant
- Limit to 1-2 new memories maximum
- Be selective! Only truly important information should be memorized
`;

    try {
      const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: prompt,
          stream: false
        }),
      });
      
      if (!response.ok) {
        console.error('Error from Ollama server:', await response.text());
        return emptyResult;
      }
      
      const result = await response.json();
      
      try {
        // Extract the JSON from Ollama's response
        const ollamaResponseText = result.response.trim();
        
        // Find JSON content - look for opening and closing braces
        const jsonStartIndex = ollamaResponseText.indexOf('{');
        const jsonEndIndex = ollamaResponseText.lastIndexOf('}') + 1;
        
        if (jsonStartIndex === -1 || jsonEndIndex === 0) {
          console.error('No JSON found in Ollama response');
          return emptyResult;
        }
        
        const jsonContent = ollamaResponseText.substring(jsonStartIndex, jsonEndIndex);
        const memoryDecision = JSON.parse(jsonContent);
        
        return {
          memoriesToAdd: Array.isArray(memoryDecision.new_memories) ? memoryDecision.new_memories : [],
          memoryIdsToRecall: Array.isArray(memoryDecision.recall_memory_ids) ? memoryDecision.recall_memory_ids : [],
          success: true
        };
      } catch (parseError) {
        console.error('Failed to parse Ollama response as JSON:', parseError);
        console.log('Ollama raw response:', result.response);
        return emptyResult;
      }
    } catch (fetchError) {
      console.error('Failed to communicate with Ollama service:', fetchError);
      return emptyResult;
    }
  } catch (error) {
    console.error('General error in memory processing:', error);
    return emptyResult;
  }
}

// @route   POST api/adventures
// @desc    Create a new adventure
// @access  Private
router.post('/', protect, async (req: AuthenticatedRequest, res: any) => {
  const { name, description, playerCount } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  if (!name) {
    return res.status(400).json({ msg: 'Adventure name is required' });
  }

  try {
    const newAdventure: Adventure = {
      id: uuidv4(),
      userId,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [], // Initialize with an empty message array
      explicitMemories: [], // Initialize with an empty memories array
      characters: [], // Initialize with an empty characters array
      playerCount: playerCount || 1, // Default to 1 player if not specified
    };

    db.get('adventures').push(newAdventure).write();
    res.status(201).json(newAdventure);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/adventures
// @desc    Get all adventures for the logged-in user
// @access  Private
router.get('/', protect, (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const userAdventures = db.get('adventures').filter({ userId }).value();
    res.json(userAdventures);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/adventures/:adventureId
// @desc    Get a specific adventure by its ID, including messages
// @access  Private
router.get('/:adventureId', protect, (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    res.json(adventure);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/adventures/:adventureId/memories
// @desc    Get all memories for a specific adventure
// @access  Private
router.get('/:adventureId/memories', protect, (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    
    // Return just the memories array
    res.json(adventure.explicitMemories || []);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/adventures/:adventureId/characters
// @desc    Create a new character for an adventure
// @access  Private
router.post('/:adventureId/characters', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;
  const { 
    name, 
    race, 
    characterClass, 
    stats, 
    traits = []
  } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  if (!name || !race || !characterClass || !stats) {
    return res.status(400).json({ msg: 'Character details are required (name, race, class, stats)' });
  }

  try {
    const adventure = db.get('adventures').find({ id: adventureId, userId }).value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }

    // Calculate derived stats based on D&D rules
    const hitPointsMax = 10 + Math.floor((stats.constitution - 10) / 2); // Base HP for level 1
    const armorClass = 10 + Math.floor((stats.dexterity - 10) / 2); // Base AC
    
    // Create new character
    const newCharacter: Character = {
      id: uuidv4(),
      name,
      race,
      class: characterClass, // Use 'class' in DB but 'characterClass' in API to avoid JS keyword
      level: 1,
      experiencePoints: 0,
      stats: {
        strength: stats.strength,
        dexterity: stats.dexterity,
        constitution: stats.constitution,
        intelligence: stats.intelligence,
        wisdom: stats.wisdom,
        charisma: stats.charisma
      },
      skills: {}, // Initialize with empty skills
      traits: traits.map((trait: Omit<CharacterTrait, 'id'>) => ({
        ...trait,
        id: uuidv4()
      })),
      inventory: [] as InventoryItem[],
      hitPoints: {
        current: hitPointsMax,
        maximum: hitPointsMax
      },
      armorClass,
      proficiencyBonus: 2, // Base proficiency bonus for level 1
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add character to adventure
    adventure.characters.push(newCharacter);
    adventure.updatedAt = new Date().toISOString();
    
    // Update adventure in database
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();

    res.status(201).json(newCharacter);
  } catch (err: any) {
    console.error('Error creating character:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/adventures/:adventureId/characters
// @desc    Get all characters for an adventure
// @access  Private
router.get('/:adventureId/characters', protect, (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    
    res.json(adventure.characters || []);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/adventures/:adventureId/characters/:characterId
// @desc    Get a specific character by ID
// @access  Private
router.get('/:adventureId/characters/:characterId', protect, (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId, characterId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    
    const character = adventure.characters.find(char => char.id === characterId);
    
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.json(character);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/adventures/:adventureId/characters/:characterId
// @desc    Update a character (for level ups, stat changes, etc.)
// @access  Private
router.put('/:adventureId/characters/:characterId', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId, characterId } = req.params;
  const updateData = req.body; // Character update data

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    
    const characterIndex = adventure.characters.findIndex(char => char.id === characterId);
    
    if (characterIndex === -1) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Create updated character with validation
    const currentCharacter = adventure.characters[characterIndex];
    const updatedCharacter = {
      ...currentCharacter,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Update adventure with new character data
    adventure.characters[characterIndex] = updatedCharacter;
    adventure.updatedAt = new Date().toISOString();
    
    // Save to database
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();
    
    res.json(updatedCharacter);
  } catch (err: any) {
    console.error('Error updating character:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/adventures/:adventureId/characters/:characterId
// @desc    Delete a character
// @access  Private
router.delete('/:adventureId/characters/:characterId', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId, characterId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }
    
    // Filter out the character to delete
    adventure.characters = adventure.characters.filter(char => char.id !== characterId);
    adventure.updatedAt = new Date().toISOString();
    
    // Save to database
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();
    
    res.json({ msg: 'Character deleted successfully', characterId });
  } catch (err: any) {
    console.error('Error deleting character:', err.message);
    res.status(500).send('Server Error');
  }
});

// Modify the message post endpoint to include character data in the context
router.post('/:adventureId/messages', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;
  const { messageContent } = req.body; // User's new message content

  if (!openai) {
    return res.status(500).json({ msg: 'OpenAI API key not configured. Cannot process chat messages.' });
  }
  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }
  if (!messageContent) {
    return res.status(400).json({ msg: 'Message content is required' });
  }

  try {
    const adventure = db.get('adventures').find({ id: adventureId, userId }).value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }

    // 1. Add user message to history
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };
    adventure.messages.push(userMessage);

    // 2. Process memories with Ollama
    let memoryContextAddition = '';
    let memoryOperations = {
      saved: [] as MemoryItem[],
      recalled: [] as MemoryItem[]
    };
    
    try {
      console.log('Processing memories with Ollama...');
      const memoryProcessingResult = await processMemoriesWithOllama(messageContent, adventure);
      
      // 2a. Save new memories if any
      if (memoryProcessingResult.success && memoryProcessingResult.memoriesToAdd.length > 0) {
        for (const memoryText of memoryProcessingResult.memoriesToAdd) {
          const newMemory: MemoryItem = {
            id: uuidv4(),
            text: memoryText,
            createdAt: new Date().toISOString()
          };
          adventure.explicitMemories.push(newMemory);
          memoryOperations.saved.push(newMemory);
          console.log(`Added new memory: ${newMemory.id} - ${memoryText.substring(0, 50)}...`);
        }
      }
      
      // 2b. Recall relevant memories if any
      if (memoryProcessingResult.success && memoryProcessingResult.memoryIdsToRecall.length > 0) {
        const recalledMemories = adventure.explicitMemories.filter(
          memory => memoryProcessingResult.memoryIdsToRecall.includes(memory.id)
        );
        
        if (recalledMemories.length > 0) {
          memoryContextAddition = "\n\n## IMPORTANT MEMORIES:\n" + 
            recalledMemories.map(memory => memory.text).join("\n\n");
          memoryOperations.recalled = recalledMemories;
          console.log(`Recalled ${recalledMemories.length} memories for context`);
        }
      }
    } catch (memoryError) {
      console.error('Error during memory processing:', memoryError);
      // Continue without memory augmentation if there's an error
    }

    // 3a. Add character information to context
    let characterContextAddition = '';
    if (adventure.characters && adventure.characters.length > 0) {
      characterContextAddition = "\n\n## CHARACTER INFORMATION:\n";
      adventure.characters.forEach(character => {
        const statsModifiers = {
          str: Math.floor((character.stats.strength - 10) / 2),
          dex: Math.floor((character.stats.dexterity - 10) / 2),
          con: Math.floor((character.stats.constitution - 10) / 2),
          int: Math.floor((character.stats.intelligence - 10) / 2),
          wis: Math.floor((character.stats.wisdom - 10) / 2),
          cha: Math.floor((character.stats.charisma - 10) / 2),
        };
        
        characterContextAddition += `
Name: ${character.name}
Race: ${character.race}
Class: ${character.class}
Level: ${character.level}
HP: ${character.hitPoints.current}/${character.hitPoints.maximum}
AC: ${character.armorClass}
Stats: STR ${character.stats.strength} (${statsModifiers.str >= 0 ? '+' : ''}${statsModifiers.str}), 
       DEX ${character.stats.dexterity} (${statsModifiers.dex >= 0 ? '+' : ''}${statsModifiers.dex}), 
       CON ${character.stats.constitution} (${statsModifiers.con >= 0 ? '+' : ''}${statsModifiers.con}), 
       INT ${character.stats.intelligence} (${statsModifiers.int >= 0 ? '+' : ''}${statsModifiers.int}), 
       WIS ${character.stats.wisdom} (${statsModifiers.wis >= 0 ? '+' : ''}${statsModifiers.wis}), 
       CHA ${character.stats.charisma} (${statsModifiers.cha >= 0 ? '+' : ''}${statsModifiers.cha})
Traits: ${character.traits.map(trait => trait.name).join(', ') || 'None'}
`;
      });
    }

    // 3b. Prepare messages for OpenAI (including full history, memories, and character information)
    const messagesForAPI: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      // Add system message with adventure context, recalled memories, and character information
      {
        role: 'system',
        content: `You are the Dungeon Master for an AI-driven tabletop adventure called "${adventure.name}".
${adventure.description ? `\nGame Context: ${adventure.description}` : ''}
${characterContextAddition}
${memoryContextAddition}

You must play the role of a seasoned, creative, and slightly chaotic DM who is dedicated to making the player's journey memorable, dangerous, and immersive.

Core Personality:
- Authoritative but entertaining: you command the world with confidence, but you're not above cracking a dry joke or snarky pun.
- Hardcore DM: you take your job seriously. Combat has consequences. Choices matter. The world evolves based on player actions.
- Narrative-driven: describe environments vividly and invent colorful characters.
- Occasionally funny: toss in jokes or witty remarks when it fits the moment.
- Dynamic: react creatively to unexpected or absurd actions. Always improvise.

Behavior Rules:
- Never break character as the Dungeon Master.
- Never mention being an AI or language model.
- Assume full world control — you're in charge of every NPC, monster, dice roll, and weather pattern.
- Reply in immersive second-person narrative style unless the user says "OOC" or "out of character".
- Use prompts, descriptions, and dramatization to guide the player if they're unsure what to do.
- Occasionally describe ambient sound or cinematic moments to enhance immersion.
- Do not summarize or skip scenes unless asked directly.
- Use the character's stats for any relevant ability checks or saving throws.
- For combat, use the character's stats to determine attack rolls, damage, and other mechanics.

Example Flavor:
"As your torchlight flickers against damp stone, you hear it — a whisper. Not wind. A word. One you're sure no tongue should form. Choose: do you step forward, draw steel, or nope your way out of here like a sane person?"

Your goal is to immerse, entertain, and challenge — all while crafting an unforgettable adventure.`
      },
      // Add regular chat history
      ...adventure.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    ];

    // 4. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', 
      messages: messagesForAPI,
    });

    let aiReplyContent = 'Sorry, I could not generate a response.';
    if (completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
      aiReplyContent = completion.choices[0].message.content;
      
      // Apply formatting post-processing
      aiReplyContent = formatDMResponse(aiReplyContent);
    }

    // 5. Add AI response to history
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: aiReplyContent,
      timestamp: new Date().toISOString(),
    };
    adventure.messages.push(aiMessage);

    // 6. Update adventure in DB (with new messages AND potentially new memories)
    adventure.updatedAt = new Date().toISOString();
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();

    // 7. Return the AI's message (the last one added) along with memory operations
    res.json({
      message: aiMessage,
      memoryOperations
    }); 

  } catch (error: any) {
    console.error('Error in adventure message processing:', error.message);
    if (error.response) {
        console.error(error.response.data);
        return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).send('Error processing message with AI service');
  }
});

// @route   DELETE api/adventures/:adventureId
// @desc    Delete an adventure by its ID
// @access  Private
router.delete('/:adventureId', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }

    db.get('adventures').remove({ id: adventureId, userId }).write();

    res.json({ msg: 'Adventure removed successfully', adventureId });
  } catch (err: any) {
    console.error('Error deleting adventure:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/adventures/:adventureId/memories/:memoryId
// @desc    Delete a specific memory from an adventure
// @access  Private
router.delete('/:adventureId/memories/:memoryId', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId, memoryId } = req.params;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }

    // Find the memory to delete
    const memoryToDelete = adventure.explicitMemories.find(memory => memory.id === memoryId);
    
    if (!memoryToDelete) {
      return res.status(404).json({ msg: 'Memory not found in this adventure' });
    }

    // Remove the memory
    adventure.explicitMemories = adventure.explicitMemories.filter(memory => memory.id !== memoryId);
    
    // Update the adventure in the DB
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();

    res.json({ 
      msg: 'Memory removed successfully', 
      memoryId,
      remainingMemories: adventure.explicitMemories
    });
  } catch (err: any) {
    console.error('Error deleting memory:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/adventures/:adventureId/memories/:memoryId
// @desc    Update a specific memory in an adventure
// @access  Private
router.put('/:adventureId/memories/:memoryId', protect, async (req: AuthenticatedRequest, res: any) => {
  const userId = req.user?.id;
  const { adventureId, memoryId } = req.params;
  const { text } = req.body;

  if (!userId) {
    return res.status(400).json({ msg: 'User ID not found in token' });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ msg: 'Memory text is required' });
  }

  try {
    const adventure = db.get('adventures')
                        .find({ id: adventureId, userId })
                        .value();

    if (!adventure) {
      return res.status(404).json({ msg: 'Adventure not found or access denied' });
    }

    // Find the memory to update
    const memoryIndex = adventure.explicitMemories.findIndex(memory => memory.id === memoryId);
    
    if (memoryIndex === -1) {
      return res.status(404).json({ msg: 'Memory not found in this adventure' });
    }

    // Update the memory text
    adventure.explicitMemories[memoryIndex].text = text;
    
    // Update the adventure in the DB
    db.get('adventures').find({ id: adventureId, userId }).assign(adventure).write();

    res.json({ 
      msg: 'Memory updated successfully', 
      memory: adventure.explicitMemories[memoryIndex],
      allMemories: adventure.explicitMemories
    });
  } catch (err: any) {
    console.error('Error updating memory:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * Format DM responses to improve readability
 */
function formatDMResponse(text: string): string {
  // 1. Make sure paragraph breaks are preserved and enhanced
  let formattedText = text
    .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
    .replace(/(?<!\n)\n(?!\n)/g, '\n\n') // Convert single breaks to double
    
  // 2. Format speech/dialog more prominently
  formattedText = formattedText.replace(
    /"([^"]+)"/g, 
    (match, dialogContent) => `"*${dialogContent}*"`
  );

  // 3. Highlight dice rolls and game mechanics
  formattedText = formattedText.replace(
    /\b([Rr]oll(?:s|ed)?:?\s*|[Dd]\d+\s*(?:roll|check)s?:?|[Dd]?20|damage\s*roll:?)\s*(\d+)/g,
    '**$1 $2**'
  );

  // 4. Emphasize action moments
  formattedText = formattedText.replace(
    /\*([^*]+)\*/g, 
    (match) => match
  );

  // 5. Format scene transitions 
  formattedText = formattedText.replace(
    /\[([^\]]+)\]/g,
    '***[$1]***'
  );

  return formattedText;
}

export default router; 