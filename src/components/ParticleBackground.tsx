
import React, { useRef, useEffect } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
};

interface ParticleBackgroundProps {
  count?: number;
  color?: 'purple' | 'blue' | 'mixed';
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  count = 50,
  color = 'purple'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  
  const getColor = () => {
    if (color === 'mixed') {
      return Math.random() > 0.5 ? '#9B87F5' : '#1EAEDB';
    }
    return color === 'purple' ? '#9B87F5' : '#1EAEDB';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.5 + 0.1,
          color: getColor(),
        });
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
        
        particle.opacity += Math.random() * 0.01 - 0.005;
        if (particle.opacity < 0.1) particle.opacity = 0.1;
        if (particle.opacity > 0.6) particle.opacity = 0.6;
      });
      requestAnimationFrame(animate);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [count, color]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default ParticleBackground;
