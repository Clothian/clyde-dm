import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Tag, Clock, SortDesc, SortAsc, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type SortOption = 'newest' | 'oldest' | 'most-tags' | 'least-tags';

const AdventureMemories: React.FC<AdventureMemoriesProps> = ({ adventureId, isVisible, onClose }) => {
  const { token } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [characterNames, setCharacterNames] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilterTab, setActiveFilterTab] = useState<string>('tags');

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
      
      // After loading memories, fetch character names from server
      fetchCharacterNames();
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching memories:", err);
    } finally {
      setIsLoading(false);
    }
  }, [adventureId, token]);
  
  const fetchCharacterNames = useCallback(async () => {
    if (!token || !adventureId) return;
    try {
      const response = await fetch(`${VITE_API_URL}/api/adventures/${adventureId}/memories/extract-names`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        console.error('Failed to fetch character names');
        return;
      }
      const data = await response.json();
      setCharacterNames(data.characterNames || []);
    } catch (err) {
      console.error("Error fetching character names:", err);
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

  const filteredMemories = memories
    .filter(memory => {
      // First apply tag filtering if tags are selected
      const tagFiltered = selectedTags.length === 0 || 
        selectedTags.every(tag => memory.tags.includes(tag));
      
      // Then apply character name filtering if a character is selected
      const characterFiltered = !selectedCharacter || 
        memory.text.includes(selectedCharacter) || 
        memory.tags.includes(selectedCharacter);
      
      // Then apply text search if there's a search query
      const textFiltered = !searchText || 
        memory.text.toLowerCase().includes(searchText.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
      
      return tagFiltered && characterFiltered && textFiltered;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-tags':
          return b.tags.length - a.tags.length;
        case 'least-tags':
          return a.tags.length - b.tags.length;
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedCharacter('');
    setSearchText('');
  };

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
            Browse, sort, and filter memories associated with this adventure.
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-arcane-purple-light flex items-center">
                  <Search size={16} className="mr-2" />
                  Search & Sort
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-arcane-purple-light hover:text-white"
                  disabled={selectedTags.length === 0 && !selectedCharacter && !searchText}
                >
                  Clear Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Input
                    placeholder="Search memory content..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="bg-arcane-dark/50 border-arcane-blue-dark text-white"
                  />
                </div>
                <div>
                  <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                    <SelectTrigger className="bg-arcane-dark/50 border-arcane-blue-dark text-white">
                      <div className="flex items-center">
                        {sortOption === 'newest' || sortOption === 'oldest' ? (
                          <Clock size={16} className="mr-2" />
                        ) : (
                          <Tag size={16} className="mr-2" />
                        )}
                        <SelectValue placeholder="Sort by..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-arcane-dark border-arcane-blue-dark text-white">
                      <SelectItem value="newest" className="flex items-center">
                        <div className="flex items-center">
                          <SortDesc size={16} className="mr-2" />
                          Newest First
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest" className="flex items-center">
                        <div className="flex items-center">
                          <SortAsc size={16} className="mr-2" />
                          Oldest First
                        </div>
                      </SelectItem>
                      <SelectItem value="most-tags" className="flex items-center">
                        <div className="flex items-center">
                          <SortDesc size={16} className="mr-2" />
                          Most Tags
                        </div>
                      </SelectItem>
                      <SelectItem value="least-tags" className="flex items-center">
                        <div className="flex items-center">
                          <SortAsc size={16} className="mr-2" />
                          Least Tags
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="mb-6">
                <TabsList className="bg-arcane-dark/50 border border-arcane-blue-dark">
                  <TabsTrigger value="tags" className="data-[state=active]:bg-arcane-purple-light data-[state=active]:text-white">
                    <Tag size={16} className="mr-2" />
                    Filter by Tags
                  </TabsTrigger>
                  <TabsTrigger value="characters" className="data-[state=active]:bg-arcane-purple-light data-[state=active]:text-white">
                    <User size={16} className="mr-2" />
                    Filter by Characters
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tags" className="mt-4">
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
                </TabsContent>
                
                <TabsContent value="characters" className="mt-4">
                  {characterNames.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {characterNames.map(name => (
                        <Badge
                          key={name}
                          variant={selectedCharacter === name ? 'default' : 'secondary'}
                          onClick={() => setSelectedCharacter(prev => prev === name ? '' : name)}
                          className={`cursor-pointer transition-all duration-150 ease-in-out hover:opacity-100 ${selectedCharacter === name ? 'bg-arcane-purple text-white opacity-100' : 'bg-gray-700 text-gray-300 opacity-75 hover:bg-gray-600'}`}
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No character names detected in memories.</p>
                  )}
                </TabsContent>
              </Tabs>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-arcane-purple-light flex justify-between items-center">
                  <span>
                    {selectedTags.length > 0 || selectedCharacter || searchText ? 'Filtered Memories' : 'All Memories'} 
                    ({filteredMemories.length})
                  </span>
                  <span className="text-sm font-normal text-gray-400">
                    {sortOption === 'newest' ? 'Newest first' : 
                     sortOption === 'oldest' ? 'Oldest first' : 
                     sortOption === 'most-tags' ? 'Most tags first' : 
                     'Least tags first'}
                  </span>
                </h3>
                {filteredMemories.length > 0 ? (
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto arcane-scrollbar pr-2">
                    {filteredMemories.map(memory => (
                      <div key={memory.id} className="p-4 rounded-lg bg-arcane-dark/50 border border-arcane-blue-dark hover:border-arcane-purple-light/50 transition-colors">
                        <p className="text-gray-200 whitespace-pre-wrap">{memory.text}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {memory.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className={`text-xs cursor-pointer ${selectedTags.includes(tag) ? 'border-arcane-purple-light text-arcane-purple-light' : 'border-arcane-blue-light text-arcane-blue-light'}`}
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </Badge>
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
                    {memories.length > 0 ? 'No memories match the current filters.' : 'No memories recorded for this adventure yet.'}
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