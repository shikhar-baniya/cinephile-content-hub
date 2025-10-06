import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Film, Eye, Star, Play, BarChart3, Calendar, TrendingUp } from "lucide-react";

const LockedStatsPreview = () => {
    return (
        <div className="grid gap-6 relative min-h-[600px]">
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-background/50 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-4 bg-background/95 p-8 rounded-lg border-2 border-primary/50 shadow-2xl max-w-md mx-4">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Lock className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Analytics Locked</h3>
                        <p className="text-muted-foreground">
                            Complete the watching requirements above to unlock detailed statistics and insights about your viewing habits.
                        </p>
                    </div>
                    <div className="pt-2 text-sm text-muted-foreground">
                        Track your progress in the banner above! 📊
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-40 blur-sm select-none pointer-events-none">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                        <Film className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">••</div>
                        <p className="text-xs text-muted-foreground">Your collection</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Watched</CardTitle>
                        <Eye className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">••</div>
                        <p className="text-xs text-muted-foreground">Completed items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">•.•</div>
                        <p className="text-xs text-muted-foreground">Your ratings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Currently Watching</CardTitle>
                        <Play className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">••</div>
                        <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-40 blur-sm select-none pointer-events-none">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Top Genres
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                        <div className="text-muted-foreground">Genre breakdown</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Watch Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-48 flex items-center justify-center">
                        <div className="text-muted-foreground">Viewing timeline</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="opacity-40 blur-sm select-none pointer-events-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Progress Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-32 flex items-center justify-center">
                    <div className="text-muted-foreground">Completion statistics</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LockedStatsPreview;
