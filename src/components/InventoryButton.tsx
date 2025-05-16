import React, { useState, useEffect } from 'react';
import { Backpack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import InventoryModal from '@/components/InventoryModal';

interface InventoryButtonProps {
  adventureId: string;
  refreshTrigger?: number; // Optional prop to trigger a refresh
}

const InventoryButton: React.FC<InventoryButtonProps> = ({ adventureId, refreshTrigger }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const fetchInventoryCount = async () => {
    if (!token || !adventureId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${VITE_API_URL}/api/adventures/${adventureId}/inventory`,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      if (response.ok) {
        const inventoryItems = await response.json();
        // Count total number of items (including quantities)
        const total = inventoryItems.reduce((sum: number, item: any) => 
          sum + (item.quantity || 1), 0);
        setItemCount(total);
      } else {
        console.error('Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryCount();
  }, [adventureId, token, refreshTrigger]);
  
  const handleOpenInventory = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseInventory = () => {
    setIsModalOpen(false);
    // Refresh count when modal closes
    fetchInventoryCount();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative group"
        onClick={handleOpenInventory}
        title="View Inventory"
      >
        <Backpack className="h-6 w-6 text-arcane-purple group-hover:text-white transition-colors" />
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 bg-arcane-purple"
          >
            {itemCount}
          </Badge>
        )}
      </Button>

      <InventoryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseInventory} 
        adventureId={adventureId}
        onItemsUpdate={fetchInventoryCount}
      />
    </>
  );
};

export default InventoryButton; 