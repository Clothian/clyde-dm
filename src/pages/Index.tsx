
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import ArcaneInput from '@/components/ArcaneInput';
import ArcaneButton from '@/components/ArcaneButton';
import ParticleBackground from '@/components/ParticleBackground';
import GlowingRune from '@/components/GlowingRune';

const Index = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground count={70} color="mixed" />
      
      {/* Decorative runes */}
      <div className="absolute top-10 left-10 animate-float opacity-30">
        <GlowingRune symbol="⦿" size="lg" />
      </div>
      <div className="absolute bottom-10 right-10 animate-float opacity-30" style={{ animationDelay: '1s' }}>
        <GlowingRune symbol="⧖" size="lg" color="blue" />
      </div>
      <div className="absolute top-1/4 right-1/4 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <GlowingRune symbol="⧉" size="md" />
      </div>
      <div className="absolute bottom-1/4 left-1/5 animate-float opacity-20" style={{ animationDelay: '1.5s' }}>
        <GlowingRune symbol="⦾" size="md" color="blue" />
      </div>
      
      {/* Login card */}
      <div className="arcane-card w-full max-w-md p-8 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-arcane-purple/5 to-arcane-blue/5 rounded-lg"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-glow mb-2">DM Nexus</h1>
          <p className="text-gray-400">Enter the realm of infinite adventures</p>
        </div>
        
        <form className="space-y-6">
          <ArcaneInput
            label="Username"
            icon={<User size={18} />}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <ArcaneInput
            label="Password"
            icon={<Lock size={18} />}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          
          <button
            type="button"
            className="absolute right-12 top-[231px] text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <ArcaneButton className="w-full h-12 font-arcane text-lg">
            Enter the Realm
          </ArcaneButton>
          
          <div className="text-center">
            <p className="text-gray-400">
              New adventurer? {' '}
              <Link to="/signup" className="text-arcane-purple hover:text-arcane-purple-light transition-colors">
                Join the Guild
              </Link>
            </p>
          </div>
        </form>
        
        {/* Decorative rune border */}
        <div className="absolute inset-0 border border-arcane-purple/30 rounded-lg pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <GlowingRune symbol="⎈" size="md" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <GlowingRune symbol="⎊" size="md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
