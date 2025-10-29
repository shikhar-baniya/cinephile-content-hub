import { Smartphone, Film, Sparkles } from 'lucide-react';

const DesktopWarning = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Animated particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent/40 rounded-full animate-float"></div>
        <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-float-delayed"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-accent/10 to-pink-500/10 rounded-full blur-xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Main Card */}
        <div className="floating-card p-8 text-center animate-fade-in">
          <div className="mb-8">
            {/* Icon with gradient background */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse-slow"></div>
              <Smartphone className="w-12 h-12 text-primary relative z-10" />
            </div>
            
            {/* Title with gradient text */}
            <h1 className="text-3xl font-bold gradient-text mb-3">
              Mobile Only Access
            </h1>
            
            {/* Subtitle */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Film className="w-4 h-4" />
              <span className="text-sm font-medium">BingeBook</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-6 text-foreground/80">
            <p className="text-lg leading-relaxed">
              This cinematic experience is crafted exclusively for mobile devices. 
              Please access BingeBook from your smartphone or tablet for the optimal viewing experience.
            </p>
            
            <div className="pt-6 border-t border-border/40">
              <p className="text-sm font-medium text-muted-foreground">
                Switch to a mobile device to continue your journey
              </p>
            </div>
          </div>
          
          {/* Bottom tip card */}
          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Pro Tip</span>
            </div>
            <p className="text-sm text-foreground/70">
              Add BingeBook to your mobile home screen for a native app-like experience
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-transparent rounded-full animate-float"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-accent/20 to-transparent rounded-full animate-float-delayed"></div>
      </div>
    </div>
  );
};

export default DesktopWarning;