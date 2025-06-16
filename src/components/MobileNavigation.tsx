
import { Home, Film, Tv, Activity, Plus } from "lucide-react";
import { useState } from "react";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddMovie: () => void;
}

const MobileNavigation = ({ activeTab, onTabChange, onAddMovie }: MobileNavigationProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "add", icon: Plus, isAction: true, label: "Add" },
    { id: "series", icon: Tv, label: "Series" },
    { id: "analytics", icon: Activity, label: "Analytics" }
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab && !isTransitioning) {
      setIsTransitioning(true);
      onTabChange(tabId);
      
      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-1 bg-card/40 backdrop-blur-xl border border-border/30 rounded-full px-3 py-2 shadow-2xl shadow-black/20">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => item.isAction ? onAddMovie() : handleTabChange(item.id)}
            className={`group relative rounded-full transition-all duration-300 ease-in-out transform active:scale-95 ${
              item.isAction
                ? "p-3 bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white hover:scale-110 hover:shadow-lg hover:shadow-primary/25 active:scale-100"
                : activeTab === item.id
                ? "p-2.5 text-primary bg-primary/10 shadow-inner scale-105 border border-primary/20"
                : "p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:scale-105"
            }`}
          >
            <item.icon className={`transition-all duration-300 ${
              item.isAction 
                ? "h-6 w-6" 
                : activeTab === item.id 
                ? "h-5 w-5" 
                : "h-4 w-4 group-hover:h-5 group-hover:w-5"
            }`} />
            
            {/* Active indicator */}
            {!item.isAction && activeTab === item.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
            )}
            
            {/* Transition indicator */}
            {!item.isAction && isTransitioning && activeTab === item.id && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-20 group-active:bg-white transition-opacity duration-150" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
