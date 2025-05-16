import { useState, useRef, useEffect } from 'react';
import { Send, LogOut } from 'lucide-react';
import ArcaneButton from '@/components/ArcaneButton';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const placeholderMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    content: 'Welcome, brave adventurer, to the mystical realm of Eldoria. The land is shrouded in a mysterious fog, and whispers of ancient magic echo through the dense forest before you. What do you wish to do?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: 2,
    sender: 'user',
    content: 'I want to explore the forest and see if I can find the source of these whispers.',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 3,
    sender: 'ai',
    content: 'You venture deeper into the forest, the mist curling around your ankles as you walk. The whispers grow louder, seemingly emanating from an ancient stone structure ahead. As you approach, you notice strange glowing runes carved into the archway. A sense of both danger and opportunity fills the air.',
    timestamp: new Date(Date.now() - 30000),
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(placeholderMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
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
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      sender: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    
    // Simulate AI response
    setTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai' as const,
        content: `The ancient structure responds to your actions, the runes glowing brighter as you approach. You sense that this is a pivotal moment in your journey.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setTyping(false);
    }, 2000);
  };
  
  return (
    <div className="h-screen flex flex-col bg-arcane-darker relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 bg-arcane-dark opacity-30"></div>
      <div className="absolute inset-0 -z-10 bg-arcane-grid bg-[length:40px_40px]"></div>
      
      {/* Header */}
      <header className="py-4 px-6 arcane-glass border-b border-arcane-purple/30 flex items-center justify-between">
        <div className="flex items-center">
          <GlowingRune symbol="⎈" size="sm" />
          <h1 className="ml-3 text-xl font-arcane text-glow">Clyde DM</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm px-3 py-1 rounded-full bg-arcane-purple/20 text-arcane-purple-light">
            Campaign: Eldoria
          </div>
          {user && (
            <div className="text-sm px-3 py-1 rounded-full bg-arcane-blue/20 text-arcane-blue-light">
              {user.username}
            </div>
          )}
          <ArcaneButton 
            variant="outline" 
            className="h-8 text-sm px-3 flex items-center gap-1"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            <span>Exit</span>
          </ArcaneButton>
        </div>
      </header>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto arcane-scrollbar p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.sender === 'user' 
                    ? 'bg-arcane-purple/20 border border-arcane-purple/30 text-white' 
                    : 'arcane-card border border-arcane-blue/30 relative'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] shimmer-bg"></div>
                )}
                <div className="prose prose-invert">
                  <p className="mb-1">{message.content}</p>
                </div>
                <div className={`text-xs opacity-50 mt-2 ${message.sender === 'user' ? 'text-right' : ''}`}>
                  {message.sender === 'ai' && <span className="text-arcane-blue">DM</span>}
                  {message.sender === 'user' && <span className="text-arcane-purple-light">You</span>}
                  <span className="ml-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {typing && (
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
      
      {/* Input bar */}
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
              placeholder="What would you like to do next?"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <ArcaneButton 
              variant="rune"
              onClick={handleSendMessage}
              className="ml-2 w-10 h-10 flex items-center justify-center"
              type="submit"
            >
              <Send size={18} />
            </ArcaneButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
