
import { Home, Film, tv, activity } from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const navItems = [
    { id: "home", icon: Home },
    { id: "movies", icon: Film },
    { id: "series", icon: tv },
    { id: "analytics", icon: activity }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-2 bg-card/20 backdrop-blur-xl border border-border/20 rounded-full px-4 py-3 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`p-3 rounded-full transition-all duration-300 ${
              activeTab === item.id
                ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white shadow-lg scale-110"
                : "text-muted-foreground hover:text-foreground hover:bg-background/20"
            }`}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
