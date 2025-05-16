import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import ArcaneInput from '@/components/ArcaneInput';
import ArcaneButton from '@/components/ArcaneButton';
import ParticleBackground from '@/components/ParticleBackground';
import GlowingRune from '@/components/GlowingRune';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formFocused, setFormFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, isAuthenticated, error, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);
  
  useEffect(() => {
    // Show error toast if signup fails
    if (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error,
      });
    }
  }, [error, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signup(username, email, password);
      // Auth context will handle redirect if signup is successful
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
        <GlowingRune symbol="⧗" size="lg" color="blue" />
      </div>
      <div className="absolute bottom-10 right-10 animate-float opacity-30" style={{ animationDelay: '1s' }}>
        <GlowingRune symbol="⦿" size="lg" />
      </div>
      <div className="absolute top-1/3 right-1/5 animate-float opacity-20" style={{ animationDelay: '2s' }}>
        <GlowingRune symbol="⧉" size="md" color="blue" />
      </div>
      <div className="absolute bottom-1/3 left-1/4 animate-float opacity-20" style={{ animationDelay: '1.5s' }}>
        <GlowingRune symbol="⦾" size="md" />
      </div>
      
      {/* Portal circles - animated when form is focused */}
      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] transition-opacity duration-1000 ${formFocused ? 'opacity-40' : 'opacity-0'}`}>
        <div className="portal-circle" style={{ animationDuration: '30s' }}></div>
        <div className="portal-circle" style={{ width: '80%', height: '80%', top: '10%', left: '10%', animationDuration: '25s', animationDirection: 'reverse' }}></div>
        <div className="portal-circle" style={{ width: '60%', height: '60%', top: '20%', left: '20%', animationDuration: '20s' }}></div>
        <div className="portal-circle" style={{ width: '40%', height: '40%', top: '30%', left: '30%', animationDuration: '15s', animationDirection: 'reverse' }}></div>
      </div>
      
      {/* Signup card */}
      <div className="arcane-card w-full max-w-md p-8 relative z-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-arcane-blue/5 to-arcane-purple/5 rounded-lg"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-glow mb-2">Join the Guild</h1>
          <p className="text-gray-400">Begin your mystical journey</p>
        </div>
        
        <form 
          className="space-y-6"
          onSubmit={handleSubmit}
          onFocus={() => setFormFocused(true)}
          onBlur={(e) => {
            // Only set formFocused to false if the related target is outside the form
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setFormFocused(false);
            }
          }}
        >
          <ArcaneInput
            label="Choose a Username"
            icon={<User size={18} />}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <ArcaneInput
            label="Your Email"
            icon={<Mail size={18} />}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <ArcaneInput
            label="Create a Password"
            icon={<Lock size={18} />}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          
          <button
            type="button"
            className="absolute right-12 top-[282px] text-gray-400 hover:text-white transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <ArcaneButton 
            type="submit"
            className="w-full h-12 font-arcane text-lg" 
            glowColor="blue"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              'Bind My Fate'
            )}
          </ArcaneButton>
          
          <div className="text-center">
            <p className="text-gray-400">
              Already a member? {' '}
              <Link to="/" className="text-arcane-blue hover:text-arcane-blue-dark transition-colors">
                Return to Gateway
              </Link>
            </p>
          </div>
        </form>
        
        {/* Decorative rune border */}
        <div className="absolute inset-0 border border-arcane-blue/30 rounded-lg pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <GlowingRune symbol="⎈" size="md" color="blue" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <GlowingRune symbol="⎊" size="md" color="blue" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
