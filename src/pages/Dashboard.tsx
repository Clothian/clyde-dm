import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, Loader2, Trash2, Users } from 'lucide-react';
import ArcaneButton from '@/components/ArcaneButton';
import ArcaneInput from '@/components/ArcaneInput';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ADVENTURES_API_URL = `${VITE_API_URL}/api/adventures`;

// Adventure type from backend (can be shared in a types file later)
export type Adventure = {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: any[]; // Define ChatMessage type here or import if shared
  playerCount?: number;
  characters?: any[];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { toast } = useToast();

  const [newAdventureName, setNewAdventureName] = useState('');
  const [newAdventureDescription, setNewAdventureDescription] = useState(''); // Optional description
  const [playerCount, setPlayerCount] = useState(1);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores ID of adventure being deleted
  const [showPlayerCountDialog, setShowPlayerCountDialog] = useState(false);
  const [newAdventureData, setNewAdventureData] = useState<Adventure | null>(null);

  // Fetch adventures on component mount
  useEffect(() => {
    const fetchAdventures = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(ADVENTURES_API_URL, {
          headers: {
            'x-auth-token': token,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch adventures');
        }
        const data = await response.json();
        setAdventures(data);
      } catch (error: any) {
        console.error('Error fetching adventures:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not fetch adventures.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdventures();
  }, [token, toast]);

  const handleInitiateAdventureCreation = () => {
    if (!newAdventureName.trim()) {
      toast({ title: "Name Required", description: "Please enter a name for your adventure.", variant: "destructive" });
      return;
    }
    
    // Show player count dialog
    setShowPlayerCountDialog(true);
  };

  const handleCreateAdventure = async () => {
    if (!token) {
      toast({ title: "Authentication Error", description: "You must be logged in to create adventures.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(ADVENTURES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ 
          name: newAdventureName, 
          description: newAdventureDescription,
          playerCount 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create adventure');
      }
      
      const createdAdventure = await response.json();
      setAdventures(prev => [createdAdventure, ...prev]);
      setNewAdventureName('');
      setNewAdventureDescription('');
      setNewAdventureData(createdAdventure);
      
      // Navigate to character creation
      navigate(`/character-creation/${createdAdventure.id}`);
      
    } catch (error: any) {
      console.error('Error creating adventure:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create new adventure.",
      });
    } finally {
      setIsCreating(false);
      setShowPlayerCountDialog(false);
    }
  };

  const handleDeleteAdventure = async (adventureId: string, adventureName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the realm "${adventureName}"? This action cannot be undone.`)) {
      return;
    }
    if (!token) {
      toast({ title: "Authentication Error", description: "You must be logged in to delete adventures.", variant: "destructive" });
      return;
    }

    setIsDeleting(adventureId);
    try {
      const response = await fetch(`${ADVENTURES_API_URL}/${adventureId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to delete adventure');
      }
      
      setAdventures(prevAdventures => prevAdventures.filter(adv => adv.id !== adventureId));
      toast({ title: "Realm Banished!", description: `Successfully deleted the realm "${adventureName}".` });

    } catch (error: any) {
      console.error('Error deleting adventure:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || `Could not delete realm "${adventureName}".`,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-arcane-darker text-white p-6 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-arcane-purple" />
        <p className="ml-4 text-xl">Loading your sagas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arcane-darker text-white p-6 arcane-scrollbar">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <GlowingRune symbol="❖" size="md" />
          <h1 className="ml-3 text-3xl font-arcane text-glow">Adventure Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-arcane-purple-light">Welcome, {user.username}!</span>
          )}
          <ArcaneButton 
            variant="outline" 
            className="h-9 text-sm px-3"
            onClick={() => { logout(); navigate('/'); }}
          >
            Logout
          </ArcaneButton>
        </div>
      </header>

      {/* Create New Adventure Section */}
      <section className="mb-10 arcane-card p-6">
        <h2 className="text-2xl font-arcane text-glow mb-4">Forge a New Legend</h2>
        <div className="space-y-4">
          <ArcaneInput 
            label="Name Your Adventure"
            placeholder="e.g., The Dragon\'s Hoard"
            value={newAdventureName}
            onChange={(e) => setNewAdventureName(e.target.value)}
            disabled={isCreating}
          />
          <ArcaneInput 
            label="Brief Description (Optional)"
            placeholder="A few words to set the scene..."
            value={newAdventureDescription}
            onChange={(e) => setNewAdventureDescription(e.target.value)}
            disabled={isCreating}
          />
          <ArcaneButton 
            onClick={handleInitiateAdventureCreation} 
            className="h-10 px-6 w-full md:w-auto" 
            disabled={isCreating}
          >
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle size={18} className="mr-2" />}
            {isCreating ? 'Forging...' : 'Create Adventure'}
          </ArcaneButton>
        </div>
      </section>

      {/* Existing Adventures Section */}
      <section>
        <h2 className="text-2xl font-arcane text-glow mb-6">Continue Your Saga</h2>
        {adventures.length === 0 ? (
          <p className="text-gray-500 text-center arcane-card p-6">
            No adventures started yet. Create one above to begin your journey!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adventures.map((adv) => (
              <div key={adv.id} className="arcane-card p-5 flex flex-col justify-between rune-border h-full">
                <div>
                  <h3 className="text-xl font-arcane text-arcane-purple mb-2 truncate" title={adv.name}>{adv.name}</h3>
                  <p className="text-sm text-gray-400 mb-1 line-clamp-3 h-16">{adv.description || "No description yet..."}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 mb-4">Last updated: {new Date(adv.updatedAt).toLocaleDateString()}</p>
                    {adv.playerCount && (
                      <p className="text-xs text-arcane-blue-light flex items-center">
                        <Users size={12} className="mr-1" />
                        {adv.playerCount} player{adv.playerCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <ArcaneButton 
                  onClick={() => navigate(`/chat/${adv.id}`)}
                  variant="outline"
                  className="w-full mt-auto"
                >
                  <BookOpen size={18} className="mr-2" />
                  Enter Realm
                </ArcaneButton>
                <ArcaneButton
                  onClick={() => handleDeleteAdventure(adv.id, adv.name)}
                  variant="outline"
                  className="w-full mt-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-500/80 hover:text-red-500"
                  disabled={isDeleting === adv.id}
                >
                  {isDeleting === adv.id ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Trash2 size={18} className="mr-2" />
                  )}
                  {isDeleting === adv.id ? 'Banishing...' : 'Delete Realm'}
                </ArcaneButton>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Player Count Dialog */}
      <Dialog open={showPlayerCountDialog} onOpenChange={setShowPlayerCountDialog}>
        <DialogContent className="arcane-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-arcane text-glow">How Many Adventurers?</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="text-center">
              <p className="text-gray-400 mb-6">Select the number of players for this adventure.</p>
              <div className="flex items-center justify-center text-4xl font-arcane text-arcane-purple">
                {playerCount}
              </div>
            </div>
            
            <div className="px-6">
              <Slider
                value={[playerCount]}
                min={1}
                max={6}
                step={1}
                onValueChange={(value) => setPlayerCount(value[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <ArcaneButton
                variant="outline"
                onClick={() => setShowPlayerCountDialog(false)}
                className="border-gray-700"
              >
                Cancel
              </ArcaneButton>
              <ArcaneButton onClick={handleCreateAdventure} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreating ? 'Creating...' : 'Next: Create Characters'}
              </ArcaneButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard; 