import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import ArcaneInput from '@/components/ArcaneInput';
import ArcaneButton from '@/components/ArcaneButton';
import ParticleBackground from '@/components/ParticleBackground';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // If already authenticated, redirect to chat
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    // Show error toast if login fails
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error,
      });
    }
  }, [error, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both email and password",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // Auth context will handle redirect if login is successful
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          <h1 className="text-3xl font-bold text-glow mb-2">Clyde DM</h1>
          <p className="text-gray-400">Enter the realm of infinite adventures</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <ArcaneInput
            label="Email"
            icon={<User size={18} />}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
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
          
          <ArcaneButton 
            type="submit" 
            className="w-full h-12 font-arcane text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              'Enter the Realm'
            )}
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
