import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Tag } from 'lucide-react';

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface MemoryItem {
  id: string;
  text: string;
  createdAt: string;
  tags: string[];
}

interface AdventureMemoriesProps {
  adventureId: string;
  isVisible: boolean;
  onClose: () => void;
}

const AdventureMemories: React.FC<AdventureMemoriesProps> = ({ adventureId, isVisible, onClose }) => {
  const { token } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    if (!token || !adventureId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${VITE_API_URL}/api/adventures/${adventureId}/memories`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || `Failed to fetch memories: ${response.statusText}`);
      }
      const data: MemoryItem[] = await response.json();
      setMemories(data);
      
      const uniqueTags = Array.from(new Set(data.flatMap(mem => mem.tags))).sort();
      setAllTags(uniqueTags);

    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching memories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [adventureId, token]);

  useEffect(() => {
    if (isVisible && adventureId) {
      fetchMemories();
    }
  }, [isVisible, adventureId, fetchMemories]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredMemories = memories.filter(memory => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every(tag => memory.tags.includes(tag));
  });

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50 arcane-scrollbar">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-arcane-dark-blue text-white rune-border-light overflow-hidden">
        <CardHeader className="border-b border-arcane-purple">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-arcane text-glow">Adventure Memories</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-arcane-purple-light hover:text-white">X</Button>
          </div>
          <CardDescription className="text-gray-400">
            Browse and filter memories associated with this adventure.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6 overflow-y-auto arcane-scrollbar">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-arcane-purple" />
              <p className="ml-3 text-lg">Loading memories...</p>
            </div>
          )}

          {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">Error: {error}</p>}

          {!isLoading && !error && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-arcane-purple-light flex items-center">
                  <Tag size={20} className="mr-2" />
                  Filter by Tags
                </h3>
                {allTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                        onClick={() => toggleTag(tag)}
                        className={`cursor-pointer transition-all duration-150 ease-in-out hover:opacity-100 ${selectedTags.includes(tag) ? 'bg-arcane-purple text-white opacity-100' : 'bg-gray-700 text-gray-300 opacity-75 hover:bg-gray-600'}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No tags available for filtering.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-arcane-purple-light">
                  {selectedTags.length > 0 ? 'Filtered Memories' : 'All Memories'} ({filteredMemories.length})
                </h3>
                {filteredMemories.length > 0 ? (
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto arcane-scrollbar pr-2">
                    {filteredMemories.map(memory => (
                      <div key={memory.id} className="p-4 rounded-lg bg-arcane-dark/50 border border-arcane-blue-dark hover:border-arcane-purple-light/50 transition-colors">
                        <p className="text-gray-200 whitespace-pre-wrap">{memory.text}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {memory.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-arcane-blue-light text-arcane-blue-light">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(memory.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    {memories.length > 0 ? 'No memories match the selected tags.' : 'No memories recorded for this adventure yet.'}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdventureMemories; 