
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ArcaneInputProps = React.ComponentPropsWithoutRef<typeof Input> & {
  label?: string;
  icon?: React.ReactNode;
  glowColor?: 'purple' | 'blue';
};

const ArcaneInput = React.forwardRef<HTMLInputElement, ArcaneInputProps>(
  ({ className, label, icon, glowColor = 'purple', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full space-y-2">
        {label && (
          <Label className="font-arcane text-sm text-gray-300">{label}</Label>
        )}
        <div className="arcane-input-wrapper">
          <div 
            className={cn(
              'relative flex items-center overflow-hidden rounded-md arcane-glass',
              isFocused && glowColor === 'purple' && 'ring-1 ring-arcane-purple/60',
              isFocused && glowColor === 'blue' && 'ring-1 ring-arcane-blue/60',
            )}
          >
            {icon && (
              <div className="absolute left-3 text-arcane-purple/70">
                {icon}
              </div>
            )}
            <Input
              ref={ref}
              className={cn(
                'border-0 bg-transparent h-12 pl-10 text-white placeholder:text-gray-500',
                icon ? 'pl-10' : 'pl-4',
                className
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />
          </div>
        </div>
      </div>
    );
  }
);

ArcaneInput.displayName = 'ArcaneInput';

export default ArcaneInput;
