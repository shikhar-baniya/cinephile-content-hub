// Modern futuristic background with animations
import { useEffect, useState } from 'react';

const FuturisticBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    if (!prefersReducedMotion) {
      let animationId: number;
      
      const handleMouseMove = (e: MouseEvent) => {
        // Throttle mouse movement updates for performance
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        animationId = requestAnimationFrame(() => {
          setMousePosition({
            x: (e.clientX / window.innerWidth) * 100,
            y: (e.clientY / window.innerHeight) * 100,
          });
        });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Animated mesh gradient */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(139, 92, 246, 0.3) 0%, 
              transparent 50%),
            radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, 
              rgba(59, 130, 246, 0.2) 0%, 
              transparent 50%),
            radial-gradient(circle at 50% 50%, 
              rgba(168, 85, 247, 0.1) 0%, 
              transparent 70%)
          `,
        }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0">
        {/* Large orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full 
                        bg-gradient-to-r from-purple-500/10 to-blue-500/10 
                        blur-3xl animate-pulse-slow" />
        
        {/* Medium orb */}
        <div className="absolute top-3/4 right-1/4 w-64 h-64 rounded-full 
                        bg-gradient-to-r from-blue-500/15 to-indigo-500/10 
                        blur-2xl animate-float" />
        
        {/* Small orb */}
        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full 
                        bg-gradient-to-r from-violet-500/20 to-purple-500/15 
                        blur-xl animate-float-delayed" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Animated particles - only if motion is not reduced */}
      {!reducedMotion && (
        <>
          <div className="absolute inset-0">
            {Array.from({ length: 25 }).map((_, i) => {
              // Generate consistent values to avoid re-renders
              const left = (i * 7 + 11) % 100;
              const top = (i * 13 + 19) % 100;
              const delay = (i * 0.4) % 10;
              const duration = 15 + (i % 5) * 2;
              
              return (
                <div
                  key={`particle-${i}`}
                  className={`absolute rounded-full animate-particle ${
                    i % 3 === 0 
                      ? "w-1 h-1 bg-purple-400/40" 
                      : i % 3 === 1 
                      ? "w-0.5 h-0.5 bg-blue-400/30" 
                      : "w-1.5 h-1.5 bg-violet-400/20"
                  }`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              );
            })}
          </div>

          {/* Floating geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => {
              // Generate consistent values
              const size = 20 + (i % 4) * 10;
              const left = (i * 17 + 23) % 90;
              const top = (i * 29 + 31) % 90;
              const delay = i * 1.5;
              const duration = 8 + (i % 3) * 2;
              
              return (
                <div
                  key={`shape-${i}`}
                  className={`absolute border border-purple-500/10 animate-float ${
                    i % 2 === 0 ? "rotate-45" : "-rotate-12"
                  }`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Subtle neural network lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }).map((_, i) => {
          // SVG viewBox size
          const width = 1000;
          const height = 1000;
          // Convert percent to px
          const x1 = ((i * 13 + 17) % 100) * width / 100;
          const y1 = ((i * 23 + 31) % 100) * height / 100;
          const x2 = ((i * 37 + 41) % 100) * width / 100;
          const y2 = ((i * 43 + 47) % 100) * height / 100;
          const x3 = ((i * 53 + 59) % 100) * width / 100;
          const y3 = ((i * 61 + 67) % 100) * height / 100;
          
          return (
            <g key={`path-${i}`}>
              <path
                d={`M${x1} ${y1} Q${x2} ${y2} ${x3} ${y3}`}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                fill="none"
                className="animate-draw"
                style={{
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${20 + (i % 3) * 3}s`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 w-96 h-2 
                      bg-gradient-to-r from-transparent via-purple-500/20 to-transparent 
                      blur-sm animate-glow-horizontal" />
      
      <div className="absolute right-0 top-1/2 w-2 h-96 
                      bg-gradient-to-b from-transparent via-blue-500/20 to-transparent 
                      blur-sm animate-glow-vertical" />
    </div>
  );
};

export default FuturisticBackground;