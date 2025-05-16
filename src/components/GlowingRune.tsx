
import React from 'react';
import { cn } from '@/lib/utils';

type GlowingRuneProps = {
  symbol: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'blue';
  animated?: boolean;
};

const GlowingRune = ({ 
  symbol, 
  className, 
  size = 'md', 
  color = 'purple',
  animated = true 
}: GlowingRuneProps) => {
  const sizeClasses = {
    sm: 'text-lg w-8 h-8',
    md: 'text-2xl w-10 h-10',
    lg: 'text-4xl w-16 h-16'
  };

  const colorClasses = {
    purple: 'text-arcane-purple border-arcane-purple/50',
    blue: 'text-arcane-blue border-arcane-blue/50'
  };
  
  return (
    <div className={cn(
      'relative flex items-center justify-center rounded-full border',
      sizeClasses[size],
      colorClasses[color],
      animated && 'animate-pulse-glow',
      className
    )}>
      <span className="text-glow">{symbol}</span>
      <div className={cn(
        'absolute inset-0 rounded-full blur-sm -z-10',
        color === 'purple' ? 'bg-arcane-purple/20' : 'bg-arcane-blue/20'
      )} />
    </div>
  );
};

export default GlowingRune;
