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
            icon: Clock,
            content: watchTimeContent
        },
        {
            id: 'seriesProgress' as const,
            label: 'Series',
            icon: Tv,
            content: seriesProgressContent
        },
        {
            id: 'activity' as const,
            label: 'Activity',
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
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            <div className="pt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </BottomSheet>
    );
};

export default StatsBottomSheet;
