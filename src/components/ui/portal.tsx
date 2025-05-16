import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  // Make sure we're rendering in the browser environment
  if (typeof document === 'undefined') {
    return null;
  }

  // Create a portal that renders children into the document body
  return createPortal(
    children,
    document.body
  );
}

export default Portal; 