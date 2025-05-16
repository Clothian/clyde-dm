import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, X, Filter, ArrowUp, ArrowDown, 
  PlusSquare, MinusSquare, ShoppingBag, AlertCircle 
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardFooter, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Portal from '@/components/ui/portal';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  type?: string;
  rarity?: string;
  value?: number;
  weight?: number;
  effects?: string[];
  isEquipped?: boolean;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adventureId: string;
  onItemsUpdate?: () => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'quantity-asc' | 'quantity-desc';

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  isOpen, 
  onClose, 
  adventureId,
  onItemsUpdate 
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success'|'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const { token } = useAuth();

  const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchInventory = async () => {
    if (!token || !adventureId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/adventures/${adventureId}/inventory`,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch inventory');
        setError('Failed to load inventory items.');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('An error occurred while fetching your inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen, adventureId, token]);

  const filteredItems = items
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  const showNotification = (message: string, type: 'success'|'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueItems = items.length;

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-[100]" style={{ backdropFilter: 'blur(5px)' }}>
        <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-arcane-dark-blue border-arcane-purple text-white overflow-hidden">
          <CardHeader className="border-b border-arcane-purple bg-arcane-dark">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-arcane text-glow">Inventory</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="text-arcane-purple-light hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Manage your items and equipment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6 overflow-y-auto flex-grow bg-arcane-darker/95">
            {notification.show && (
              <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {notification.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  className="pl-10 bg-arcane-dark/80 border-arcane-blue-dark text-white"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <SelectTrigger className="bg-arcane-dark/80 border-arcane-blue-dark text-white">
                    <div className="flex items-center">
                      <Filter size={18} className="mr-2" />
                      <SelectValue placeholder="Sort by..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-arcane-dark border-arcane-blue-dark text-white z-[101]">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="quantity-desc">Most Quantity</SelectItem>
                    <SelectItem value="quantity-asc">Least Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-arcane-dark/90 p-2 rounded-lg flex items-center">
                  <ShoppingBag size={20} className="text-arcane-purple-light mr-2" />
                  <div>
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="font-bold">{totalItems} items</div>
                  </div>
                </div>
                <div className="bg-arcane-dark/90 p-2 rounded-lg flex items-center">
                  <Filter size={20} className="text-arcane-purple-light mr-2" />
                  <div>
                    <div className="text-sm text-gray-400">Unique</div>
                    <div className="font-bold">{uniqueItems} types</div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-arcane-blue-dark/50" />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center p-4 bg-arcane-dark/80 rounded-lg border border-arcane-blue-dark/30">
                    <Skeleton className="h-12 w-12 rounded-md bg-arcane-dark" />
                    <div className="ml-4 space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3 bg-arcane-dark" />
                      <Skeleton className="h-3 w-2/3 bg-arcane-dark" />
                    </div>
                    <Skeleton className="h-8 w-16 bg-arcane-dark" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive" className="bg-red-900/60 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                {searchQuery ? (
                  <div className="space-y-2">
                    <p className="text-gray-400">No items match your search.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery('')}
                      className="border-arcane-purple text-arcane-purple-light hover:bg-arcane-purple hover:text-white"
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ShoppingBag size={48} className="mx-auto text-arcane-blue-dark/60" />
                    <p className="text-gray-300">Your inventory is empty.</p>
                    <p className="text-sm text-gray-400">
                      Items you collect during your adventure will appear here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-lg bg-arcane-dark/80 border border-arcane-blue-dark hover:border-arcane-purple/50 transition-colors flex items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-arcane-purple-light">{item.name}</h3>
                        {item.quantity > 1 && (
                          <Badge className="ml-2 bg-arcane-purple text-white">
                            x{item.quantity}
                          </Badge>
                        )}
                        {item.rarity && (
                          <Badge 
                            className="ml-2" 
                            variant={
                              item.rarity === 'common' ? 'outline' :
                              item.rarity === 'uncommon' ? 'secondary' :
                              item.rarity === 'rare' ? 'default' :
                              item.rarity === 'epic' ? 'destructive' : 'outline'
                            }
                          >
                            {item.rarity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">{item.description}</p>
                      {item.effects && item.effects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.effects.map((effect, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-arcane-purple-light text-arcane-purple-light">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-arcane-purple p-4 bg-arcane-dark">
            <Button 
              variant="default" 
              className="ml-auto bg-arcane-purple hover:bg-arcane-purple-light"
              onClick={onClose}
            >
              Close
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Portal>
  );
};

export default InventoryModal; 