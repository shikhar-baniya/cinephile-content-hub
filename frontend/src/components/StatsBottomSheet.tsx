import { useState } from "react";
import { Clock, Tv, Calendar, Sparkles } from "lucide-react";
import BottomSheet from "./BottomSheet";
import StoryMode from "./StoryMode";
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
    const [isStoryMode, setIsStoryMode] = useState(false);

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

    const stories = [
        {
            id: 'watchTime',
            title: 'Watch Time Analytics',
            content: (
                <div className="text-white py-8">
                    {watchTimeContent}
                </div>
            )
        },
        {
            id: 'seriesProgress',
            title: 'Series Progress',
            content: (
                <div className="text-white py-8">
                    {seriesProgressContent}
                </div>
            )
        },
        {
            id: 'activity',
            title: 'Episode Activity',
            content: (
                <div className="text-white py-8">
                    {activityContent}
                </div>
            )
        }
    ];

    const currentStoryIndex = tabs.findIndex(tab => tab.id === activeTab);

    return (
        <>
            <BottomSheet
                isOpen={isOpen && !isStoryMode}
                onClose={onClose}
                snapPoints={[65, 90]}
            >
                {/* Tabs */}
                <div className="sticky top-0 bg-card z-10 -mx-6 px-6 pb-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto">
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

                    {/* Story Mode Toggle */}
                    <button
                        onClick={() => setIsStoryMode(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
                    >
                        <Sparkles className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-purple-400">View as Story</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="pt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                    {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
            </BottomSheet>

            <StoryMode
                isOpen={isStoryMode}
                onClose={() => setIsStoryMode(false)}
                stories={stories}
                initialIndex={currentStoryIndex}
            />
        </>
    );
};

export default StatsBottomSheet;
