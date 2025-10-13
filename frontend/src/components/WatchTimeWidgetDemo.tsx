import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, TrendingUp, Sparkles } from "lucide-react";

// Demo component to showcase different animation styles
const WatchTimeWidgetDemo = () => {
    const [activeDemo, setActiveDemo] = useState<'expandable' | 'slide' | 'modal' | null>(null);

    const demoStats = {
        totalHours: 127.5,
        totalDays: 5.3,
        movieCount: 45,
        episodeCount: 89,
        breakdown: {
            movies: { hours: 78, minutes: 30, percentage: 62 },
            series: { hours: 49, minutes: 0, percentage: 38 }
        },
        dailyAverage: 45,
        weeklyAverage: 315,
        monthlyAverage: 1350
    };

    const formatTime = (hours: number, minutes: number) => {
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="p-8 space-y-8 bg-background min-h-screen">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Watch Time Widget Animation Demos
                </h1>
                <p className="text-muted-foreground">Click on any widget to see the animation in action</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Expandable Card Demo */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center">✨ Expandable Card (Recommended)</h2>
                    <div className="grid grid-cols-2 gap-4 min-h-[400px]">
                        <div
                            className={`floating-card rounded-xl transition-all duration-500 ease-out relative overflow-hidden cursor-pointer ${
                                activeDemo === 'expandable'
                                    ? 'col-span-2 row-span-2 p-6 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 z-10'
                                    : 'p-4 hover:bg-card/80 hover:scale-[1.02] hover:shadow-lg hover:border-primary/10 border border-transparent'
                            }`}
                            onClick={() => setActiveDemo(activeDemo === 'expandable' ? null : 'expandable')}
                        >
                            {/* Compact View */}
                            {activeDemo !== 'expandable' && (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="h-5 w-5 text-blue-400" />
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-bold">127h 30m</div>
                                        <div className="text-xs text-muted-foreground">Watch Time</div>
                                        <div className="text-xs text-muted-foreground">This year</div>
                                    </div>
                                </>
                            )}

                            {/* Expanded View */}
                            {activeDemo === 'expandable' && (
                                <div className="space-y-6 animate-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Clock className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">Watch Time Analytics</h2>
                                                <p className="text-sm text-muted-foreground">Detailed viewing insights</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDemo(null);
                                            }}
                                            className="p-2 hover:bg-muted/50 rounded-lg transition-colors group"
                                        >
                                            <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    {/* Main Stats */}
                                    <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-6 text-center border border-blue-500/20 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                                        <div className="relative z-10">
                                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-in zoom-in-50 duration-700">
                                                127h 30m
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                <span>(5.3 days) • This year</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-3">
                                            <div className="text-lg font-bold text-green-400">45m</div>
                                            <div className="text-xs text-muted-foreground">Per Day</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-3">
                                            <div className="text-lg font-bold text-blue-400">5h 15m</div>
                                            <div className="text-xs text-muted-foreground">Per Week</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-3">
                                            <div className="text-lg font-bold text-purple-400">22h 30m</div>
                                            <div className="text-xs text-muted-foreground">Per Month</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Placeholder cards */}
                        {activeDemo !== 'expandable' && (
                            <>
                                <div className="floating-card rounded-xl p-4 opacity-50">
                                    <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                                    <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                                    <div className="h-4 w-20 bg-muted rounded"></div>
                                </div>
                                <div className="floating-card rounded-xl p-4 opacity-50">
                                    <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                                    <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                                    <div className="h-4 w-20 bg-muted rounded"></div>
                                </div>
                                <div className="floating-card rounded-xl p-4 opacity-50">
                                    <div className="h-5 w-5 bg-muted rounded mb-2"></div>
                                    <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                                    <div className="h-4 w-20 bg-muted rounded"></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Slide Panel Demo */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center">📱 Slide Panel</h2>
                    <div className="relative">
                        <div
                            className="floating-card rounded-xl p-4 cursor-pointer hover:bg-card/80 hover:scale-[1.02] transition-all"
                            onClick={() => setActiveDemo(activeDemo === 'slide' ? null : 'slide')}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="h-5 w-5 text-blue-400" />
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">127h 30m</div>
                                <div className="text-xs text-muted-foreground">Watch Time</div>
                                <div className="text-xs text-muted-foreground">This year</div>
                            </div>
                        </div>

                        {/* Slide Panel */}
                        <div className={`absolute top-0 right-0 w-80 h-96 bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 z-20 ${
                            activeDemo === 'slide' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                        }`}>
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Watch Time Details</h3>
                                    <button
                                        onClick={() => setActiveDemo(null)}
                                        className="p-1 hover:bg-muted rounded"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">127h 30m</div>
                                    <div className="text-sm text-muted-foreground">Total watch time</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Movies (45)</span>
                                        <span>78h 30m</span>
                                    </div>
                                    <div className="w-full bg-muted/30 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full w-[62%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Demo */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-center">🪟 Modal (Old Style)</h2>
                    <div
                        className="floating-card rounded-xl p-4 cursor-pointer hover:bg-card/80 hover:scale-[1.02] transition-all"
                        onClick={() => setActiveDemo(activeDemo === 'modal' ? null : 'modal')}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="h-5 w-5 text-blue-400" />
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-bold">127h 30m</div>
                            <div className="text-xs text-muted-foreground">Watch Time</div>
                            <div className="text-xs text-muted-foreground">This year</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {activeDemo === 'modal' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Watch Time Analytics</h3>
                                <button
                                    onClick={() => setActiveDemo(null)}
                                    className="p-2 hover:bg-muted rounded-lg"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                <div className="text-3xl font-bold text-blue-400">127h 30m</div>
                                <div className="text-sm text-muted-foreground mt-2">(5.3 days) • This year</div>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">
                                This is the old modal approach - less contextual and harder to navigate
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Benefits Section */}
            <div className="max-w-4xl mx-auto mt-12 p-6 bg-muted/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-center">Why Expandable Cards Are Better</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center space-y-2">
                        <div className="text-2xl">🎯</div>
                        <div className="font-medium">Contextual</div>
                        <div className="text-muted-foreground">Expands in place, maintaining context</div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-2xl">📱</div>
                        <div className="font-medium">Mobile Friendly</div>
                        <div className="text-muted-foreground">Works great on all screen sizes</div>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-2xl">⚡</div>
                        <div className="font-medium">Modern UX</div>
                        <div className="text-muted-foreground">Smooth animations, no jarring transitions</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchTimeWidgetDemo;
