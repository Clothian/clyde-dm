import { useState } from 'react';
import { Shield, Sword, Book, Heart, ArrowUp, User, X } from 'lucide-react';
import ArcaneButton from './ArcaneButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  source: string;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experiencePoints: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    current: number;
    maximum: number;
  };
  armorClass: number;
  proficiencyBonus: number;
  traits: CharacterTrait[];
  skills?: Record<string, number>;
  inventory?: any[];
  createdAt: string;
  updatedAt: string;
}

interface CharacterSheetProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

const CharacterSheet = ({ character, isOpen, onClose }: CharacterSheetProps) => {
  const [activeTab, setActiveTab] = useState('stats');

  // Calculate ability modifiers
  const getModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  // XP required for next level based on D&D 5e rules
  const getXpForNextLevel = (currentLevel: number) => {
    const xpThresholds = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    return currentLevel < 20 ? xpThresholds[currentLevel] : "MAX";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-arcane-darker border-arcane-purple/30 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="font-arcane text-glow text-xl flex items-center gap-2">
            <User size={18} className="text-arcane-purple" />
            Character Sheet: {character.name}
          </DialogTitle>
          <ArcaneButton variant="outline" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X size={16} />
          </ArcaneButton>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto arcane-scrollbar">
          <div className="p-1">
            {/* Character Header */}
            <div className="arcane-card border-arcane-purple/20 p-4 mb-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <h2 className="text-2xl font-arcane text-arcane-purple">{character.name}</h2>
                  <p className="text-gray-400">
                    Level {character.level} {character.race} {character.class}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase text-gray-500">Experience</div>
                  <div className="text-lg">{character.experiencePoints} / {getXpForNextLevel(character.level)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs uppercase text-gray-500">Proficiency</div>
                  <div className="text-lg">+{character.proficiencyBonus}</div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-arcane-purple/20 mb-4">
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'stats' ? 'text-arcane-purple border-b-2 border-arcane-purple' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('stats')}
              >
                Abilities & Combat
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'traits' ? 'text-arcane-purple border-b-2 border-arcane-purple' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('traits')}
              >
                Traits & Features
              </button>
            </div>
            
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Combat Stats */}
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <div className="arcane-card border-arcane-purple/20 p-4 flex-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield size={18} className="text-arcane-blue mr-2" />
                          <span className="text-gray-400">Armor Class</span>
                        </div>
                        <div className="text-2xl font-arcane">{character.armorClass}</div>
                      </div>
                      <div className="arcane-card border-arcane-purple/20 p-4 flex-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart size={18} className="text-red-500 mr-2" />
                          <span className="text-gray-400">Hit Points</span>
                        </div>
                        <div className="text-2xl font-arcane">{character.hitPoints.current}/{character.hitPoints.maximum}</div>
                      </div>
                    </div>
                    <div className="arcane-card border-arcane-purple/20 p-4">
                      <h3 className="text-lg font-arcane text-arcane-purple mb-3">Saving Throws</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(character.stats).map(([stat, value]) => {
                          const mod = parseInt(getModifier(value));
                          const total = mod + (stat === 'strength' || stat === 'constitution' || stat === 'dexterity' ? character.proficiencyBonus : 0);
                          
                          return (
                            <div key={stat} className="flex justify-between items-center border-b border-arcane-purple/10 pb-1">
                              <span className="capitalize text-gray-400">{stat}</span>
                              <span className={total >= 0 ? 'text-arcane-blue' : 'text-red-400'}>
                                {total >= 0 ? `+${total}` : total}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column: Ability Scores */}
                  <div className="arcane-card border-arcane-purple/20 p-4">
                    <h3 className="text-lg font-arcane text-arcane-purple mb-3">Ability Scores</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(character.stats).map(([stat, value]) => (
                        <div key={stat} className="flex flex-col items-center arcane-card border-arcane-purple/10 p-3">
                          <span className="uppercase text-xs text-gray-500 mb-1">{stat}</span>
                          <div className="text-2xl font-arcane text-arcane-purple">{value}</div>
                          <div className="text-sm text-gray-400">{getModifier(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Skills Section */}
                {character.skills && Object.keys(character.skills).length > 0 && (
                  <div className="arcane-card border-arcane-purple/20 p-4">
                    <h3 className="text-lg font-arcane text-arcane-purple mb-3">Skills</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(character.skills).map(([skill, bonus]) => (
                        <div key={skill} className="flex justify-between items-center">
                          <span className="capitalize text-gray-400">{skill}</span>
                          <span className="text-arcane-blue">+{bonus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Traits Tab */}
            {activeTab === 'traits' && (
              <div className="arcane-card border-arcane-purple/20 p-4">
                <h3 className="text-lg font-arcane text-arcane-purple mb-3">Traits & Features</h3>
                <div className="space-y-4">
                  {character.traits.map((trait) => (
                    <div key={trait.id} className="pb-3 border-b border-arcane-purple/10 last:border-0">
                      <div className="flex items-center">
                        {trait.source === 'race' ? (
                          <Shield size={14} className="text-arcane-blue mr-2" />
                        ) : (
                          <Book size={14} className="text-arcane-purple mr-2" />
                        )}
                        <h4 className="font-medium">{trait.name}</h4>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          trait.source === 'race' 
                            ? 'bg-arcane-blue/20 text-arcane-blue-light' 
                            : 'bg-arcane-purple/20 text-arcane-purple-light'
                        }`}>
                          {trait.source === 'race' ? 'Racial' : 'Class'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 pl-6">{trait.description}</p>
                    </div>
                  ))}
                  
                  {character.traits.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No traits available for this character.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSheet; 