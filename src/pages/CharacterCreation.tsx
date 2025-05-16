import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Dices, Loader2, Shield, Sword, BookOpen } from 'lucide-react';
import ArcaneButton from '@/components/ArcaneButton';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ADVENTURES_API_URL = `${VITE_API_URL}/api/adventures`;

// Define D&D races
const RACES = [
  { id: 'human', name: 'Human', description: 'Versatile and adaptable, humans are found in every corner of the world.' },
  { id: 'dwarf', name: 'Dwarf', description: 'Strong and sturdy, dwarves are known for their craftsmanship and endurance.' },
  { id: 'elf', name: 'Elf', description: 'Graceful and long-lived, elves are magical beings deeply connected to nature.' },
  { id: 'halfling', name: 'Halfling', description: 'Small but brave, halflings value comfort and community above all else.' },
  { id: 'dragonborn', name: 'Dragonborn', description: 'Draconic humanoids with breath weapons and scales reminiscent of their dragon ancestors.' },
  { id: 'gnome', name: 'Gnome', description: 'Small, inventive, and curious, gnomes bring joy and enthusiasm to everything they do.' },
  { id: 'half-elf', name: 'Half-Elf', description: 'Combining the best qualities of humans and elves, half-elves are diplomatic and perceptive.' },
  { id: 'half-orc', name: 'Half-Orc', description: 'Strong and intimidating, half-orcs excel in physical prowess and endurance.' },
  { id: 'tiefling', name: 'Tiefling', description: 'Bearing the mark of fiendish heritage, tieflings are mysterious and often feared.' },
];

// Define D&D classes
const CLASSES = [
  { id: 'barbarian', name: 'Barbarian', description: 'Fierce warriors who enter a battle rage, fueled by primal instincts.' },
  { id: 'bard', name: 'Bard', description: 'Magical storytellers who weave music and performance into their spellcasting.' },
  { id: 'cleric', name: 'Cleric', description: 'Divine spellcasters who serve deities and channel their power.' },
  { id: 'druid', name: 'Druid', description: 'Nature-connected spellcasters who can transform into animals.' },
  { id: 'fighter', name: 'Fighter', description: 'Versatile combatants with mastery of weapons and armor.' },
  { id: 'monk', name: 'Monk', description: 'Martial artists who harness the power of their body as a weapon.' },
  { id: 'paladin', name: 'Paladin', description: 'Holy warriors who combine martial prowess with divine spells and auras.' },
  { id: 'ranger', name: 'Ranger', description: 'Wilderness experts who hunt monsters and protect nature.' },
  { id: 'rogue', name: 'Rogue', description: 'Skilled infiltrators, trap finders, and precision attackers.' },
  { id: 'sorcerer', name: 'Sorcerer', description: 'Innate spellcasters with magic flowing through their blood.' },
  { id: 'warlock', name: 'Warlock', description: 'Wielders of magic granted by a powerful otherworldly patron.' },
  { id: 'wizard', name: 'Wizard', description: 'Scholarly spellcasters who learn magic through study and practice.' },
];

// Character traits by class
const CLASS_TRAITS = {
  barbarian: [
    { name: 'Rage', description: 'Enter a rage as a bonus action, gaining advantage on Strength checks and saving throws.' },
    { name: 'Unarmored Defense', description: 'While not wearing armor, AC equals 10 + Dexterity modifier + Constitution modifier.' }
  ],
  bard: [
    { name: 'Bardic Inspiration', description: 'Use a bonus action to inspire another creature, giving them a d6 to add to an ability check, attack roll, or saving throw.' },
    { name: 'Spellcasting', description: 'Cast spells using your Charisma as your spellcasting ability.' }
  ],
  cleric: [
    { name: 'Spellcasting', description: 'Cast spells using your Wisdom as your spellcasting ability.' },
    { name: 'Divine Domain', description: 'Choose a divine domain, such as Life, Light, or Knowledge, gaining domain spells and features.' }
  ],
  druid: [
    { name: 'Spellcasting', description: 'Cast spells using your Wisdom as your spellcasting ability.' },
    { name: 'Wild Shape', description: 'Transform into a beast you have seen before.' }
  ],
  fighter: [
    { name: 'Fighting Style', description: 'Choose a fighting style, such as Archery, Defense, or Dueling.' },
    { name: 'Second Wind', description: 'Regain hit points equal to 1d10 + your fighter level as a bonus action once per rest.' }
  ],
  monk: [
    { name: 'Unarmored Defense', description: 'While not wearing armor, AC equals 10 + Dexterity modifier + Wisdom modifier.' },
    { name: 'Martial Arts', description: 'Use Dexterity instead of Strength for unarmed strikes, and they deal 1d4 damage.' }
  ],
  paladin: [
    { name: 'Divine Sense', description: 'Detect the presence of celestial, fiend, or undead within 60 feet.' },
    { name: 'Lay on Hands', description: 'Restore a pool of hit points equal to 5 × your paladin level.' }
  ],
  ranger: [
    { name: 'Favored Enemy', description: 'Choose a type of enemy, gaining advantages in tracking and recalling information about them.' },
    { name: 'Natural Explorer', description: 'Choose a type of terrain, gaining advantages while traveling and tracking in that terrain.' }
  ],
  rogue: [
    { name: 'Expertise', description: 'Choose two skills to gain double your proficiency bonus.' },
    { name: 'Sneak Attack', description: 'Deal extra damage when you have advantage on an attack roll or when an ally is within 5 feet of the target.' }
  ],
  sorcerer: [
    { name: 'Spellcasting', description: 'Cast spells using your Charisma as your spellcasting ability.' },
    { name: 'Sorcerous Origin', description: 'Choose a source of your innate magic, such as Draconic Bloodline or Wild Magic.' }
  ],
  warlock: [
    { name: 'Otherworldly Patron', description: 'Choose a patron, such as the Archfey, the Fiend, or the Great Old One.' },
    { name: 'Pact Magic', description: 'Cast spells using your Charisma as your spellcasting ability, regaining spell slots on a short rest.' }
  ],
  wizard: [
    { name: 'Spellcasting', description: 'Cast spells using your Intelligence as your spellcasting ability.' },
    { name: 'Arcane Recovery', description: 'Recover spell slots during a short rest once per day.' }
  ]
};

// Racial traits
const RACE_TRAITS = {
  human: [
    { name: 'Versatile', description: '+1 to all ability scores.' }
  ],
  dwarf: [
    { name: 'Dwarven Resilience', description: 'Advantage on saving throws against poison and resistance to poison damage.' },
    { name: 'Stonecunning', description: 'Double proficiency bonus on Intelligence (History) checks related to stonework.' }
  ],
  elf: [
    { name: 'Keen Senses', description: 'Proficiency in the Perception skill.' },
    { name: 'Fey Ancestry', description: 'Advantage on saving throws against being charmed, and magic can\'t put you to sleep.' },
    { name: 'Trance', description: 'Don\'t need to sleep. Instead, meditate deeply for 4 hours a day.' }
  ],
  halfling: [
    { name: 'Lucky', description: 'When you roll a 1 on an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.' },
    { name: 'Brave', description: 'Advantage on saving throws against being frightened.' },
    { name: 'Nimbleness', description: 'Can move through the space of any creature that is of a size larger than yours.' }
  ],
  'dragonborn': [
    { name: 'Breath Weapon', description: 'Exhale destructive energy as an action, dealing damage in a 5-foot-wide line or a 15-foot cone.' },
    { name: 'Damage Resistance', description: 'Resistance to the damage type associated with your draconic ancestry.' }
  ],
  gnome: [
    { name: 'Gnome Cunning', description: 'Advantage on Intelligence, Wisdom, and Charisma saving throws against magic.' },
    { name: 'Artificer\'s Lore', description: 'Add twice your proficiency bonus to Intelligence (History) checks related to magic items, alchemical objects, or technological devices.' }
  ],
  'half-elf': [
    { name: 'Fey Ancestry', description: 'Advantage on saving throws against being charmed, and magic can\'t put you to sleep.' },
    { name: 'Skill Versatility', description: 'Gain proficiency in two skills of your choice.' }
  ],
  'half-orc': [
    { name: 'Relentless Endurance', description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead once per long rest.' },
    { name: 'Savage Attacks', description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time.' }
  ],
  tiefling: [
    { name: 'Hellish Resistance', description: 'Resistance to fire damage.' },
    { name: 'Infernal Legacy', description: 'Know the thaumaturgy cantrip. At 3rd level, cast hellish rebuke once per day. At 5th level, cast darkness once per day.' }
  ]
};

// Default stats for quick creation
const DEFAULT_STATS = {
  barbarian: { strength: 15, dexterity: 14, constitution: 13, intelligence: 8, wisdom: 10, charisma: 12 },
  bard: { strength: 8, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 13, charisma: 15 },
  cleric: { strength: 12, dexterity: 8, constitution: 14, intelligence: 10, wisdom: 15, charisma: 13 },
  druid: { strength: 10, dexterity: 14, constitution: 12, intelligence: 13, wisdom: 15, charisma: 8 },
  fighter: { strength: 15, dexterity: 13, constitution: 14, intelligence: 8, wisdom: 12, charisma: 10 },
  monk: { strength: 10, dexterity: 15, constitution: 14, intelligence: 8, wisdom: 13, charisma: 12 },
  paladin: { strength: 15, dexterity: 8, constitution: 13, intelligence: 10, wisdom: 12, charisma: 14 },
  ranger: { strength: 12, dexterity: 15, constitution: 13, intelligence: 10, wisdom: 14, charisma: 8 },
  rogue: { strength: 8, dexterity: 15, constitution: 14, intelligence: 12, wisdom: 10, charisma: 13 },
  sorcerer: { strength: 8, dexterity: 13, constitution: 14, intelligence: 10, wisdom: 12, charisma: 15 },
  warlock: { strength: 8, dexterity: 14, constitution: 12, intelligence: 10, wisdom: 13, charisma: 15 },
  wizard: { strength: 8, dexterity: 13, constitution: 14, intelligence: 15, wisdom: 12, charisma: 10 }
};

const CharacterCreation = () => {
  const { adventureId } = useParams<{ adventureId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  const [characterName, setCharacterName] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentTab, setCurrentTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [createdCharacters, setCreatedCharacters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  const [adventure, setAdventure] = useState<any>(null);

  // Fetch adventure details to get player count
  useEffect(() => {
    const fetchAdventure = async () => {
      if (!adventureId || !token) {
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${ADVENTURES_API_URL}/${adventureId}`, {
          headers: { 'x-auth-token': token }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch adventure details');
        }

        const data = await response.json();
        setAdventure(data);
        setPlayerCount(data.playerCount || 1);
      } catch (error: any) {
        console.error('Error fetching adventure:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load adventure details."
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdventure();
  }, [adventureId, token, navigate, toast]);

  // Reset form when moving to next character
  const resetForm = () => {
    setCharacterName('');
    setSelectedRace('');
    setSelectedClass('');
    setStats({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    });
    setCurrentTab('basic');
  };

  // Apply default stats for selected class
  const applyDefaultStats = () => {
    if (selectedClass && DEFAULT_STATS[selectedClass as keyof typeof DEFAULT_STATS]) {
      setStats(DEFAULT_STATS[selectedClass as keyof typeof DEFAULT_STATS]);
    }
  };

  // Roll random stats
  const rollStats = () => {
    // Simulate 4d6 drop lowest for each stat
    const rollStat = () => {
      const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      rolls.sort((a, b) => a - b);
      return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
    };

    setStats({
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat()
    });
  };

  // Calculate stat modifier
  const getModifier = (stat: number) => {
    const mod = Math.floor((stat - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  // Complete character creation
  const handleCreateCharacter = async () => {
    if (!characterName) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter a name for your character."
      });
      return;
    }

    if (!selectedRace) {
      toast({
        variant: "destructive",
        title: "Race Required",
        description: "Please select a race for your character."
      });
      return;
    }

    if (!selectedClass) {
      toast({
        variant: "destructive",
        title: "Class Required",
        description: "Please select a class for your character."
      });
      return;
    }

    try {
      setIsSaving(true);

      // Gather traits from race and class
      const raceTraits = RACE_TRAITS[selectedRace as keyof typeof RACE_TRAITS] || [];
      const classTraits = CLASS_TRAITS[selectedClass as keyof typeof CLASS_TRAITS] || [];
      const allTraits = [...raceTraits, ...classTraits].map(trait => ({
        name: trait.name,
        description: trait.description,
        source: raceTraits.includes(trait) ? 'race' : 'class'
      }));

      // Create character data
      const characterData = {
        name: characterName,
        race: RACES.find(r => r.id === selectedRace)?.name || selectedRace,
        characterClass: CLASSES.find(c => c.id === selectedClass)?.name || selectedClass,
        stats,
        traits: allTraits
      };

      // Save to API
      const response = await fetch(`${ADVENTURES_API_URL}/${adventureId}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token as string
        },
        body: JSON.stringify(characterData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create character');
      }

      const savedCharacter = await response.json();
      setCreatedCharacters(prev => [...prev, savedCharacter]);

      toast({
        title: "Character Created!",
        description: `${characterName} has joined the adventure!`
      });

      // Check if we need to create more characters
      if (currentCharacterIndex < playerCount - 1) {
        setCurrentCharacterIndex(currentCharacterIndex + 1);
        resetForm();
      } else {
        // All characters created, navigate to chat
        navigate(`/chat/${adventureId}`);
      }
    } catch (error: any) {
      console.error('Error creating character:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create character."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-arcane-darker text-white">
        <Loader2 className="h-8 w-8 animate-spin text-arcane-purple mr-2" />
        <span>Loading adventure details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-arcane-darker text-white p-6">
      <header className="mb-8 max-w-4xl mx-auto">
        <div className="flex items-center">
          <GlowingRune symbol="⚔" size="md" />
          <div className="ml-3">
            <h1 className="text-3xl font-arcane text-glow">Character Creation</h1>
            <p className="text-gray-400 text-sm">
              Adventure: {adventure?.name} • Character {currentCharacterIndex + 1} of {playerCount}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="arcane-card p-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="basic" className="arcane-tab">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="stats" className="arcane-tab">
              Abilities
            </TabsTrigger>
            <TabsTrigger value="review" className="arcane-tab">
              Review
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="character-name">Character Name</Label>
                <Input
                  id="character-name"
                  value={characterName}
                  onChange={e => setCharacterName(e.target.value)}
                  placeholder="Enter character name"
                  className="bg-arcane-darker border-arcane-purple/30 focus:border-arcane-purple"
                />
              </div>

              <div>
                <Label htmlFor="race">Race</Label>
                <Select value={selectedRace} onValueChange={setSelectedRace}>
                  <SelectTrigger className="w-full bg-arcane-darker border-arcane-purple/30">
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent className="bg-arcane-darker border-arcane-purple/30">
                    {RACES.map(race => (
                      <SelectItem key={race.id} value={race.id}>
                        {race.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRace && (
                  <p className="mt-2 text-sm text-gray-400">
                    {RACES.find(r => r.id === selectedRace)?.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="class">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full bg-arcane-darker border-arcane-purple/30">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="bg-arcane-darker border-arcane-purple/30">
                    {CLASSES.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <p className="mt-2 text-sm text-gray-400">
                    {CLASSES.find(c => c.id === selectedClass)?.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <ArcaneButton onClick={() => setCurrentTab('stats')} disabled={!characterName || !selectedRace || !selectedClass}>
                  Next: Abilities <ChevronRight size={16} className="ml-2" />
                </ArcaneButton>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-arcane">Ability Scores</h3>
              <div className="flex space-x-2">
                <ArcaneButton variant="outline" onClick={applyDefaultStats} className="text-sm">
                  <Sword size={14} className="mr-1" /> Class Defaults
                </ArcaneButton>
                <ArcaneButton variant="outline" onClick={rollStats} className="text-sm">
                  <Dices size={14} className="mr-1" /> Roll Stats
                </ArcaneButton>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="arcane-card border-arcane-purple/20 p-4 flex flex-col items-center">
                  <label className="text-sm text-gray-400 uppercase mb-1">
                    {stat}
                  </label>
                  <div className="text-3xl font-arcane text-arcane-purple mb-1">{value}</div>
                  <div className="text-sm">{getModifier(value)}</div>
                  <div className="flex mt-2">
                    <button
                      onClick={() => setStats(prev => ({ ...prev, [stat]: Math.max(3, prev[stat as keyof typeof prev] - 1) }))}
                      className="w-8 h-8 rounded-l-md bg-arcane-purple/20 hover:bg-arcane-purple/30 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={value}
                      onChange={e => {
                        const newValue = Math.min(20, Math.max(3, parseInt(e.target.value) || 3));
                        setStats(prev => ({ ...prev, [stat]: newValue }));
                      }}
                      className="w-12 text-center bg-arcane-darker border-y border-arcane-purple/30"
                      min="3"
                      max="20"
                    />
                    <button
                      onClick={() => setStats(prev => ({ ...prev, [stat]: Math.min(20, prev[stat as keyof typeof prev] + 1) }))}
                      className="w-8 h-8 rounded-r-md bg-arcane-purple/20 hover:bg-arcane-purple/30 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <ArcaneButton variant="outline" onClick={() => setCurrentTab('basic')}>
                <ChevronLeft size={16} className="mr-2" /> Back: Basic Info
              </ArcaneButton>
              <ArcaneButton onClick={() => setCurrentTab('review')}>
                Next: Review <ChevronRight size={16} className="ml-2" />
              </ArcaneButton>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="arcane-card border-arcane-purple/20 p-4">
                <h3 className="text-xl font-arcane mb-4 text-arcane-purple">Character Summary</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Name:</span> {characterName || '(Not set)'}
                  </div>
                  <div>
                    <span className="text-gray-400">Race:</span> {selectedRace ? RACES.find(r => r.id === selectedRace)?.name : '(Not selected)'}
                  </div>
                  <div>
                    <span className="text-gray-400">Class:</span> {selectedClass ? CLASSES.find(c => c.id === selectedClass)?.name : '(Not selected)'}
                  </div>
                </div>
              </div>

              <div className="arcane-card border-arcane-purple/20 p-4">
                <h3 className="text-xl font-arcane mb-4 text-arcane-purple">Ability Scores</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(stats).map(([stat, value]) => (
                    <div key={stat} className="text-center">
                      <div className="uppercase text-xs text-gray-400">{stat}</div>
                      <div className="text-lg">{value} <span className="text-sm">({getModifier(value)})</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="arcane-card border-arcane-purple/20 p-4 md:col-span-2">
                <h3 className="text-xl font-arcane mb-4 text-arcane-purple">Traits & Abilities</h3>
                <div className="space-y-3">
                  {selectedRace && RACE_TRAITS[selectedRace as keyof typeof RACE_TRAITS]?.map((trait, index) => (
                    <div key={`race-${index}`} className="pb-2 border-b border-arcane-purple/10">
                      <div className="font-medium flex items-center">
                        <Shield size={14} className="text-arcane-blue mr-2" /> {trait.name}
                        <span className="ml-auto text-xs text-arcane-blue">Racial</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{trait.description}</div>
                    </div>
                  ))}
                  
                  {selectedClass && CLASS_TRAITS[selectedClass as keyof typeof CLASS_TRAITS]?.map((trait, index) => (
                    <div key={`class-${index}`} className="pb-2 border-b border-arcane-purple/10">
                      <div className="font-medium flex items-center">
                        <BookOpen size={14} className="text-arcane-purple mr-2" /> {trait.name}
                        <span className="ml-auto text-xs text-arcane-purple">Class</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{trait.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <ArcaneButton variant="outline" onClick={() => setCurrentTab('stats')}>
                <ChevronLeft size={16} className="mr-2" /> Back: Abilities
              </ArcaneButton>
              <ArcaneButton onClick={handleCreateCharacter} disabled={!characterName || !selectedRace || !selectedClass || isSaving}>
                {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                {isSaving ? 'Saving...' : 'Complete Character'}
              </ArcaneButton>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CharacterCreation; 