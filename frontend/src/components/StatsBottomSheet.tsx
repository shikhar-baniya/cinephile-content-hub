import { useState, useEffect } from "react";
import { Clock, Tv, Calendar } from "lucide-react";
import BottomSheet from "./BottomSheet";
import { Movie } from "./MovieCard";

interface StatsBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'watchTime' | 'seriesProgress' | 'activity';
    movies: Movie[];
    watchTimeContent: React.ReactNode;
    seriesProgressContent: React.ReactNode;
    activityContent: React.ReactNode;
}

const StatsBottomSheet = ({
    isOpen,
    onClose,
    initialTab = 'watchTime',
    movies,
    watchTimeContent,
    seriesProgressContent,
    activityContent
}: StatsBottomSheetProps) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update activeTab when initialTab changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [initialTab, isOpen]);

    const tabs = [
        {
            id: 'watchTime' as const,
            label: 'Watch Time',
            subtitle: 'Total hours, averages, and breakdowns',
            icon: Clock,
            content: watchTimeContent
        },
        {
            id: 'seriesProgress' as const,
            label: 'Series Progress',
            subtitle: 'Current season progress and completion',
            icon: Tv,
            content: seriesProgressContent
        },
        {
            id: 'activity' as const,
            label: 'Viewing Activity',
            subtitle: 'Daily heatmap, streaks, and recent totals',
            icon: Calendar,
            content: activityContent
        }
    ];

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            {/* Tabs */}
            <div className="sticky top-0 bg-card z-10 -mx-6 px-6 pb-4 border-b border-border/50">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40'
                                    : 'bg-muted/70 text-muted-foreground hover:bg-muted/90'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="pt-2 animate-in fade-in-0 slide-in-from-top-2 duration-300 space-y-3">
                {(() => {
                    const activeTabData = tabs.find(tab => tab.id === activeTab);
                    if (!activeTabData) return null;

                    const ActiveIcon = activeTabData.icon;

                    return (
                        <>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground/90 flex items-center gap-2">
                                    <ActiveIcon className="h-4 w-4 text-primary" />
                                    {activeTabData.label}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {activeTabData.subtitle}
                                </p>
                            </div>
                            <div>
                                {activeTabData.content}
                            </div>
                        </>
                    );
                })()}
            </div>
        </BottomSheet>
    );
};

export default StatsBottomSheet;
