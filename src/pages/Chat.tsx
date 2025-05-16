import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, LayoutDashboard, Loader2, Brain, Edit2, Trash2, X, Save, BookOpen, Users } from 'lucide-react';
import ArcaneButton from '@/components/ArcaneButton';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { Adventure as AdventureType } from './Dashboard';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CharacterSheet, { Character as CharacterType } from '@/components/CharacterSheet';

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ADVENTURES_API_BASE_URL = `${VITE_API_URL}/api/adventures`;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export interface MemoryItem {
  id: string;
  text: string;
  createdAt: string;
}

interface ExtendedAdventureType extends AdventureType {
  explicitMemories?: MemoryItem[];
  characters?: CharacterType[];
}

const Chat = () => {
  const { adventureId } = useParams<{ adventureId: string }>();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { toast } = useToast();

  const [currentAdventure, setCurrentAdventure] = useState<ExtendedAdventureType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [characters, setCharacters] = useState<CharacterType[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [editedMemoryText, setEditedMemoryText] = useState('');
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdventureDetails();
  }, [adventureId, token, navigate, toast]);

  const fetchAdventureDetails = async () => {
    if (!adventureId || !token) {
      setIsLoading(false);
      toast({ title: "Error", description: "Adventure ID or token missing.", variant: "destructive" });
      navigate('/dashboard');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${ADVENTURES_API_BASE_URL}/${adventureId}`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to load adventure details');
      }
      const data: ExtendedAdventureType = await response.json();
      setCurrentAdventure(data);
      setMessages(data.messages.map(m => ({...m, timestamp: m.timestamp }))); 
      setMemories(data.explicitMemories || []);
      
      // Set characters from adventure data
      if (data.characters && data.characters.length > 0) {
        setCharacters(data.characters);
        setSelectedCharacter(data.characters[0]); // Set first character as default
      }
    } catch (error: any) {
      console.error('Error fetching adventure details:', error);
      toast({ title: "Load Failed", description: error.message, variant: "destructive" });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemories = async () => {
    if (!adventureId || !token) return;
    
    try {
      const response = await fetch(`${ADVENTURES_API_BASE_URL}/${adventureId}/memories`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch memories');
      }
      const memoriesData = await response.json();
      setMemories(memoriesData);
    } catch (error: any) {
      console.error('Error fetching memories:', error);
      toast({
        variant: "destructive", 
        title: "Memory Error", 
        description: error.message || "Could not fetch memories."
      });
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!adventureId || !token || !memoryId) return;
    
    try {
      const response = await fetch(`${ADVENTURES_API_BASE_URL}/${adventureId}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete memory');
      }
      
      const result = await response.json();
      setMemories(result.remainingMemories);
      toast({ title: "Memory Deleted", description: "The memory has been removed." });
    } catch (error: any) {
      console.error('Error deleting memory:', error);
      toast({
        variant: "destructive", 
        title: "Delete Failed", 
        description: error.message || "Could not delete memory."
      });
    }
  };

  const updateMemory = async (memoryId: string, text: string) => {
    if (!adventureId || !token || !memoryId) return;
    
    try {
      const response = await fetch(`${ADVENTURES_API_BASE_URL}/${adventureId}/memories/${memoryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update memory');
      }
      
      const result = await response.json();
      setMemories(result.allMemories);
      toast({ title: "Memory Updated", description: "The memory has been updated." });
    } catch (error: any) {
      console.error('Error updating memory:', error);
      toast({
        variant: "destructive", 
        title: "Update Failed", 
        description: error.message || "Could not update memory."
      });
    }
  };

  const handleEditMemory = (memory: MemoryItem) => {
    setEditingMemory(memory);
    setEditedMemoryText(memory.text);
  };

  const handleSaveMemoryEdit = async () => {
    if (editingMemory && editedMemoryText.trim()) {
      await updateMemory(editingMemory.id, editedMemoryText);
      setEditingMemory(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleOpenCharacterSheet = (character: CharacterType) => {
    setSelectedCharacter(character);
    setShowCharacterSheet(true);
    setShowCharacterSelector(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !token || !adventureId) return;

    const userMessageContent = inputMessage.trim();
    
    const tempUserMessageId = new Date().toISOString() + '-user-temp';
    const optimisticUserMessage: ChatMessage = {
      id: tempUserMessageId,
      role: 'user' as const,
      content: userMessageContent,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${ADVENTURES_API_BASE_URL}/${adventureId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ messageContent: userMessageContent }),
      });

      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessageId));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error from AI service');
      }
      
      // Parse the response which now includes message and memory operations
      const data = await response.json();
      const aiMessage = data.message;
      const memoryOperations = data.memoryOperations;
      
      // Display memory operation toasts
      if (memoryOperations.saved && memoryOperations.saved.length > 0) {
        toast({ 
          title: "Memory Saved", 
          description: `${memoryOperations.saved.length} important point${memoryOperations.saved.length > 1 ? 's' : ''} memorized.`,
          className: "bg-arcane-purple/30 border-arcane-purple text-white"
        });
      }
      
      if (memoryOperations.recalled && memoryOperations.recalled.length > 0) {
        toast({ 
          title: "Memory Recalled", 
          description: `${memoryOperations.recalled.length} relevant memor${memoryOperations.recalled.length > 1 ? 'ies' : 'y'} used to enhance context.`,
          className: "bg-arcane-blue/30 border-arcane-blue text-white"
        });
      }

      // Refresh adventure data to get updated messages and memories
      fetchAdventureDetails();
      
    } catch (error: any) {
      console.error('Failed to send message or get AI reply:', error);
      const errorSystemMessage: ChatMessage = {
        id: new Date().toISOString() + '-error',
        role: 'assistant',
        content: `Error: ${error.message || 'Could not reach AI.'} Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(msg => msg.id !== tempUserMessageId), errorSystemMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Format message content for display with markdown-like syntax
  const formatMessageContent = (content: string) => {
    // Replace ** with strong tags
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace * with em tags
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Replace newlines with <br> for proper line breaks
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    
    return formatted;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-arcane-darker">
        <Loader2 className="h-12 w-12 animate-spin text-arcane-purple" />
        <p className="ml-4 text-xl">Loading adventure chat...</p>
      </div>
    );
  }

  if (!currentAdventure) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-arcane-darker text-white">
        <p className="text-2xl mb-4">Adventure not found.</p>
        <ArcaneButton onClick={handleGoToDashboard}>Back to Dashboard</ArcaneButton>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-arcane-darker relative overflow-hidden">
      <header className="py-4 px-6 arcane-glass border-b border-arcane-purple/30 flex items-center justify-between">
        <div className="flex items-center">
          <GlowingRune symbol="⎈" size="sm" />
          <h1 className="ml-3 text-xl font-arcane text-glow truncate" title={currentAdventure.name}>
            {currentAdventure.name}
          </h1> 
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-sm px-3 py-1 rounded-full bg-arcane-blue/20 text-arcane-blue-light">
              {user.username}
            </div>
          )}
          {characters.length > 0 && (
            <ArcaneButton
              variant="outline"
              className="h-8 text-sm px-3 flex items-center gap-1.5"
              onClick={() => setShowCharacterSelector(true)}
            >
              <Users size={14} />
              <span>Characters</span>
            </ArcaneButton>
          )}
          <ArcaneButton
            variant="outline"
            className="h-8 text-sm px-3 flex items-center gap-1.5"
            onClick={() => setShowMemories(true)}
          >
            <Brain size={14} />
            <span>Memories</span>
          </ArcaneButton>
          <ArcaneButton
            variant="outline"
            className="h-8 text-sm px-3 flex items-center gap-1.5"
            onClick={handleGoToDashboard}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </ArcaneButton>
          <ArcaneButton 
            variant="outline" 
            className="h-8 text-sm px-3 flex items-center gap-1.5"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </ArcaneButton>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto arcane-scrollbar p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !isSending && (
            <div className="text-center text-gray-500 arcane-card p-6">
              <p>The story of "{currentAdventure.name}" is yet to unfold. Send a message to begin.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-arcane-purple/20 border border-arcane-purple/30 text-white' 
                    : 'arcane-card border border-arcane-blue/30 relative'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] shimmer-bg"></div>
                )}
                <div className="prose prose-invert max-w-none">
                  <div className="mb-1 whitespace-pre-wrap" 
                    dangerouslySetInnerHTML={{ 
                      __html: message.role === 'assistant' 
                        ? formatMessageContent(message.content) 
                        : message.content 
                    }} 
                  />
                </div>
                <div className={`text-xs opacity-50 mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.role === 'assistant' && <span className="text-arcane-blue">DM</span>}
                  {message.role === 'user' && <span className="text-arcane-purple-light">You</span>}
                  <span className="ml-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="arcane-card border border-arcane-blue/30 rounded-xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-arcane-blue animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-arcane-blue animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-arcane-blue animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      
      <div className="p-4 relative">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-arcane-purple/10 to-arcane-blue/10 rounded-full blur-md"></div>
          <form 
            className="flex items-center arcane-glass rounded-full border border-arcane-purple/30 pl-6 pr-2 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-gray-500"
              placeholder={`Continue the story of "${currentAdventure.name}"...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isSending} 
            />
            <ArcaneButton 
              variant="outline"
              onClick={handleSendMessage}
              className="ml-2 w-10 h-10 flex items-center justify-center"
              type="submit"
              disabled={isSending} 
            >
              <Send size={18} />
            </ArcaneButton>
          </form>
        </div>
      </div>

      {/* Memory Manager Dialog */}
      <Dialog open={showMemories} onOpenChange={setShowMemories}>
        <DialogContent className="bg-arcane-darker text-white border-arcane-purple/30 max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-arcane text-glow text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-arcane-purple" /> 
              Adventure Memories
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto arcane-scrollbar pr-4 py-2">
            {memories.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No memories have been recorded for this adventure yet.</p>
                <p className="text-sm mt-2">
                  As you play, important information will be saved here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="arcane-card p-4 border-arcane-purple/20 relative">
                    {editingMemory?.id === memory.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editedMemoryText}
                          onChange={(e) => setEditedMemoryText(e.target.value)}
                          className="min-h-[100px] bg-arcane-darker border-arcane-purple/30 focus:border-arcane-purple"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingMemory(null)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <X size={14} className="mr-1" /> Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleSaveMemoryEdit}
                            className="border-arcane-purple text-arcane-purple-light hover:bg-arcane-purple/20"
                          >
                            <Save size={14} className="mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap mb-2">{memory.text}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(memory.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditMemory(memory)}
                              className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteMemory(memory.id)}
                              className="h-7 px-2 text-gray-400 hover:text-red-500 hover:bg-red-900/20"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-arcane-purple/20 pt-4">
            <Button 
              variant="outline" 
              className="w-full border-arcane-purple/30 hover:bg-arcane-purple/20 text-white"
              onClick={() => setShowMemories(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Selector Dialog */}
      <Dialog open={showCharacterSelector} onOpenChange={setShowCharacterSelector}>
        <DialogContent className="bg-arcane-darker text-white border-arcane-purple/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-arcane text-glow text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-arcane-purple" /> 
              Select Character
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              {characters.map((character) => (
                <div 
                  key={character.id} 
                  className="arcane-card p-4 border-arcane-purple/20 flex justify-between items-center cursor-pointer hover:bg-arcane-purple/10"
                  onClick={() => handleOpenCharacterSheet(character)}
                >
                  <div>
                    <h3 className="font-medium">{character.name}</h3>
                    <p className="text-sm text-gray-400">Level {character.level} {character.race} {character.class}</p>
                  </div>
                  <div className="arcane-button-outline p-1 rounded-md">
                    <BookOpen size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-arcane-purple/20 pt-4">
            <Button 
              variant="outline" 
              className="w-full border-arcane-purple/30 hover:bg-arcane-purple/20 text-white"
              onClick={() => setShowCharacterSelector(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Character Sheet Component */}
      {selectedCharacter && (
        <CharacterSheet 
          character={selectedCharacter}
          isOpen={showCharacterSheet}
          onClose={() => setShowCharacterSheet(false)}
        />
      )}
    </div>
  );
};

export default Chat;
