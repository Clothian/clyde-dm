
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ArcaneButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  variant?: 'default' | 'outline' | 'rune';
  glowColor?: 'purple' | 'blue';
};

const ArcaneButton = React.forwardRef<HTMLButtonElement, ArcaneButtonProps>(
  ({ className, variant = 'default', glowColor = 'purple', children, ...props }, ref) => {
    const glowClasses = {
      purple: 'hover:shadow-[0_0_15px_rgba(155,135,245,0.7)]',
      blue: 'hover:shadow-[0_0_15px_rgba(30,174,219,0.7)]',
    };

    const variantClasses = {
      default: 'bg-gradient-to-r from-arcane-purple to-arcane-blue text-white border-0',
      outline: 'bg-transparent border border-arcane-purple/50 text-arcane-purple hover:bg-arcane-purple/10',
      rune: 'relative bg-transparent border border-arcane-purple/50 text-arcane-purple rounded-full aspect-square p-0 hover:bg-arcane-purple/10',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'relative transition-all duration-300',
          variantClasses[variant],
          glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {variant === 'rune' ? (
          <>
            <span className="absolute inset-0 rounded-full bg-arcane-purple/5"></span>
            <span className="z-10">{children}</span>
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

ArcaneButton.displayName = 'ArcaneButton';

export default ArcaneButton;
