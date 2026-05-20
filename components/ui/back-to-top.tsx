'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'hidden md:flex items-center justify-center',
        'fixed bottom-6 right-6 z-40',
        'w-10 h-10 rounded-full',
        'bg-space-700/80 backdrop-blur-sm',
        'border border-space-600/50',
        'text-star-dim hover:text-star-white',
        'hover:bg-space-600 hover:border-cosmic-blue/50',
        'shadow-lg shadow-black/30',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
