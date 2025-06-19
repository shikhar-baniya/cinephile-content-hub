// Page indicator for mobile navigation
import { cn } from '@/lib/utils';

interface PageIndicatorProps {
  activeTab: string;
  tabs: Array<{ id: string; label: string }>;
}

const PageIndicator = ({ activeTab, tabs }: PageIndicatorProps) => {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const activeTab_ = tabs.find(tab => tab.id === activeTab);

  if (!activeTab_) return null;

  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm border border-border/20 rounded-full px-4 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === activeIndex
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <div className="mx-2 w-px h-4 bg-border/30" />
        <span className="text-sm font-medium text-foreground/80 capitalize">
          {activeTab_.label}
        </span>
      </div>
    </div>
  );
};

export default PageIndicator;